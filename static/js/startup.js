// Copyright (c) 2022 Rick Eichhorn
// Latest source available at: https://github.com/rickapps/dots-game
// rick@rickapps.com
var pydots = pydots || {};
pydots.startup = pydots.startup || {};

window.addEventListener("DOMContentLoaded", (event) => {
    pydots.startup.applyTranslations();
    window.addEventListener("load", pydots.startup.gameSetup);
});

pydots.startup.applyTranslations = function () {
    document.documentElement.lang = LOCALE;
    document.getElementById('startupHeading').textContent = T.startup.heading;
    document.getElementById('startupIntro').textContent = T.startup.intro;
    document.getElementById('startupStartBtn').textContent = T.startup.startBtn;
    // Footer
    document.querySelector('footer .credit').textContent = T.footer.credit;
    document.querySelector('footer .source').textContent = T.footer.source;
};

pydots.startup.gameSetup = function () {
    if (RESET_STORAGE)
    {
        try {
        localStorage.clear();
        } catch (e) {
            pydots.dotgame.storage.history = [];
        }
    }
    let moves = pydots.dotgame.storage.history;
    let len = moves.length;
    // Was there any progress on the previous game?
    if (len > 0)
    {
        document.getElementById('size').value = pydots.dotgame.storage.level;
        document.getElementById('lines').value = JSON.stringify(pydots.dotgame.storage.lines);
        document.getElementById('claims').value = JSON.stringify(pydots.dotgame.storage.claims);
        document.resumeGame.submit();
    }
    else
    {
        // Set everything back to defaults except for level and theme.
        pydots.dotgame.storage.storeNewGameSetup();
        document.getElementById('glevel').value = pydots.dotgame.storage.level;
        document.startNewGame.submit();
    }
};
