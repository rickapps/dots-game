// Copyright (c) 2022 Rick Eichhorn
// Latest source available at: https://github.com/rickapps/dots-game
// rick@rickapps.com
// August 1, 2022
//
// Javascript functions that communicate with the server.
// Based on server responses, events are triggered. These
// events are handled by functions in file mainpage.js.
// If you want to modify the look of the game, you should
// probably edit mainpage.js instead of this file.
var pydots = pydots || {};
pydots.dotgame = pydots.dotgame || {};

// Store line state, history, and claims in local storage to make sure we do not lose the
// values on page refresh.
pydots.dotgame.pushMove = (move) => {
  const history = pydots.dotgame.getHistory();
  // Add the move to our history
  history.push(move);
  localStorage.setItem('History', JSON.stringify(history));
  // Add the move to our lines array
  const lines = pydots.dotgame.getLines();
  const line = move[0];
  lines[line] = 1;
  localStorage.setItem('Lines', JSON.stringify(lines));
  // Add the move to our claims array
  if (move[1] + move[2] > -2) {
    const claims = pydots.dotgame.getClaims();
    if (move[1] >= 0) {
      claims[move[1]] = pydots.dotgame.getPlayer();
    }
    if (move[2] >= 0) {
      claims[move[2]] = pydots.dotgame.getPlayer();
    }
    localStorage.setItem('Claims', JSON.stringify(claims));
  }
  return history;
};

// Update our scores. Return the number of points added
// to the current player's score by the specified move
pydots.dotgame.calculateScore = (move) => {
  let add = 0;
  if (move[1] >= 0) add += 1;
  if (move[2] >= 0) add += 1;
  if (add > 0) {
    const player = pydots.dotgame.getPlayer();
    const scores = JSON.parse(localStorage.getItem('Scores'));
    const newScore = scores[player] + add;
    scores[player] = newScore;
    localStorage.setItem('Scores', JSON.stringify(scores));
  }
  return add;
};

// Pop the last move from storage.
pydots.dotgame.popLastMove = () => {
  const moves = pydots.dotgame.getHistory();
  const popped = moves.pop();
  localStorage.setItem('History', JSON.stringify(moves));
  return popped;
};

// Clear all game specific values from storage
pydots.dotgame.clearGameValues = () => {
  localStorage.setItem('History', JSON.stringify(INIT_MOVES)); // Remove does not remove the key
  localStorage.removeItem('Lines');
  localStorage.setItem('Claims', JSON.stringify([])); // Remove does not remove the key
  // Set the current player back to player 1
  localStorage.setItem('Player', JSON.stringify(1));
  // Reset game scores to zeros
  localStorage.setItem('Scores', JSON.stringify(INIT_SCORE));
};

// Retrieve saved game from localstorage and POST it to server
// Need to try different way. Cannot get fetch to change url.
// Will try to use js to modify the request header, but still
// post using an html form.
pydots.dotgame.resumeGame = () => {
  const game = {
    size: pydots.dotgame.getLevel(),
    theme: pydots.dotgame.getTheme(),
    lines: pydots.dotgame.getLines(),
    claims: pydots.dotgame.getClaims(),
  };
  // Tell fetch we want a POST using JSON data
  // and send the request.
  const options = {
    method: 'POST',
    headers: {
      'Content-Type':
                'application/json;charset=utf-8',
    },
    body: JSON.stringify(game),
  };
  const fetchRes = fetch('/resume/', options);
  fetchRes.then((res) => res.text()).then((data) => data);
};

