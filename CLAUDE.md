# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

```bash
python main.py          # run locally with Flask dev server (debug=True)
```

The app is deployed to Google App Engine (Python 3.8 runtime, see `app.yaml`). There are no tests and no build step.

## Architecture Overview

This is a Flask web app implementing the Dots and Boxes game. The server is thin — it does board math, the client does everything else.

### Python (server)

| File | Role |
|------|------|
| `main.py` | Flask routes only. No game logic lives here. |
| `dotgame.py` | Public API consumed by the routes: `init_game`, `game_board`, `find_move`, `verify_move`. |
| `gameboard.py` | `GameBoard` class — all board geometry and move validation. The AI logic (`find_best_nonscoring_move`) is in `dotgame.py` and deliberately plays imperfectly (no lookahead) so the game stays fun. |

**Data model:** A game is represented by two flat arrays:
- `lines` — one int per line segment (0=undrawn, 1=drawn). Length = `2*(size² + size)`.
- `claims` — one int per box (0=unclaimed, player number=claimed). Length = `size²`.

Line numbering: indices `0..(size²+size-1)` are horizontal lines, the rest are vertical. `GameBoard` encapsulates all index arithmetic.

**Move tuple:** `(line, box1, box2)`. `box` values are `-1` if no box was completed. A sentinel `(-1, -1, -1)` signals game over.

### JavaScript (client)

| File | Role |
|------|------|
| `static/js/dotgame.js` | `GameStorage` class (all localStorage I/O) + API fetch calls (`validateMove`, `makeMove`). Also holds pure helpers: geometry (`getAdjacentLine`, `getBoxNum`), game-state queries (`soloPlayer`, `isMachineTurn`). |
| `static/js/mainpage.js` | DOM manipulation and animation for the game page. Listens for the `displayMoves` custom event and drives the move queue. |
| `static/js/startup.js` | Logic for the landing page (`startup.html`) — resume or new game. |

**State flow:**
1. User/machine triggers a move → POST to `/verify/` or `/find/`.
2. Server returns a list of move tuples.
3. Client pushes each move onto a localStorage queue (`Queue` key).
4. A `displayMoves` custom event is dispatched; `pydots.showMoves` dequeues and animates one move at a time via `startMove` → `endMove` → `startMove` loop.
5. When the queue is empty and it's the machine's turn, `makeMove()` is called automatically.

**Python→JS bridge:** `templates/includes/jsconstants.html` is a Jinja2 snippet that injects Flask template variables (`size`, `lines`, `reset`) as JS constants (`GAME_SIZE`, `INIT_LINES`, `RESET_STORAGE`). Game configuration arrays (`GAME_LEVELS`, `GAME_THEMES`, `PARTICIPANTS`, etc.) are also defined there and shared by both pages.

**Namespace:** All client-side code attaches to the `pydots` global object. `pydots.dotgame` holds the `GameStorage` singleton and the fetch-level functions. `pydots.*` (in `mainpage.js`) holds DOM/animation functions.

### Templates

- `startup.html` — landing page; offers "Start Game" (clears storage, goes to `/reset/`) or resume (POSTs saved state to `/resume/`).
- `mainpage.html` — game page; assembles the board from Jinja2 `boxes` array. Includes `jsconstants.html`, then loads `dotgame.js`, then `mainpage.js` (order matters).
- `templates/includes/` — shared partials (`header`, `footer`, `panel`, `gameboard`, `jsconstants`).

### Resume Flow

Resuming a game POSTs the `lines` and `claims` arrays as comma-separated strings inside form fields (a known workaround — see comment in `main.py:32`). The server parses them back with `list(map(int, ...))` and re-renders the board.
