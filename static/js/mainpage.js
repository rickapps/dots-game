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

//--------------------------------
// ADD EVENT LISTENERS
//--------------------------------
window.addEventListener('DOMContentLoaded', () => {
  const gameboard = document.getElementById('gameboard');
  if (gameboard) {
    // Add an event listener to all the lines on our gameboard.
    // When a player clicks on a line, we need to know about it.
    gameboard.addEventListener('click', (event) => {
      if (event.target.tagName.toLowerCase() === 'a') {
        pydots.playerMove(event);
      }
    });
  };

  // Change the theme when requested
  const colorDropDown = document.getElementById('gcolors');
  if (colorDropDown) {
    colorDropDown.addEventListener('change', (e) => {
      pydots.changeTheme(e.target.value);
      // Save the value of the theme so we can retrieve it after a POST
      pydots.dotgame.storeTheme(e.target.value);
    });
  };

  // Add event listener to draw a line on the gameboard.
  // The arg for event is array of [line,box1,box2]
  // Drawing a single line could complete up to two boxes.
  document.addEventListener('drawMove', pydots.drawMove, false);
  // Add event listener to update the gameboard with current player.
  document.addEventListener('updatePlayer', pydots.updatePlayer, false);
  // Add event listener to update the score.
  document.addEventListener('updateScore', pydots.updateScore);
  document.addEventListener('gameOver', pydots.endGame);

  pydots.initVars();
  pydots.updatePlayer();
  pydots.updateScore();
});

// window.addEventListener('load', pydots.pageSetup);

//--------------------------------
// INIT VARS
//--------------------------------
pydots.initVars = () => {
  // Get the style sheet
  const bodyStyles = document.body.style;
  // Set variables in our style sheet.
  bodyStyles.setProperty('--gridSize', GAME_SIZE);

  // Initialize the game size drop down on the panel
  const sizeDropDown = document.getElementById('glevel');
  if (sizeDropDown) sizeDropDown.value = GAME_SIZE;

  // Set the theme to whatever it was before. We keep that value in localStorage
  const theme = pydots.dotgame.getTheme();
  pydots.changeTheme(theme);
  pydots.displayScores('panel');
};

//--------------------------------
// ON PAGE LOAD
//--------------------------------
// Check if we have a stored game. If so, set up
// the panel with display values. Set up the rest
// of the page with default values.
pydots.pageSetup = () => {
  displayScores('panel');
  const moves = pydots.dotgame.getHistory();
  const len = moves.length;
  // Was there any progress on the previous game?
  if (len > 0) {
    pydots.displayScores('resumeGame');
  } else {
    // Clear our stored values and start from scratch
    pydots.dotgame.clearGameValues();
    // Hide the resume section
    document.getElementById('resumeGame').style.display = 'none';
  }

  // Set the new game values.
  const numplayersdrop = document.getElementById('players');
  const machinedrop = document.getElementById('machine');
  pydots.setMachineList(machinedrop, numplayersdrop.value);
  pydots.setPlayerList(numplayersdrop.value, machinedrop.value);
};

//--------------------------------
// UPDATE INDEX PAGE
//--------------------------------
const playerDropDown = document.getElementById('players');
if (playerDropDown) {
  const machineDropDown = document.getElementById('machine');
  playerDropDown.onchange = () => {
    pydots.setMachineList(machineDropDown, this.value);
    pydots.setPlayerList(this.value, machineDropDown.value);
  };
  machineDropDown.onchange = () => {
    pydots.setPlayerList(playerDropDown.value, this.value);
  };
}

//--------------------------------
// START NEW GAME
//--------------------------------
const newGame = document.getElementById('startNewGame');
if (newGame) {
  newGame.onsubmit = () => {
    // Clear our local storage values
    pydots.dotgame.clearGameValues();
    // Store player info - number, names
    pydots.storePlayerInfo();
    return true;
  };
}

//--------------------------------
// RESTART GAME
//--------------------------------
const restart = document.getElementById('restartGame');
if (restart) {
  restart.onsubmit = () => {
    // Verify it is what our user wants to do
    const moves = pydots.dotgame.getHistory();
    if (moves.length > 0) {
      const isConfirmed = confirm('Do you want to end your current game?');
      // Clear our local storage values
      if (isConfirmed) { pydots.dotgame.clearGameValues(); } else { return false; }
    }
  };
}

//--------------------------------
// RESUME GAME
//--------------------------------
const resume = document.getElementById('resumeGame');
if (resume) {
  // For now, we will pull the info from storage and load it into html
  // input fields. Later we will see if we can modify the request header
  // before the form is posted and do away with the input fields.
  resume.onsubmit = function () {
    document.getElementById('size').value = pydots.dotgame.getLevel();
    document.getElementById('theme').value = pydots.dotgame.getTheme();
    document.getElementById('lines').value = JSON.stringify(pydots.dotgame.getLines());
    document.getElementById('claims').value = JSON.stringify(pydots.dotgame.getClaims());
    return true;
  };
}