// A human player has drawn one line on the gameboard.
// Send the user's desired move to the server to determine if it
// completes any squares. The server returns a tuple containing
// (lineNum, box1, box2) where box1 and box2 indicate any completed
// squares. A value of -1 means square not completed.
// End game if move is (-1,-1,-1). Triggers other events to
// notify UI.
pydots.dotgame.validateMove = (line, bAnimate = true) => {
  const moves = [];
  let event;
  // Send a POST request to the server informing it of our move
  // The body of the request contains the current game state.
  const specs = {
    size: GAME_SIZE,
    lines: pydots.dotgame.getLines(),
    newline: line,
  };
  // Tell fetch we want a POST using JSON data
  // and send the request.
  const options = {
    method: 'POST',
    headers: {
      'Content-Type':
                'application/json;charset=utf-8',
    },
    body: JSON.stringify(specs),
  };
  const fetchRes = fetch('/verify/', options);
  fetchRes.then((res) => res.json()).then((d) => {
    d.forEach((move) => {
      // The final move in the list may signal the game is over
      const gameIsOver = pydots.dotgame.gameOver(move);
      if (gameIsOver) {
        event = new CustomEvent('gameOver');
        document.dispatchEvent(event);
      } else {
        moves.push(move);
        // Send an event to update the UI
        event = new CustomEvent('drawMove', { detail: { move } });
        document.dispatchEvent(event);
        // Update our internal score
        if (pydots.dotgame.calculateScore(move) > 0) {
          // Send an event to update the scoreboard on the UI
          event = new CustomEvent('updateScore');
          document.dispatchEvent(event);
        } else {
          // Move to the other player
          pydots.dotgame.switchPlayers();
          event = new CustomEvent('updatePlayer');
          document.dispatchEvent(event);
        }
      }
    });
  });
};

// Ask the computer for its move(s). For each move,
// trigger drawMove event and others to notify UI.
pydots.dotgame.makeMove = () => {
  const moves = [];
  let event;
  // Send a POST request to the server asking for the best move.
  // The body of the request contains the current game state.
  const specs = {
    size: GAME_SIZE,
    lines: pydots.dotgame.getLines(),
  };
  // Tell fetch we want a POST using JSON data
  // and send the request.
  const options = {
    method: 'POST',
    headers: {
      'Content-Type':
                'application/json;charset=utf-8',
    },
    body: JSON.stringify(specs),
  };
  const fetchRes = fetch('/find/', options);
  fetchRes.then((res) => res.json()).then((d) => {
    d.forEach((move) => {
      // A list of moves is returned. The final entry in the
      // list may indicate the game has ended.
      const gameIsOver = pydots.dotgame.gameOver(move);
      if (gameIsOver) {
        // Tell the UI the game is ended
        event = new CustomEvent('gameOver');
        document.dispatchEvent(event);
      } else {
        moves.push(move);
        // We have a valid move - update the gameboard
        event = new CustomEvent('drawMove', { detail: { move } });
        document.dispatchEvent(event);
        // Do we need to update the score?
        if (pydots.dotgame.calculateScore(move) > 0) {
          // Send event to update the score
          event = new CustomEvent('updateScore');
          document.dispatchEvent(event);
        } else {
          // Machine turn has ended. Switch to human player
          pydots.dotgame.switchPlayers();
          event = new CustomEvent('updatePlayer');
          document.dispatchEvent(event);
        }
      }
    });
  });
};

// True if game over
pydots.dotgame.gameOver = (move) => (move[0] < 0);

// Remove the indicated lines and box claims from the game board.
// moves is a list of tuples (line_id, box_id), (line_id, box_id), ...
pydots.dotgame.eraseMove = (moves, bAnimate = true) => {

};

// Write the specified theme to storage
pydots.dotgame.storeTheme = (theme) => {
  localStorage.setItem('Theme', theme);
};

// Retrieve the last theme from storage
pydots.dotgame.getTheme = () => {
  let theme = localStorage.getItem('Theme');
  if (theme === null) theme = INIT_THEME;
  return theme;
};

// Store the skill level of the current game
pydots.dotgame.storeLevel = (level) => {
  localStorage.setItem('Level', JSON.stringify(level));
};

// Retrieve the skill level from storage
pydots.dotgame.getLevel = () => {
  let level = localStorage.getItem('Level');
  if (level) { level = JSON.parse(level); } else { level = GAME_SIZE; }

  return level;
};

