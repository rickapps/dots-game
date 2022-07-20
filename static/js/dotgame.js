// Javascript functions that communicate with the server.
// Based on server responses, events are triggered. These
// events are handled by functions in file custom.js.
var pydots = pydots || {};
pydots.dotgame= pydots.dotgame || {};
//
// Store line state, history, and score in local storage to make sure we do not lose the
// values on page refresh.
pydots.dotgame.pushMove = function (move)
{
    let history = pydots.dotgame.getHistory();
    // Add the move to our history
    history.push(move);
    localStorage.setItem('History', JSON.stringify(history));
    // Add the move to our lines array
    let lines = pydots.dotgame.getLines();
    let line = move[0];
    lines[line] = 1;
    localStorage.setItem('Lines', JSON.stringify(lines));
    // Add the move to our claims array 
    if (move[1] + move[2] > -2)
    {
        let claims = pydots.dotgame.getClaims();
        if (move[1] >= 0)
        {
            claims[move[1]] = pydots.dotgame.getPlayer();
        }
        if (move[2] >= 0)
        {
            claims[move[2]] = pydots.dotgame.getPlayer();
        }
        localStorage.setItem('Claims', JSON.stringify(claims));
    }
    return history;
}

// Update our scores. Trigger event to notify UI.
pydots.dotgame.updateScore = function (player, pointsToAdd)
{
    let key = 'Player1';
    // Add the points to the player's existing score and store.
    if (player = 2)
        key = 'Player2';
    let score = pydots.dotgame.getScore(player);
    let newScore = score + pointsToAdd;
    localStorage.setItem(key, newScore);
    return newScore;
}

// Pop the last move from storage. 
pydots.dotgame.popLastMove = function ()
{
    let moves = pydots.dotgame.getHistory();
    let popped = moves.pop();
    localStorage.setItem('History');
    return popped;
}

// Clear all game specific values from storage
pydots.dotgame.clearGameValues = function ()
{
    localStorage.removeItem('History');
    localStorage.removeItem('Lines');
    localStorage.removeItem('Claims');
    localStorage.removeItem('Player1');
    localStorage.removeItem('Player2');
}

// Send the user's desired move to the server to determine if it
// completes any squares. Returns a tuple (lineNum, box1, box2)
// Failure is indicated by (-1,-1,-1). Triggers other events to
// notify UI.
pydots.dotgame.validateMove = function (line, bAnimate=true)
{
    var validated = [-1,-1,-1];
    // Send a POST request to the server informing it of our move
    // The body of the request contains the current game state.
    let specs = {
        "size": GAME_SIZE,
        "lines": pydots.dotgame.getLines(),
        "newline": line
    }
    // Tell fetch we want a POST using JSON data
    // and send the request.
    let options = {
        method: 'POST',
        headers: {
            'Content-Type':
                'application/json;charset=utf-8'
        },
        body: JSON.stringify(specs)
    }
    let fetchRes = fetch('/verify/', options);
    fetchRes.then(res =>
        res.json()).then(d => {
            for (let i=0;i<3;i++) {
                validated[i] = d[i];
            }
            // Do it here so it updates the page
            let event = new CustomEvent("drawMove", {detail: {move: d}});
            document.dispatchEvent(event);
            if (d[1] < 0 && d[2] < 0)
            {
                // Move to the other player
                event = new CustomEvent("switchPlayer");
                document.dispatchEvent(event);
            }
        }
    );
    return validated;
}

// Ask the computer for its move(s). For each move,
// trigger drawMove event and others to notify UI.
pydots.dotgame.makeMove = function ()
{
    let moves = [];
    let event;
    // Send a POST request to the server asking for the best move.
    // The body of the request contains the current game state.
    let specs = {
        "size": GAME_SIZE,
        "lines": pydots.dotgame.getLines()
    }
    // Tell fetch we want a POST using JSON data
    // and send the request.
    let options = {
        method: 'POST',
        headers: {
            'Content-Type':
                'application/json;charset=utf-8'
        },
        body: JSON.stringify(specs)
    }
    let fetchRes = fetch('/find/', options);
    fetchRes.then(res =>
        res.json()).then(d => {
                d.forEach(move => {
                    moves.push(move);
                    event = new CustomEvent("drawMove", {detail: {move: move}});   
                    document.dispatchEvent(event);
                });
            });
    // Move to the other player
    //event = new CustomEvent("switchPlayer");
    //document.dispatchEvent(event);
    return moves;
}

// Remove the indicated lines and box claims from the game board
// moves is a list of tuples (line_id, box_id), (line_id, box_id), ...
pydots.dotgame.eraseMove = function (moves, bAnimate=true)
{
    return;
}

// Record the specified theme to storage
pydots.dotgame.storeTheme = function (theme)
{
    localStorage.setItem('Theme', theme);
}

// Retrieve the last theme from storage
pydots.dotgame.getTheme = function ()
{
    let theme = localStorage.getItem('Theme');
    return theme;
}


// Return a list of all moves
pydots.dotgame.getHistory = function ()
{
    let history = localStorage.getItem('History');
    if (history)
        history = JSON.parse(history);
    else
        history = INIT_MOVES;
    return history;
}

// Return the state of all game board lines
pydots.dotgame.getLines = function ()
{
    let lines = localStorage.getItem('Lines');
    if (lines)
        lines = JSON.parse(lines);
    else
        lines = INIT_LINES;
    return lines;
}

// Return the state of all game board squares
pydots.dotgame.getClaims = function ()
{
    let claims = localStorage.getItem('Claims');
    if (claims)
        claims = JSON.parse(claims);
    else
        claims = INIT_CLAIMS;
    return claims;
}

// Return the score for the indicated player 1 or 2
pydots.dotgame.getScore = function (player)
{
    let key = 'Player1';
    if (player == 2)
        key = 'Player2';
    let score = localStorage.getItem(key);
    if (!score)
        score = 0;
    return score;
}

// Return the player that has control of the board 1 or 2
pydots.dotgame.getPlayer = function ()
{
    return 1;
}