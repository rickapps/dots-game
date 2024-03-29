// Copyright (c) 2022 Rick Eichhorn
// Latest source available at: https://github.com/rickapps/dots-game
// rick@rickapps.com
var pydots = pydots || {};

window.addEventListener('DOMContentLoaded', () => {
  // Allow refresh 
  history.replaceState({}, '', '/resume/');
  const gameboard = document.getElementById('gameboard');
  if (gameboard) {
    // Add an event listener to all the lines on our gameboard.
    gameboard.addEventListener('click', (event) => {
      if (event.target.tagName.toLowerCase() === 'a') {
        pydots.playerMove(event);
      }
    });
  };

  // Add event listener to draw a line on the gameboard.
  document.addEventListener('displayMoves', pydots.showMoves, false);

  document.getElementById('restartGame').addEventListener('submit', (e) => {
      const ok = pydots.endGameInProgress();
      if (!ok)
        e.preventDefault();
      return ok;
  });

  document.getElementById('dlgPlayAgain').addEventListener('click', () => {
    document.getElementById('restartGame').submit();
  });

  const numPlayerDropDown = document.getElementById('setDlgNumPlayers');
  numPlayerDropDown.addEventListener('change', (e) => {
    let mSelect = document.getElementById('setDlgMachine');
    pydots.setDlgMachineList(mSelect, e.target.value);
    pydots.dotgame.storage.initPlayerNames(e.target.value, e.target.value);
    pydots.setDlgPlayerList(e.target.value, e.target.value);
  });

  const machinePlayerDropDown = document.getElementById('setDlgMachine');
  machinePlayerDropDown.addEventListener('change', (e) => {
    let numPlayers = document.getElementById('setDlgNumPlayers').value;
    pydots.dotgame.storage.initPlayerNames(numPlayers, e.target.value);
    pydots.setDlgPlayerList(numPlayers, e.target.value);
  })

  const settingsSaveButton = document.getElementById('setDlgSaveBtn');
  settingsSaveButton.addEventListener('click', () => {
    pydots.dotgame.storage.clearGameValues();
    let numPlayers = document.getElementById('setDlgNumPlayers').value;
    let machine = document.getElementById('setDlgMachine').value;
    let names = document.getElementById('setDlgNames').getElementsByTagName('input');
    pydots.dotgame.storage.numPlayers = numPlayers;
    pydots.dotgame.storage.machinePlayer = machine;
    for (let i = 0; i < numPlayers; i++) {
      pydots.dotgame.storage.updatePlayerName(i+1, pydots.dotgame.sanitizeString(names[i].value));
    }
    const gSize = document.getElementById('glevel');
    gSize.value = pydots.dotgame.storage.level;
    document.getElementById('restartGame').submit();
   });

  pydots.initVars();
  pydots.displayScores();
  pydots.showCurrentPlayer(pydots.dotgame.storage.player);

});

window.addEventListener('load', () => {
  if (pydots.dotgame.isMachineTurn())
    pydots.dotgame.makeMove();
});

pydots.initVars = () => {
  // Get the style sheet
  const bodyStyles = document.body.style;
  // Set variables in our style sheet.
  bodyStyles.setProperty('--gridSize', GAME_SIZE);
  pydots.dotgame.storage.level = GAME_SIZE;
  pydots.dotgame.storage.lines = INIT_LINES;

  pydots.initMenu();
  pydots.initSettingsDialog();

  // Set the theme to whatever it was before. We keep that value in localStorage
  const theme = pydots.dotgame.storage.theme;
  pydots.changeTheme(theme);
  pydots.dotgame.storage.theme = theme;

  pydots.dotgame.storage.queue = [];
};

