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

window.addEventListener("DOMContentLoaded", (event) => {
    window.addEventListener("load", pydots.startup.gameSetup);
});

//////////////////////////////////
// EVENT HANDLERS 
//////////////////////////////////
// Check if we have a stored game. If so, set up
// the panel with display values. Set up the rest
// of the page with default values.
pydots.startup.gameSetup = function () {
    let moves = pydots.dotgame.getHistory();
    let len = moves.length;
    // Was there any progress on the previous game?
    if (len > 0)
    {
        document.getElementById('size').value = pydots.dotgame.getLevel();
        document.getElementById('theme').value = pydots.dotgame.getTheme();
        document.getElementById('lines').value = JSON.stringify(pydots.dotgame.getLines());
        document.getElementById('claims').value = JSON.stringify(pydots.dotgame.getClaims());
        // Submit our form
        document.resumeGame.submit();
    }
    else
    {
        // We will start a new game using the level and theme
        document.getElementById('glevel').value = pydots.dotgame.getLevel();
        document.getElementById('gcolors').value = pydots.dotgame.getTheme();
        // Submit our form
        document.startNewGame.submit();
    }
};
