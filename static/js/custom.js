// Respond to events mostly triggered by dotgame.js
// Functions included in this file are specific to our UI. If we change
// the UI, we will probably need to modify several of these functions.

// Get the style sheet
let bodyStyles = document.body.style;
// Set variables in our style sheet.
bodyStyles.setProperty('--gridSize', GAME_SIZE);

// Initialize the game size drop down on the panel
let sizeDropDown = document.getElementById("glevel");
sizeDropDown.value = GAME_SIZE;

// Define a function to change our css theme
const changeTheme = theme => document.documentElement.className = theme;
// Set the theme to whatever it was before. We keep that value in localStorage
let theme = getTheme();
if (theme === null) theme = INIT_THEME;
changeTheme(theme);

//////////////////////////////////
// CHANGE CSS THEME 
//////////////////////////////////
let colorDropDown = document.getElementById("gcolors");
colorDropDown.value = theme;
colorDropDown.onchange = function () {
    changeTheme(this.value);
    // Save the value of the theme so we can retrieve it after a POST
    storeTheme(this.value)
}

//////////////////////////////////
// START NEW GAME 
//////////////////////////////////
let newGame = document.getElementById("gamevals");
newGame.onsubmit = function() {
    // Verify it is what our user wants to do
    alert("This will end your current game.")
    // Clear our local storage values
    clearGameValues();
}

//////////////////////////////////
// PAGE LOAD COMPLETE 
//////////////////////////////////
window.addEventListener("load", () => {
    // Obtain the current lines
    let lines = getLines();
    let len = lines.length;
    // Make sure our lines match with current game size
    if (len != 2 * GAME_SIZE * (GAME_SIZE + 1))
    {
        // Clear our stored values and start from scratch
        clearGameValues();
        lines = getLines();
    }
    let element;
    for (let i=0; i<len; i++) {
        if (lines[i] > 0)
        {
            element = document.getElementById(i.toString());
            element.classList.add("selected");   
        }
    }
    let claims = getClaims();
    len = claims.length;
    for (let i=0; i<len; i++) {
        if (claims[i] >= 0)
        {
            element = document.getElementById("B-" + i.toString());
            let claim = claims[i] == 1 ? "claim1" : "claim2";
            element.classList.add(claim);
        }
    }
});

// Add an event listener to all the lines on our gameboard.
let gameboard = document.getElementById("gameboard");
let lines = gameboard.getElementsByTagName("a");
for (let line of lines) {
    line.addEventListener("click", player1Move, false);
}

// Human player has selected a line. Get the line
// number and validate it with the server. validateMove
// will draw the line and claim any approprate boxes.
function player1Move(evt) {
    let move = validateMove(parseInt(evt.target.id));
} 

// Add event listener for player2 move
document.addEventListener("makeMove", makeMove, false);

// Add an event listener to update the gameboard when a
// player makes a move.
document.addEventListener("drawMove", (e) => {
    let move = e.detail.move;
    if (move[0] >= 0)
    {
        // Store the move
        pushMove(move)
        // draw our line
        let line = document.getElementById(move[0].toString());
        line.classList.add("selected");
        // claim any squares
        if (!claimSquares(move, 1))
        {
            // toggle turn
        }
    }
});

// Check if the move claims any squares. If so, update the
// gameboard with the player's color, update the player's
// score and return true. Otherwise, do nothing and return false.
// This function can update two squares - move[1] and move[2]
function claimSquares(move, player) {
    let points = 0;
    if (move[1] >= 0)
    {
        points += 1;
        fillSquare(move[1], player);
    }
    if (move[2] >= 0)
    {
        points += 1;
        fillSquare(move[2], player);
    }
    updateScore(player, points);
    return points > 0;
}

// Color the square with the player's color
function fillSquare(boxNum, player)
{
    let square = document.getElementById("B-" + boxNum);
    let claim = player == 1 ? "claim1" : "claim2";
    square.classList.add(claim);
}
