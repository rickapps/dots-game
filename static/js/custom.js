// Respond to events mostly triggered by dotgame.js
// Functions included in this file are specific to our UI. If we change
// the UI, we will probably need to modify several of these functions.

//////////////////////////////////
// INITIALIZATION 
//////////////////////////////////
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
// ADD EVENT LISTENERS 
//////////////////////////////////

// Page loaded - including style sheets
window.addEventListener("load", restoreGame);

// Add an event listener to all the lines on our gameboard.
// We need to take action when a user clicks a line.
let gameboard = document.getElementById("gameboard");
//let anchors = gameboard.getElementsByTagName("a");
//for (let anchor of anchors) {
//    anchor.addEventListener("click", playerMove, false);
//}
// Alternate way to listen - not sure if it is better
gameboard.addEventListener("click", (event) => {
    if (event.target.tagName.toLowerCase() === "a") {
      playerMove(event);
    }
});

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

///////////////////////////////////
// EVENTS TRIGGERED FROM DOTGAME.JS
//////////////////////////////////
// Add event listener to update the gameboard
// The arg for event is array of [line,box1,box2]
// Drawing a single line could complete up to two boxes.
document.addEventListener("drawMove", drawMove, false);

// Add event listener to switch to the other player
document.addEventListener("switchPlayer", makeMove, false);

//////////////////////////////////
// EVENT HANDLERS 
//////////////////////////////////
// Response to load event.
// Restore the last game if game size has not changed.
// Since we do not save the size, this only works if
// the last game played used our default size. To make
// this more robust, we could use a cookie to store the
// size of the previous game.
function restoreGame() {
    let lines = getLines();
    let len = lines.length;
    // Make sure our lines match with current game size
    if (len != 2 * GAME_SIZE * (GAME_SIZE + 1))
    {
        // Clear our stored values and start from scratch
        clearGameValues();
        lines = getLines();
    }
    // Draw the lines we obtained from storage
    let element;
    for (let i=0; i<len; i++) {
        if (lines[i] > 0)
        {
            element = document.getElementById(i.toString());
            element.classList.add("selected");   
        }
    }
    // Check if any squares should be filled.
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
};


// Response to click event.
// Human player has selected a line. Get the line
// number and validate it with the server. validateMove
// will draw the line and claim any approprate boxes.
function playerMove(evt) {
    let move = validateMove(parseInt(evt.target.id));
} 

// Response to drawMove event.
// Draw a single move on the gameboard.
function drawMove(evt) {
    let move = evt.detail.move;
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
};


////////////////////////////////
// HELPER FUNCTIONS
///////////////////////////////
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
