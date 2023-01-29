// Copyright (c) 2022 Rick Eichhorn
// Latest source available at: https://github.com/rickapps/dots-game
// rick@rickapps.com
// August 1, 2022
//
// Edit this file to change the look and feel of the dots game.
// You need to listen for and respond to the following four custom events:
// 1) drawMove - Draw one line on the game board. Use pydots.dotgame.storage.player
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
      pydots.dotgame.storage.theme = e.target.value;
    });
  };

  // Add event listener to draw a line on the gameboard.
  // The arg for event is array of [line,box1,box2]
  // Drawing a single line could complete up to two boxes.
  document.addEventListener('drawMove', pydots.showMove, false);
  document.addEventListener('animationend', pydots.endMove)
  document.addEventListener('gameOver', pydots.endGame);

  document.getElementById('restartGame').addEventListener('submit', (e) => {
      const ok = pydots.endGameInProgress();
      if (!ok)
        e.preventDefault();
      return ok;
  });

  pydots.initVars();
  pydots.displayScores('panel');

});

pydots.endGameInProgress = () => {
  let isConfirmed = true;
  const moves = pydots.dotgame.storage.history;
  if (moves.length > 0) {
    isConfirmed = confirm('Do you want to end your current game?');
  }
  // Clear our local storage values
  if (isConfirmed) { 
    pydots.dotgame.storage.clearGameValues(); 
  }
  return isConfirmed;
}


pydots.initMenu = () => {
  // Note - listen for mousedown rather than click. 
  // css is based on focus, click changes the focus.
  const menu = document.querySelector('ul.mnu-list');
  const items = menu.children;
  let subMenu;
  for (let item of items) {
    switch (item.firstElementChild.value) {
      case 'mnuNew':
        subMenu = document.createElement('ul');
        pydots.populateMainMenu(subMenu, GAME_LEVELS);
        subMenu.addEventListener('mousedown', pydots.restartGame);
        item.appendChild(subMenu);
        break;
      case 'mnuSettings':
        item.addEventListener('mousedown', pydots.showSettingDlg);
        break;
      case 'mnuTheme':
        subMenu = document.createElement('ul');
        pydots.populateMainMenu(subMenu, GAME_THEMES);
        subMenu.addEventListener('mousedown', pydots.selectNewTheme);
        item.appendChild(subMenu);
        break;
      case 'mnuUndo':
        break;
      case 'mnuHelp':
        item.addEventListener('mousedown', pydots.showHelpDlg);
        break;
    };
  };
}

pydots.showSettingDlg = () => {
  document.getElementById('settingDlg').showModal();
}

pydots.showHelpDlg = () => {
  document.getElementById('helpDlg').showModal();
}

//--------------------------------
// INIT VARS
//--------------------------------
pydots.initVars = () => {
  // Get the style sheet
  const bodyStyles = document.body.style;
  // Set variables in our style sheet.
  bodyStyles.setProperty('--gridSize', GAME_SIZE);
  pydots.dotgame.storage.level = GAME_SIZE;
  pydots.dotgame.storage.lines = INIT_LINES;

  pydots.initMenu();

  // Set the theme to whatever it was before. We keep that value in localStorage
  const theme = pydots.dotgame.storage.theme;
  pydots.changeTheme(theme);
  pydots.dotgame.storage.theme = theme;
 };

pydots.restartGame = (evt) => {
  if (pydots.endGameInProgress())
  {
    const gSize = document.getElementById('glevel');
    gSize.value = evt.target.firstElementChild.value;
    document.getElementById('restartGame').submit();
  }
}

//--------------------------------
// EVENT HANDLERS
//--------------------------------
pydots.selectNewTheme = (evt) => {
  let value = evt.target.firstElementChild.value;
  if (value.length > 0) {
    pydots.changeTheme(value);
    pydots.dotgame.storage.theme = value;
  }
}
// Reset the board to indicate the current player's turn
pydots.showCurrentPlayer = (player) => {
  // Update the scoreboard to show the current player
  const numPlayers = pydots.dotgame.storage.numPlayers;
  const element = document.getElementById('scoreBoard');
  const markers = element.getElementsByTagName('img');
  for (let i = 0; i < numPlayers; i++) {
    markers[i].classList.add('invisible');
  }
  markers[player - 1].classList.toggle('invisible');
};

// Response to click event.
// Human player has selected a line. Get the line
// number and validate it with the server. validateMove
// will draw the line and claim any approprate boxes.
pydots.playerMove = (evt) => {
  pydots.dotgame.validateMove(parseInt(evt.target.id));
  evt.preventDefault();
};