//--------------------------------
// EVENT HANDLERS
//--------------------------------
// Reset the board to indicate the current player's turn
pydots.updatePlayer = () => {
  // Update the scoreboard to show the current player
  const numPlayers = pydots.dotgame.getNumPlayers();
  const player = pydots.dotgame.getPlayer();
  const element = document.getElementById('scoreBoard');
  const markers = element.getElementsByTagName('img');
  for (let i = 0; i < numPlayers; i++) {
    markers[i].classList.add('invisible');
  }
  markers[player - 1].classList.toggle('invisible');
  // If it is the machine's turn, let the server know.
  if (pydots.dotgame.isMachineTurn()) { pydots.dotgame.makeMove(); }
};

// Response to click event.
// Human player has selected a line. Get the line
// number and validate it with the server. validateMove
// will draw the line and claim any approprate boxes.
pydots.playerMove = (evt) => {
  pydots.dotgame.validateMove(parseInt(evt.target.id));
};

pydots.endGame = () => {
  pydots.dotgame.clearGameValues();
  const dlg = document.getElementById('endGameDlg');
  dlg.classList.toggle('modal-dialog-show');
};

// Response to drawMove event.
// Draw a single move on the gameboard.
pydots.drawMove = (evt) => {
  const { move } = evt.detail;
  if (move[0] >= 0) {
    // Store the move
    pydots.dotgame.pushMove(move);
    // Next two statements draw our line
    const line = document.getElementById(move[0].toString());
    line.classList.add('selected');
    // claim any squares
    pydots.claimSquares(move, pydots.dotgame.getPlayer());
  }
};

// Update our score board
pydots.updateScore = (player, score) => {
  pydots.displayScores('panel');
};

//--------------------------------
// HELPER FUNCTIONS
//--------------------------------
// Define a function to change our css theme
pydots.changeTheme = (theme) => { document.documentElement.className = theme; };


// Check if the move claims any squares. If so, update the
// gameboard with the player's color, update the player's
// score and return true. Otherwise, do nothing and return false.
// This function can update two squares - move[1] and move[2]
pydots.claimSquares = (move, player) => {
  let points = 0;
  if (move[1] >= 0) {
    points += 1;
    pydots.fillSquare(move[1], player);
  }
  if (move[2] >= 0) {
    points += 1;
    pydots.fillSquare(move[2], player);
  }
  return points > 0;
};

// Color the square with the player's color
pydots.fillSquare = (boxNum, player) => {
  const square = document.getElementById(`B-${boxNum}`);
  const claim = `claim${player}`;
  square.classList.add(claim);
};

// Save the info the user entered into the startNewGame form
// This is information that is not sent to the server
pydots.storePlayerInfo = () => {
  // Store the skill level
  let element = document.getElementById('glevel');
  const skill = element.options[element.selectedIndex].value;
  pydots.dotgame.storeLevel(skill);
  // Store the player count
  element = document.getElementById('players');
  const numPlayers = element.options[element.selectedIndex].value;
  element = document.getElementById('machine');
  const computer = element.options[element.selectedIndex].value;
  pydots.dotgame.storePlayers(numPlayers, computer);
  // Store the names
  element = document.getElementById('newGamePeople');
  const names = element.getElementsByTagName('input');
  for (let i = 1; i <= numPlayers; i++) {
    pydots.dotgame.storePlayerName(i, names[i - 1].value);
  }
};

// Show the specified number of names in the name list.
// If machine is non-zero, populate that member of the
// list with the machine name and make it read only.
pydots.setPlayerList = (numPlayers, machine = 0) => {
  const fs = document.getElementById('newGamePeople');
  const names = fs.getElementsByTagName('input');
  const labels = fs.getElementsByTagName('label');
  let state = 'visible';
  for (let i = 0; i < names.length; i++) {
    if (i >= numPlayers) { state = 'hidden'; }
    names[i].style.visibility = state;
    names[i].readOnly = false;
    names[i].value = INIT_NAMES[i][0];
    labels[i].style.visibility = state;
  }
  if (machine > 0) {
    names[machine - 1].value = COMPUTER_PLAYER;
    names[machine - 1].readOnly = true;
  }
};

// Show the specified number of players in the
// machine dropdown.
pydots.setMachineList = (dropdown, numPlayers) => {
  // We assume the first option is 'Not Playing'.
  // We always leave that option intact.
  const max = dropdown.options.length;
  for (let i = 1; i < max; i++) {
    dropdown.remove(1);
  }
  for (let i = 0; i < numPlayers; i++) {
    const player = document.createElement('option');
    player.text = INIT_NAMES[i][0];
    player.value = INIT_NAMES[i][1];
    dropdown.appendChild(player);
  }
  // Default to the last option
  dropdown.selectedIndex = numPlayers;
};

// Displays on main page
pydots.displayScores = (location) => {
  // Get all spans within the specified location. There should be five.
  const element = document.getElementById(location);
  const spans = element.getElementsByTagName('span');
  // Skill Level
  const level = pydots.dotgame.getLevelName();
  spans[0].textContent = `Skill Level: ${level}`;
  // Update the scores
  const numPlayers = pydots.dotgame.getNumPlayers();
  for (let i = 1; i < 5; i++) {
    if (i > numPlayers) {
      spans[i].style.display = 'none';
    } else {
      const name = pydots.dotgame.getPlayerName(i);
      const score = pydots.dotgame.getScore(i);
      spans[i].textContent = `${name}: ${score}`;
    }
  }
};