// Get the skill level name
pydots.dotgame.getLevelName = () => {
  const level = pydots.dotgame.getLevel();
  let name = 'Not found';
  for (let i = 0; i < GAME_LEVELS.length; i += 1) {
    if (level === GAME_LEVELS[i][1]) {
      name = GAME_LEVELS[i][0];
      break;
    }
  }
  return name;
};

// Retrieve the number of players from storage
pydots.dotgame.getNumPlayers = () => {
  const num = JSON.parse(localStorage.getItem('NumPlayers'));
  return num;
};

// Store the name of the specified player in storage
pydots.dotgame.storePlayerName = (player, name) => {
  let names = localStorage.getItem('Name');
  if (names) { names = JSON.parse(names); } else { names = INIT_NAMES; }
  names[player] = name;
  localStorage.setItem('Names', JSON.stringify(names));
};

// Retrieve the name of the specified player from storage
pydots.dotgame.getPlayerName = (player) => {
  let names = localStorage.getItem('Names');
  if (names) { names = JSON.parse(names); } else { names = INIT_NAMES; }

  return names[player];
};

// Return a list of all moves.
pydots.dotgame.getHistory = () => {
  let history = localStorage.getItem('History');
  if (history) { history = JSON.parse(history); } else { history = INIT_MOVES; }
  return history;
};

// Return the state of all game board lines
pydots.dotgame.getLines = () => {
  let lines = localStorage.getItem('Lines');
  if (lines) { lines = JSON.parse(lines); } else { lines = INIT_LINES; }
  return lines;
};

// Return the state of all game board squares
// We call them claims when the squares are complete.
pydots.dotgame.getClaims = () => {
  let claims = localStorage.getItem('Claims');
  if (claims) { claims = JSON.parse(claims); } else { claims = []; }

  if (claims.length === 0) { claims = new Array(pydots.dotgame.getLevel() ** 2).fill(0); }
  return claims;
};

// Return the score for the indicated player
// If it comes back negative, we have an error
pydots.dotgame.getScore = (player) => {
  let score = -1;
  const scores = JSON.parse(localStorage.getItem('Scores'));
  if (scores) { score = scores[player]; }
  return score;
};

// Set the number of players: 2,3,or 4. Indicate which player
// is the computer: 0,1,2,3,or 4. 0 means all players are
// human. storePlayers(4,0) all are human. storePlayers(4,2)
// means player 2 is the computer.
pydots.dotgame.storePlayers = (numPlayers, machine) => {
  // Error if numbers are not within range
  if (numPlayers < 2 || numPlayers > 4) { throw new Error('Number of players must be between 2 and 4'); }
  if (machine < 0 || machine > numPlayers) { throw new Error('Machine player cannot be greater than numPlayers'); }
  localStorage.setItem('NumPlayers', JSON.stringify(numPlayers));
  localStorage.setItem('Machine', JSON.stringify(machine));
  // Start with 1. The number denotes which player has control of the board:
  // (1,2,3, or 4).
  localStorage.setItem('Player', JSON.stringify(Number(1)));
  // Set up the scores for the players
  const score = [];
  const name = [];
  for (let i = 0; i <= numPlayers; i += 1) {
    // Player zero is the machine. The array[0] is not used
    score.push(0);
    name.push('');
  }
  localStorage.setItem('Scores', JSON.stringify(score));
  localStorage.setItem('Names', JSON.stringify(name));
};

// Return the player that has control of the board
pydots.dotgame.getPlayer = () => {
  const player = JSON.parse(localStorage.getItem('Player'));
  return player;
};

// Return true if it is the machine's turn.
pydots.dotgame.isMachineTurn = () => {
  const player = this.getPlayer();
  return player === this.getMachinePlayer();
};

// Which player is the machine?
pydots.dotgame.getMachinePlayer = () => {
  const machine = JSON.parse(localStorage.getItem('Machine'));
  return machine;
};

// Set the current player to the next player
pydots.dotgame.switchPlayers = () => {
  const numPlayers = this.getNumPlayers();
  let player = this.getPlayer();
  // Move to the next player
  player = (player === numPlayers) ? 1 : player + 1;
  localStorage.setItem('Player', JSON.stringify(player));
  return player;
};