pydots.endGame = () => {
  pydots.dotgame.storage.clearGameValues();
  document.getElementById('winnerDlg').showModal();
};

// Response to drawMove event.
// Draw a single move on the gameboard.
pydots.showMove = () => {
  const player = pydots.dotgame.storage.queueItem.player;
  const move = pydots.dotgame.storage.queueItem.move;
  if (player > 0) {
    pydots.showCurrentPlayer(player);
    pydots.animateMove(move[0].toString());
  }
  else {
    // Game is over
    pydots.endGame();
  }
};

pydots.endMove = (evt) => {
  const player = pydots.dotgame.storage.queueItem.player;
  const next = pydots.dotgame.storage.queueItem.next;
  const move = pydots.dotgame.storage.queueItem.move;
  // remove animation classes
  const line = document.getElementById(move[0].toString());
  const dot1 = pydots.getDot1(line.id);
  const dot2 = pydots.getDot2(line.id);
  dot1.classList.toggle('grow');
  dot2.classList.toggle('grow');
  // claim any squares
  pydots.claimSquares(move, player);
  // update the score
  pydots.displayPlayerScore(player, pydots.dotgame.storage.queueItem.score);
  // Shift the queue
  pydots.dotgame.storage.queue.shift();
  // check if last move in turn
  if (player == next)
    pydots.animateMove();
  else
    pydots.dotgame.makeMove();
}

pydots.animateMove = (lineNum) => {
  const line = document.getElementById(lineNum);
  const dot1 = pydots.getDot1(line.id);
  const dot2 = pydots.getDot2(line.id);
  dot1.classList.toggle('grow');
  dot2.classList.toggle('grow');
  line.classList.add('selected');
}

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

pydots.populateMainMenu = (parent, sourceArray) => {
  for (let vals of sourceArray) {
    let item = document.createElement('li');
    let textnode = document.createTextNode(vals[0]);
    item.appendChild(textnode);
    let data = document.createElement('data');
    data.value = vals[1];
    item.appendChild(data);
    parent.appendChild(item);
  }
};

pydots.addComputerPlayerToMainMenu = (parent, source) => {
  let item = document.createElement('hr');
  parent.appendChild(item);
  item = document.createElement('li');
  item.dataset.lookup = 0;
  item.innerHTML = `<a href="#" title="Is one of the players the computer?">${source}</a>`;
  parent.appendChild(item);
}

// *********************************************************
// We can get rid of this stuff                          
// ******************************************************* */
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
    pydots.dotgame.storage.updatePlayerName(i, names[i - 1].value);
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

pydots.displayPlayerScore = (player, score) => {
    const name = pydots.dotgame.storage.getPlayerName(player);
    const span = document.getElementById(`score${player}`);
    span.textContent = `${name}: ${score}`;
}

// Displays on main page
pydots.displayScores = (location) => {
  // Get all spans within the specified location. There should be five.
  const element = document.getElementById(location);
  const spans = element.getElementsByTagName('span');
  // Skill Level
  const level = pydots.dotgame.storage.levelName;
  spans[0].textContent = `Skill Level: ${level}`;
  // Update the scores
  const numPlayers = pydots.dotgame.storage.numPlayers;
  for (let i = 1; i < 5; i++) {
    if (i > numPlayers) {
      spans[i].style.display = 'none';
    } else {
      const name = pydots.dotgame.storage.getPlayerName(i);
      const score = pydots.dotgame.storage.getPlayerScore(i);
      spans[i].textContent = `${name}: ${score}`;
    }
  }
};

pydots.getDot1 = (lineNum) => {
  let dotClass = '.top-left';
  let boxNum = pydots.dotgame.getBoxNum(lineNum);
  const box = document.getElementById(`B-${boxNum}`);
  if (pydots.dotgame.isBottomEdge(lineNum)) 
    dotClass = '.bottom-left';
  if (pydots.dotgame.isRightEdge(lineNum))
    dotClass = '.top-right';
  const dot = box.querySelector(dotClass);

  return dot;
}

pydots.getDot2 = (lineNum) => {
  let dot;
  let adj = pydots.dotgame.getAdjacentLine(lineNum);
  if (adj >= 0) {
    dot = pydots.getDot1(adj);
  }
  else {
    let boxNum = pydots.dotgame.getBoxNum(lineNum);
    const box = document.getElementById(`B-${boxNum}`);
    dot = box.querySelector('.bottom-right');
  }
  return dot;
}

pydots.getLine = (lineNum) => {
  const line = document.getElementById(`${lineNum}`);
  return line;
}
