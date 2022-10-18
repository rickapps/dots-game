// Copyright (c) 2022 Rick Eichhorn
// Latest source available at: https://github.com/rickapps/dots-game
// rick@rickapps.com
// August 1, 2022
//
// Edit this file to change the look and feel of the dots game.
// You need to listen for and respond to the following four custom events:
// 1) drawMove - Draw one line on the game board. Use dotgame.getPlayer()
// to see who the current player is.
// 2) updatePlayer - The turn has changed. Update the board to indicate
// whose turn it is. If it is the computer's turn, call makeMove.
// 3) updateScore - Update the scoreboard.
// 4) gameOver - The game has ended. Display notice to user. 
//
// The other file, Dotgame.js, implements the business logic. You shouldn't need
// to alter that file if you just want to change the appearance of the game. 
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
        document.addEventListener("gameOver", pydots.endGame);
        pydots.updatePlayer();
        pydots.updateScore();
}
    let resume = document.getElementById("resumeGame");
    if (resume)
    {
        // Add event listener to restore a previous game
        window.addEventListener("load", pydots.initIndexPage);
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

///////////////////////////////////
// UPDATE INDEX PAGE
///////////////////////////////////
let playerDropDown = document.getElementById("players");
if (playerDropDown)
{
    let machineDropDown = document.getElementById("machine");
    playerDropDown.onchange = function() {
        pydots.setMachineList(machineDropDown, this.value);
        pydots.setPlayerList(this.value, machineDropDown.value);
        
    }
    machineDropDown.onchange = function() {
        pydots.setPlayerList(playerDropDown.value, this.value);
    }
}


//////////////////////////////////
// START NEW GAME 
//////////////////////////////////
let newGame = document.getElementById("startNewGame");
if (newGame)
{
    newGame.onsubmit = function() {
        // Clear our local storage values
        pydots.dotgame.clearGameValues();
        // Store player info - number, names
        pydots.storePlayerInfo();
        return true;
    }
}

//////////////////////////////////
// RESTART GAME 
//////////////////////////////////
let restart = document.getElementById("restartGame");
if (restart)
{
    restart.onsubmit = function() {
        // Verify it is what our user wants to do
        alert("This will end your current game.")
        // Clear our local storage values
        pydots.dotgame.clearGameValues();
    }
}

//////////////////////////////////
// RESUME GAME 
//////////////////////////////////
let resume = document.getElementById("resumeGame");
if (resume)
{
    // For now, we will pull the info from storage and load it into html
    // input fields. Later we will see if we can modify the request header
    // before the form is posted and do away with the input fields.
    resume.onsubmit = function() {
        document.getElementById('size').value = pydots.dotgame.getLevel();
        document.getElementById('theme').value = pydots.dotgame.getTheme();
        document.getElementById('lines').value = JSON.stringify(pydots.dotgame.getLines());
        document.getElementById('claims').value = JSON.stringify(pydots.dotgame.getClaims());
        return true;
    }
}

//////////////////////////////////
// EVENT HANDLERS 
//////////////////////////////////
// Check if we have a stored game. If so, set up
// the panel with display values. Set up the rest
// of the page with default values.
pydots.initIndexPage = function () {
    let moves = pydots.dotgame.getHistory();
    let len = moves.length;
    // Was there any progress on the previous game?
    if (len > 0)
    {
        pydots.displayScores("resumeGame");
    }
    else
    {
        // Clear our stored values and start from scratch
        pydots.dotgame.clearGameValues();
        // Hide the resume section
        document.getElementById("resumeGame").style.display="none";
    }

    // Set the new game values.
    let numplayersdrop = document.getElementById('players');
    let machinedrop = document.getElementById('machine');
    pydots.setMachineList(machinedrop, numplayersdrop.value);
    pydots.setPlayerList(numplayersdrop.value, machinedrop.value);
};

// Reset the board to indicate the current player's turn
pydots.updatePlayer = function (evt) {
    // Update the scoreboard to show the current player
    let numPlayers = pydots.dotgame.getNumPlayers();
    let player = pydots.dotgame.getPlayer();
    console.log(`updatePlayer - it is ${player}`);
    let element = document.getElementById('scoreBoard');
    let markers = element.getElementsByTagName('img');
    for (let i = 0; i < numPlayers; i++)
    {
        markers[i].classList.add('invisible');
    }
    markers[player-1].classList.toggle('invisible');
    // If it is the machine's turn, let the server know.
    if (pydots.dotgame.isMachineTurn())
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

pydots.endGame = function() {
    pydots.dotgame.clearGameValues();
    let dlg = document.getElementById('endGameDlg');
    dlg.classList.toggle('show-dlg');
}

// Response to drawMove event.
// Draw a single move on the gameboard.
pydots.drawMove = function (evt) {
    let move = evt.detail.move;
    console.log(`Draw move: ${move[0]}`);
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
    console.log('Update Score');
    pydots.displayScores('panel');
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
    return points > 0;
}

// Color the square with the player's color
pydots.fillSquare = function (boxNum, player)
{
    let square = document.getElementById("B-" + boxNum);
    let claim = "claim" + player;
    square.classList.add(claim);
}

// Save the info the user entered into the startNewGame form
// This is information that is not sent to the server
pydots.storePlayerInfo = function()
{
    // Store the skill level
    let element = document.getElementById('glevel');
    let skill = element.options[element.selectedIndex].value;
    pydots.dotgame.storeLevel(skill);
    // Store the player count
    element = document.getElementById('players');
    let numPlayers = element.options[element.selectedIndex].value;
    element = document.getElementById('machine');
    let computer = element.options[element.selectedIndex].value;
    pydots.dotgame.storePlayers(numPlayers, computer);
    // Store the names
    element = document.getElementById('newGamePeople');
    let names = element.getElementsByTagName('input');
    for (let i = 1; i <= numPlayers; i++)
    {
        pydots.dotgame.storePlayerName(i, names[i-1].value);
    }
}

// Show the specified number of names in the name list.
// If machine is non-zero, populate that member of the
// list with the machine name and make it read only.
pydots.setPlayerList = function(numPlayers, machine=0)
{
    let fs = document.getElementById('newGamePeople');
    let names = fs.getElementsByTagName('input');
    let labels = fs.getElementsByTagName('label');
    let state = 'visible';
    for (let i = 0; i < names.length; i++)
    {
        if (i >= numPlayers)
            state = 'hidden';
        names[i].style.visibility = state;
        names[i].readOnly = false;
        names[i].value = INIT_NAMES[i][0];
        labels[i].style.visibility = state;
    }
    if (machine > 0)
    {
        names[machine-1].value = COMPUTER_PLAYER;
        names[machine-1].readOnly = true;
    }
}

// Show the specified number of players in the
// machine dropdown.
pydots.setMachineList = function(dropdown, numPlayers)
{
    // We assume the first option is 'Not Playing'.
    // We always leave that option intact.
    let max = dropdown.options.length;
    for (let i=1; i<max; i++)
    {
        dropdown.remove(1);
    }
    for (let i=0; i<numPlayers; i++)
    {
        var player = document.createElement('option');
        player.text = INIT_NAMES[i][0];
        player.value = INIT_NAMES[i][1];
        dropdown.appendChild(player);
    }
    // Default to the last option
    dropdown.selectedIndex = numPlayers;
}

pydots.displayScores = function(location)
{
        // Get all spans within the specified location. There should be five.
        let element = document.getElementById(location);
        let spans = element.getElementsByTagName('span');
        // Skill Level
        let level = pydots.dotgame.getLevelName();
        spans[0].textContent = `Skill Level: ${level}`;
        // Update the scores
        let numPlayers = pydots.dotgame.getNumPlayers();
        for (let i = 1; i < 5; i++)
        {
            if (i > numPlayers)
            {
                spans[i].style.display="none";
            }
            else
            {
                let name = pydots.dotgame.getPlayerName(i);
                let score = pydots.dotgame.getScore(i);
                spans[i].textContent = `${name}: ${score}`;
            }
        }
}