pydots.initSettingsDialog = () => {
  selectPlayers = document.getElementById('setDlgNumPlayers');
  selectMachine = document.getElementById('setDlgMachine');
  for (let i = 0; i < PARTICIPANTS.length; i++) {
    const player = document.createElement('option');
    player.text = PARTICIPANTS[i][0];
    player.value = PARTICIPANTS[i][1];
    selectPlayers.appendChild(player);
  }
  const option = document.createElement('option');
  option.text = NO_MACHINE;
  option.value = 0;
  selectMachine.appendChild(option);
  let numPlayers = pydots.dotgame.storage.numPlayers;
  let machine = pydots.dotgame.storage.machinePlayer;
  selectPlayers.selectedIndex = numPlayers - 2;
  pydots.setDlgMachineList(selectMachine, numPlayers);
  pydots.setDlgPlayerList(numPlayers, machine);
  selectMachine.selectedIndex = machine;
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
  document.getElementById('gameboard').focus();
  document.getElementById('settingDlg').showModal();
}

pydots.showHelpDlg = () => {
  document.getElementById('gameboard').focus();
  let dlg = document.getElementById('helpDlg');
  let article = dlg.querySelector('article');
  dlg.showModal();
  article.scroll({top:0,behavior:'smooth'});
}

pydots.restartGame = (evt) => {
  if (pydots.endGameInProgress())
  {
    const gSize = document.getElementById('glevel');
    gSize.value = evt.target.firstElementChild.value;
    document.getElementById('restartGame').submit();
  }
}

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

pydots.selectNewTheme = (evt) => {
  let value = evt.target.firstElementChild.value;
  if (value.length > 0) {
    pydots.changeTheme(value);
    pydots.dotgame.storage.theme = value;
  }
}

// Reset the board to indicate the current player's turn
pydots.showCurrentPlayer = (player) => {
  const numPlayers = pydots.dotgame.storage.numPlayers;
  const element = document.getElementById('scoreBoard');
  const markers = element.getElementsByTagName('img');
  for (let i = 0; i < numPlayers; i++) {
    markers[i].classList.add('invisible');
  }
  markers[player - 1].classList.toggle('invisible');
};

// Response to click event.
pydots.playerMove = (evt) => {
  pydots.dotgame.validateMove(parseInt(evt.target.id));
  evt.preventDefault();
};

// Response to displayMoves event.
// Draw a single move on the gameboard.
pydots.showMoves = () => {
  const turn = pydots.dotgame.storage.queueItem;
  goFast = (pydots.dotgame.soloPlayer() && turn.player != pydots.dotgame.storage.machinePlayer);
  if (turn && turn.player > 0) {
    pydots.showCurrentPlayer(turn.player);
    // Disable the gameboard
    pydots.lockGameboard(true);
  }
  pydots.startMove(goFast);
};

pydots.startMove = (quick) => {
  const turn = pydots.dotgame.storage.queueItem;
  let timer = 3000;
  let animations = ['signal', 'reverse', 'extrude', 'horizontal', 'vertical'];
  if (quick) {
    timer = 1500;
    animations = ['qsignal', 'reverse', 'qextrude', 'horizontal', 'vertical'];
  }
  
  if (turn) {
    if (turn.player > 0) {
      pydots.addAnimations(turn.player, turn.move, animations);
      setTimeout(pydots.endMove, timer, quick, animations);
    }
    else {
      pydots.endGame();
    }
  }
  else {
    pydots.clearAnimations(animations);

    if (pydots.dotgame.isMachineTurn())
      setTimeout(pydots.dotgame.makeMove, 500);
    else
      pydots.lockGameboard(false);
  }
}

pydots.lockGameboard = (lock) => {
  const gameboard = document.getElementById('gameboard');
  if (lock)
    gameboard.classList.add('deactivate');
  else
    gameboard.classList.remove('deactivate');
}

pydots.addAnimations = (player, move, animations) => {
  const lineNum = move[0].toString();
  const line = document.getElementById(lineNum);
  const dot1 = pydots.getDot1(lineNum);
  const dot2 = pydots.getDot2(lineNum);
  dot1.classList.add(animations[0]);
  dot2.classList.add(animations[0], animations[1]);
  if (pydots.dotgame.isHorizontal(lineNum))
    line.classList.add(animations[2], animations[3]);
  else
    line.classList.add(animations[2], animations[4]);

  return;
}

