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
// Check if we are starting a new game or resuming current game.
pydots.startup.gameSetup = function () {
    let moves = pydots.dotgame.storage.history;
    let len = moves.length;
    // Was there any progress on the previous game?
    if (len > 0)
    {
        document.getElementById('size').value = pydots.dotgame.storage.level;
        document.getElementById('theme').value = pydots.dotgame.storage.theme;
        document.getElementById('lines').value = JSON.stringify(pydots.dotgame.storage.lines);
        document.getElementById('claims').value = JSON.stringify(pydots.dotgame.storage.claims);
        // Submit our form
        document.resumeGame.submit();
    }
    else
    {
        // Set everything back to defaults except for level and theme.
        pydots.dotgame.storage.storeNewGameSetup();
        document.getElementById('glevel').value = pydots.dotgame.storage.level;
        document.getElementById('gcolors').value = pydots.dotgame.storage.theme;
        // Submit our form
        document.startNewGame.submit();
    }
};
