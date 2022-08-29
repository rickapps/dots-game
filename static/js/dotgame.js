// Latest source available at: https://github.com/rickapps/dots-game
// rick@rickapps.com
// August 1, 2022
//
// Javascript functions that communicate with the server.
// Based on server responses, events are triggered. These
// events are handled by functions in file custom.js.
// If you want to modify the look of the game, you should
// probably edit custom.js instead of this file.
var pydots = pydots || {};
pydots.dotgame= pydots.dotgame || {};

// If the machine is not playing, it will be 0. Otherwise,
// it is 1,2,3,or 4. We default to the second player.
let machinePlayer = 2;

// Store line state, history, and claims in local storage to make sure we do not lose the
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

// Update our scores. Return the number of points added
// to the current player's score by the specified move
pydots.dotgame.calculateScore = function (move)
{
    let add = 0;
    if (move[1] >= 0)
        add = add + 1;
    if (move[2] >= 0)
        add = add + 1;
    if (add > 0)
    {
        let player = pydots.dotgame.getPlayer();
        let scores = JSON.parse(localStorage.getItem('Scores'));
        let newScore = scores[player] + add;
        scores[player] = newScore;
        localStorage.setItem('Scores', JSON.stringify(scores));
    }
    return add;
}

// Pop the last move from storage. 
pydots.dotgame.popLastMove = function ()
{
    let moves = pydots.dotgame.getHistory();
    let popped = moves.pop();
    localStorage.setItem('History', JSON.stringify(moves));
    return popped;
}

// Clear all game specific values from storage
pydots.dotgame.clearGameValues = function ()
{
    localStorage.removeItem('History');
    localStorage.removeItem('Lines');
    localStorage.removeItem('Claims');
    localStorage.removeItem('Scores');
}

// A human player has drawn one line on the gameboard.
// Send the user's desired move to the server to determine if it
// completes any squares. The server returns a tuple containing
// (lineNum, box1, box2) where box1 and box2 indicate any completed
// squares. A value of -1 means square not completed.
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
            // Send an event to update the UI
            let event = new CustomEvent("drawMove", {detail: {move: d}});
            document.dispatchEvent(event);
            // Update our internal score
            let points = pydots.dotgame.calculateScore(d);
            if (points > 0)
            {
                // Send an event to update the scoreboard on the UI
                let event = new CustomEvent("updateScore");
            }
            else
            {
                // Move to the other player
                pydots.dotgame.switchPlayers();
                event = new CustomEvent("updatePlayer");
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
                    // Update the score
                    if (pydots.dotgame.calculateScore(move) > 0)
                    {
                        // Send event to update the score
                        event = new CustomEvent("updateScore");
                    }
                });
                // Machine turn has ended. Switch to human player
                pydots.dotgame.switchPlayers();
                event = new CustomEvent("switchPlayer");
                document.dispatchEvent(event);
            });
    return moves;
}

// Remove the indicated lines and box claims from the game board.
// moves is a list of tuples (line_id, box_id), (line_id, box_id), ...
pydots.dotgame.eraseMove = function (moves, bAnimate=true)
{
    return;
}

// Write the specified theme to storage
pydots.dotgame.storeTheme = function (theme)
{
    localStorage.setItem('Theme', theme);
}

// Retrieve the last theme from storage
pydots.dotgame.getTheme = function ()
{
    let theme = localStorage.getItem('Theme');
    if (theme === null) theme = INIT_THEME;
    return theme;
}

// Store the skill level of the current game
pydots.dotgame.storeLevel = function(level)
{
    localStorage.setItem('Level', JSON.stringify(level));
}

// Retrieve the skill level from storage
pydots.dotgame.getLevel = function()
{
    let level = localStorage.getItem('Level');
    if (level)
        level = JSON.parse(level);
    else
        level = GAME_SIZE;

    return level;
}

// Get the skill level name
pydots.dotgame.getLevelName = function()
{
    let level = pydots.dotgame.getLevel();
    let name = 'Not found';
    for (let i=0; i<GAME_LEVELS.length; i++)
    {
        if (level == GAME_LEVELS[i][1])
        {
            name = GAME_LEVELS[i][0];
            break;
        }
    }
    return name;
}

// Retrieve the number of players from storage
pydots.dotgame.getNumPlayers = function()
{
    let num = JSON.parse(localStorage.getItem('NumPlayers'));
    return num;
}

// Store the name of the specified player in storage
pydots.dotgame.storePlayerName = function(player, name)
{
    let names = localStorage.getItem('Name');
    if (names)
        names = JSON.parse(names);
    else
        names = INIT_NAMES;
    names[player] = name;
    localStorage.setItem('Names', JSON.stringify(names));
}

// Retrieve the name of the specified player from storage
pydots.dotgame.getPlayerName = function(player)
{
    let names = localStorage.getItem('Names');
    if (names)
        names = JSON.parse(names);
    else
        names = INIT_NAMES;

    return names[player];
}

// Return a list of all moves.
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
// We call them claims when the squares are complete.
pydots.dotgame.getClaims = function ()
{
    let claims = localStorage.getItem('Claims');
    if (claims)
        claims = JSON.parse(claims);
    else
        claims = INIT_CLAIMS;
    return claims;
}

// Return the score for the indicated player
// If it comes back negative, we have an error
pydots.dotgame.getScore = function (player)
{
    let score = -1;
    let scores = localStorage.getItem('Scores');
    if (scores)
        score = scores[player];
    return score;
}

// Set the number of players: 2,3,or 4. Indicate which player
// is the computer: 0,1,2,3,or 4. 0 means all players are
// human. storePlayers(4,0) all are human. storePlayers(4,2)
// means player 2 is the computer.
pydots.dotgame.storePlayers = function(numPlayers, machine)
{
    // Error if numbers are not within range
    if (numPlayers < 2 || numPlayers > 4)
        throw new Error('Number of players must be between 2 and 4');
    if (machine < 0 || machine > numPlayers)
        throw new Error('Machine player cannot be greater than numPlayers');
    localStorage.setItem('NumPlayers', JSON.stringify(numPlayers));
    localStorage.setItem('Machine', JSON.stringify(machine));
    machinePlayer = machine;
    // Start with 1. The number denotes which player has control of the board:
    // (1,2,3, or 4). 
    localStorage.setItem('Player', JSON.stringify(Number(1)));
    // Set up the scores for the players
    let score = [];
    let name = [];
    for (let i = 0; i <= numPlayers; i++)
    {
        // Player zero is the machine. The array[0] is not used
        score.push(0);
        name.push('');
    }
    localStorage.setItem('Scores', JSON.stringify(score));
    localStorage.setItem('Names', JSON.stringify(name));
}

// Return the player that has control of the board
pydots.dotgame.getPlayer = function ()
{
    let player = JSON.parse(localStorage.getItem('Player'));
    return player;
}

// Return true if it is the machine's turn.
pydots.dotgame.isMachineTurn = function()
{
    let player = JSON.parse(localStorage.getItem('Player'));
    return player == machinePlayer;
}

pydots.dotgame.getMachinePlayer = function()
{
    let machine = JSON.parse(localStorage.getItem('Machine'));
    return machine;
}

// Set the current player to the next player
pydots.dotgame.switchPlayers = function ()
{
    let numPlayers = JSON.parse(localStorage.getItem('NumPlayers'));
    let player = JSON.parse(localStorage.getItem('Player'));
    // Move to the next player
    player = (player == numPlayers) ? 1 : player + 1;
    localStorage.setItem('Player', JSON.stringify(player));
    return player;
}

