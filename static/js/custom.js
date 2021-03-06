// Latest source available at: https://github.com/rickapps/dots-game
// rick@rickapps.com
// August 1, 2022
//
// Respond to events mostly triggered by dotgame.js
// This is what you would edit to revise the game UI. You could leave
// dotgame.js alone as it just implements business logic.
// Functions included in custom.js are specific to our UI. If we change
// the UI, we will probably need to modify several of these functions.
var pydots = pydots || {};
//////////////////////////////////
// INITIALIZATION 
//////////////////////////////////
// Get the style sheet
let bodyStyles = document.body.style;
// Set variables in our style sheet.
bodyStyles.setProperty('--gridSize', GAME_SIZE);

// Initialize the game size drop down on the panel
let sizeDropDown = document.getElementById("glevel");
if (sizeDropDown) sizeDropDown.value = GAME_SIZE;

// Define a function to change our css theme
const changeTheme = theme => document.documentElement.className = theme;
// Set the theme to whatever it was before. We keep that value in localStorage
let theme = pydots.dotgame.getTheme();
if (theme === null) theme = INIT_THEME;
changeTheme(theme);

//////////////////////////////////
// ADD EVENT LISTENERS 
//////////////////////////////////
window.addEventListener("DOMContentLoaded", (event) => {
    let gameboard = document.getElementById("gameboard");
    if (gameboard) {
        // Add an event listener to all the lines on our gameboard.
        // When a player clicks on a line, we need to know about it.
        gameboard.addEventListener("click", (event) => {
            if (event.target.tagName.toLowerCase() === "a") {
            pydots.playerMove(event);
            }
        });
        // Add event listener to draw a line on the gameboard.
        // The arg for event is array of [line,box1,box2]
        // Drawing a single line could complete up to two boxes.
        document.addEventListener("drawMove", pydots.drawMove, false);
        // Add event listener to update the gameboard with current player.
        document.addEventListener("updatePlayer", pydots.updatePlayer, false);
        // Add event listener to update the score.
        document.addEventListener("updateScore", pydots.updateScore);
        // Add event listener to restore a previous game
        window.addEventListener("load", pydots.restoreGame);
    }
});

//////////////////////////////////
// CHANGE CSS THEME 
//////////////////////////////////
let colorDropDown = document.getElementById("gcolors");
if (colorDropDown)
{
    colorDropDown.value = theme;
    colorDropDown.onchange = function () {
        changeTheme(this.value);
        // Save the value of the theme so we can retrieve it after a POST
        pydots.dotgame.storeTheme(this.value)
    }
}

//////////////////////////////////
// START NEW GAME 
//////////////////////////////////
let newGame = document.getElementById("gamevals");
if (newGame)
{
    newGame.onsubmit = function() {
        // Verify it is what our user wants to do
        alert("This will end your current game.")
        // Clear our local storage values
        pydots.dotgame.clearGameValues();
        // Set number of players
        pydots.dotgame.storePlayers(2,2);
    }
}

//////////////////////////////////
// EVENT HANDLERS 
//////////////////////////////////
// Restore the last game if game size has not changed.
// Since we do not save the size, this only works if
// the last game played used our default size. To make
// this more robust, we could use a cookie to store the
// size of the previous game.
pydots.restoreGame = function () {
    let lines = pydots.dotgame.getLines();
    let len = lines.length;
    // Make sure our lines match with current game size
    if (len != 2 * GAME_SIZE * (GAME_SIZE + 1))
    {
        // Clear our stored values and start from scratch
        pydots.dotgame.clearGameValues();
        lines = pydots.dotgame.getLines();
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
    let claims = pydots.dotgame.getClaims();
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

// Reset the board to indicate the current player's turn
pydots.updatePlayer = function (evt) {
    // If it is the machine's turn, let the server know.
    if (pydots.dotgame.getPlayer() == MACHINE)
        pydots.dotgame.makeMove();
    return;
}

// Response to click event.
// Human player has selected a line. Get the line
// number and validate it with the server. validateMove
// will draw the line and claim any approprate boxes.
pydots.playerMove = function (evt) {
    pydots.dotgame.validateMove(parseInt(evt.target.id));
} 

// Response to drawMove event.
// Draw a single move on the gameboard.
pydots.drawMove = function (evt) {
    let move = evt.detail.move;
    if (move[0] >= 0)
    {
        // Store the move
        pydots.dotgame.pushMove(move)
        // Next two statements draw our line
        let line = document.getElementById(move[0].toString());
        line.classList.add("selected");
        // claim any squares
        pydots.claimSquares(move, pydots.dotgame.getPlayer());
    }
};

// Update our score board
pydots.updateScore = function (player, score) {
    return;
}

////////////////////////////////
// HELPER FUNCTIONS
///////////////////////////////
// Check if the move claims any squares. If so, update the
// gameboard with the player's color, update the player's
// score and return true. Otherwise, do nothing and return false.
// This function can update two squares - move[1] and move[2]
pydots.claimSquares = function (move, player) {
    let points = 0;
    if (move[1] >= 0)
    {
        points += 1;
        pydots.fillSquare(move[1], player);
    }
    if (move[2] >= 0)
    {
        points += 1;
        pydots.fillSquare(move[2], player);
    }
    pydots.dotgame.updateScore(player, points);
    return points > 0;
}

// Color the square with the player's color
pydots.fillSquare = function (boxNum, player)
{
    let square = document.getElementById("B-" + boxNum);
    let claim = "claim" + player;
    square.classList.add(claim);
}
