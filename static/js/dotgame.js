// These functions don't care about controls on our gameboard.
// They only need line numbers and box numbers to communicate with
// the server. The functions return line and box numbers to our
// custom.js to make changes to our gameboard controls.

// Store line state, history, and score in local storage
function pushStorage(moves)
{
    localStorage.setItem('history', moves);
    localStorage.setItem('lines', moves[0]);
    localStorage.setItem('score', 3);
    return;
}

// Pop the last move from storage. 
function popStorage()
{
    return moves;
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
function history()
{
    return;
}

// Return the state of all game board lines
function getLines()
{
    return;
}

// Return the score for the indicated player 1 or 2
function score(player)
{
    return;
}

// Return the player that has control of the board 1 or 2
function player()
{
    return;
}