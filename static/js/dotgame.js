// These functions don't care about controls on our gameboard.
// They only need line numbers and box numbers to communicate with
// the server. The functions return line and box numbers to our
// custom.js to make changes to our gameboard controls.

// Store line state, history, and score in local storage to make sure we do not lose the
// values on page refresh.
function pushMove(move)
{
    let history = getHistory();
    // Add the move to our history and to the lines array
    history.push(move);
    localStorage.setItem('History', JSON.stringify(history));
    let lines = getLines();
    let line = move[0];
    lines[line] = 1;
    localStorage.setItem('Lines', JSON.stringify(lines));
    return history;
}

function updateScore(player, pointsToAdd)
{
    let key = 'Player1';
    // Add the points to the player's existing score and store.
    if (player = 2)
        key = 'Player2';
    let score = getScore(player);
    let newScore = score + pointsToAdd;
    localStorage.setItem(key, newScore);
    return newScore;
}

// Pop the last move from storage. 
function popLastMove()
{
    let moves = getHistory();
    let popped = moves.pop();
    localStorage.setItem('History');
    return popped;
}

function clearGameValues()
{
    localStorage.removeItem('History');
    localStorage.removeItem('Lines');
    localStorage.removeItem('Player1');
    localStorage.removeItem('Player2');
}

// Draw the indicated lines and box claims on the game board
// moves is a list of tuples (line_id, box_id), (line_id, box_id), ...
function drawMove(moves, bAnimate=true)
{
    // Send the indicated move to the server and get return value
    // Set the line on the gameboard and possibly claim the square
    // Push our storage
    // Do we need to toggle the move?
    return;
}

// Remove the indicated lines and box claims from the game board
// moves is a list of tuples (line_id, box_id), (line_id, box_id), ...
function eraseMove(moves, bAnimate=true)
{
    return;
}

// Return a list of all moves
function getHistory()
{
    let history = localStorage.getItem('History');
    if (history)
        history = JSON.parse(history);
    else
        history = INIT_MOVES;
    return history;
}

// Return the state of all game board lines
function getLines()
{
    let lines = localStorage.getItem('Lines');
    if (lines)
        lines = JSON.parse(lines);
    else
        lines = INIT_LINES;
    return lines;
}

// Return the score for the indicated player 1 or 2
function getScore(player)
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
function getPlayer()
{
    return;
}