pydots.clearAnimations = (classes) => {
  for (let myclass of classes) {
    const animations = document.querySelectorAll('.' + myclass);
    animations.forEach((animation) => {
      animation.classList.remove(myclass);
      animation.offsetHeight;  //reset
    });
  }
}

pydots.endMove = (goFast, animations) => {
  pydots.clearAnimations(animations)
  const turn = pydots.dotgame.storage.shiftQueue();
  const line = document.getElementById(turn.move[0].toString());
  line.classList.add('selected');
  // claim any squares
  pydots.claimSquares(turn.move, turn.player);
  // update the score
  pydots.displayPlayerScore(turn.player, turn.score);
  // check if last move in turn
  if (turn.player != turn.next && turn.next > 0)
    pydots.showCurrentPlayer(turn.next);
  pydots.startMove(goFast);
}

pydots.endGame = () => {
  let dlg = document.getElementById('winnerDlg');
  let article = dlg.querySelector('article');
  let heading = document.createElement('h3');
  let text = document.createTextNode(pydots.dotgame.winnerMsg());
  heading.appendChild(text);
  article.appendChild(heading);
  let list = document.createElement('ol');
  let scores = pydots.dotgame.scoreList();
  for (const msg of scores) {
    item = document.createElement('li');
    text = document.createTextNode(msg);
    item.appendChild(text);
    list.appendChild(item);
  }
  article.appendChild(list);
  pydots.dotgame.storage.clearGameValues();
  dlg.showModal();
};

// Define a function to change our css theme
pydots.changeTheme = (theme) => { document.documentElement.className = theme; };


// Check if the move claims any squares. 
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

pydots.setDlgPlayerList = (numPlayers, machine) => {
  const fs = document.getElementById('setDlgNames');
  const sections = fs.getElementsByTagName('section');
  let state = 'visible';
  for (let i = 0; i < sections.length; i++) {
    if (i >= numPlayers) { state = 'hidden'; }
    sections[i].style.visibility = state;
    let player = i+1;
    let name = sections[i].getElementsByTagName('input')[0];
    name.value = pydots.dotgame.storage.getPlayerName(player);
    name.readOnly = (machine == player);
  }
}

// Show the specified number of players in the
// machine dropdown.
pydots.setDlgMachineList = (dropdown, numPlayers) => {
  // We assume the first option is 'Not Playing'.
  // We always leave that option intact.
  const max = dropdown.options.length;
  for (let i = 1; i < max; i++) {
    dropdown.remove(1);
  }
  for (let i = 0; i < numPlayers; i++) {
    const player = document.createElement('option');
    player.text = MACHINE_PLAYER[i][0];
    player.value = MACHINE_PLAYER[i][1];
    dropdown.appendChild(player);
    dropdown.selectedIndex = numPlayers;
  }
};

pydots.displayPlayerScore = (player, score) => {
    const name = pydots.dotgame.storage.getPlayerName(player);
    const span = document.getElementById(`score${player}`);
    span.textContent = `${name}: ${score}`;
}

// Displays on main page
pydots.displayScores = () => {
  // Get all spans within the specified location. There should be five.
  const element = document.getElementById('panel');
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

// For animations
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
    let dotClass = '.bottom-left';
    if (pydots.dotgame.isHorizontal(lineNum))
      dotClass = '.top-right';
    if (pydots.dotgame.isBottomEdge(lineNum))
      dotClass = '.bottom-right';
    if (pydots.dotgame.isRightEdge(lineNum)) 
      dotClass = '.bottom-right'; 
    let boxNum = pydots.dotgame.getBoxNum(lineNum);
    const box = document.getElementById(`B-${boxNum}`);
    dot = box.querySelector(dotClass);
  }
  return dot;
}
