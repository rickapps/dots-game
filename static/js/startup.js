// Copyright (c) 2022 Rick Eichhorn
// Latest source available at: https://github.com/rickapps/dots-game
// rick@rickapps.com
// November 2, 2022

// When the page loads we will retrieve values from localStorage.
// Based on the values we retrieve, we will post to the server
// a request to continue a game in progress, start a new game
// with saved values, or start a new game with default values.
var pydots = pydots || {};
pydots.startup = pydots.startup || {};

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