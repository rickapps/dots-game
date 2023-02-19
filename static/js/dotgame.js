// Copyright (c) 2022 Rick Eichhorn
// Latest source available at: https://github.com/rickapps/dots-game
// rick@rickapps.com
var pydots = pydots || {};
pydots.dotgame= pydots.dotgame || {};

class GameStorage {
    #key = {
        claim: "Claims",
        history: "History",
        level: "Level",
        lines: "Lines",
        machine: "Machine",
        name: "Names",
        numPlayers: "NumPlayers",
        player: "Player",
        score: "Scores",
        theme: "Theme",
        queue: "Queue"
    }
    #maxPlayers = PLAYER_NAMES.length;
    #numLevels = GAME_LEVELS.length;
    #numThemes = GAME_THEMES.length;


    constructor(size=0, lines=null) {
        if (size > 0) {
            this.level = size;
        }
        if (lines) {
            this.lines = lines;
        }
    }
    
    get claims() {
        let claims = localStorage.getItem(this.#key.claim);
        if (claims)
            claims = JSON.parse(claims);
        else
            claims = [];  
            
        if (claims.length == 0)
            claims = new Array(this.level**2).fill(0);
        return claims;
    }

    set claims(claims) {
        localStorage.setItem(this.#key.claim, JSON.stringify(claims));
    }

    get playerNames() {
        let names = localStorage.getItem(this.#key.name);
        if (names)
            names = JSON.parse(names);
        else
            names = initPlayerNames(this.numPlayers, this.machinePlayer);
        return names;
    }

    set playerNames(names) {
        localStorage.setItem(this.#key.name, JSON.stringify(names));
    }

    get history() {
        let history = localStorage.getItem(this.#key.history);
        if (history)
            history = JSON.parse(history);
        else
            history = [];
        return history;
    }

    set history(history) {
        localStorage.setItem(this.#key.history, JSON.stringify(history));
    }

    get queue() {
        let queue = localStorage.getItem(this.#key.queue);
        if (queue)
            queue = JSON.parse(queue);
        else
            queue = [];
        return queue;
    }

    set queue(queue) {
        localStorage.setItem(this.#key.queue, JSON.stringify(queue));
    }

    shiftQueue() {
        let queue = this.queue;
        let item = queue.shift();
        this.queue = queue;
        return item;
    }

    get level() {
        let level = localStorage.getItem(this.#key.level);
        if (level)
            level = JSON.parse(level);
        else
            level = GAME_LEVELS[DEFAULT_LEVEL_INDEX][1];
    
        return level;
    }

    set level(level) {
        let found = false;
        for (let val of GAME_LEVELS) {
            if (val[1] == level)
            {
                found = true;
                break;
            }
        }
         if (found)
            localStorage.setItem(this.#key.level, JSON.stringify(level));
        else
            throw new Error('Invalid game level');
    }

    get levelName() {
        let level = this.level;
        let name = 'Not found';
        for (let i=0; i<this.#numLevels; i++)
        {
            if (level == GAME_LEVELS[i][1])
            {
                name = GAME_LEVELS[i][0];
                break;
            }
        }
        return name;
    }

    get lines() {
        let lines = localStorage.getItem(this.#key.lines);
        if (lines)
            lines = JSON.parse(lines);
        else
            throw new Error('Lines array not defined');
        return lines;
    }

    set lines(lines) {
        localStorage.setItem(this.#key.lines, JSON.stringify(lines));
    }

    get machinePlayer() {
        let machine = JSON.parse(localStorage.getItem(this.#key.machine));
        if (machine)
            machine = JSON.parse(machine);
        else
            machine = this.numPlayers;
        return machine;
    }

    set machinePlayer(machine) {
        localStorage.setItem(this.#key.machine, JSON.stringify(machine));
    }

    get theme() {
        let theme = localStorage.getItem(this.#key.theme);
        if (theme)
            theme = JSON.parse(theme);
        else
            theme = GAME_THEMES[DEFAULT_THEME_INDEX][1];
        return theme;
    }

    set theme(theme) {
        let valid = false;
        for (let i=0; i<GAME_THEMES.length; i++) {
            if (GAME_THEMES[i][1] == theme) valid = true;
        }
        if (valid)
            localStorage.setItem(this.#key.theme, JSON.stringify(theme));
        else
            throw new Error('Invalid theme specified');
    }

    initPlayerNames(numPlayers, machinePlayer) {
        let names = [];
        let name = '';
        names.push('');
        for (let i = 0; i < this.#maxPlayers; i++)
        {
            // Player zero is the machine. The array[0] is not used
            names.push(PLAYER_NAMES[i][0]);
        }
        names[machinePlayer] = MACHINE_NAME;
        if (numPlayers == 2 && machinePlayer > 0) {
            if (machinePlayer == 1)
                names[0] = PERSON_NAME;
            else
                names[1] = PERSON_NAME;
        }
        this.playerNames = names;
        return names;
    }

    getPlayerName(pNumber) {
        let names = this.playerNames;
    
        return names[pNumber];
    }

    updatePlayerName(pNumber, name) {
        let names = this.playerNames;
        names[pNumber] = name;
        this.playerNames = names;

        return names[pNumber];
    }

    get numPlayers() {
        let num = localStorage.getItem(this.#key.numPlayers);
        if (num)
            num = JSON.parse(num);
        else
            num = PARTICIPANTS[DEFAULT_PARTICIPANT_INDEX][1];
        return num;
    }

    set numPlayers(num) {
        if (num >= 2 && num <= this.#maxPlayers)
            localStorage.setItem(this.#key.numPlayers, JSON.stringify(num));
        else
            throw new Error('Invalid number of players');
    }

    get player() {
        let player = localStorage.getItem(this.#key.player);
        if (player)
            player = JSON.parse(player);
        else
            player = 1;
        return player;
    }

    initPlayer() {
        localStorage.setItem(this.#key.player, JSON.stringify(1));
    }

    switchPlayer() {
        let numPlayers = this.numPlayers;
        let player = this.player;
        // Move to the next player
        player = (player == numPlayers) ? 1 : player + 1;
        localStorage.setItem(this.#key.player, JSON.stringify(player));
        return player;
    }

    clearPlayerScores() {
        let score = [];
        for (let i = 0; i <= this.#maxPlayers; i++)
        {
            // Player zero is the machine. The array[0] is not used
            score.push(0);
        }
        localStorage.setItem(this.#key.score, JSON.stringify(score));
        return score;
    }

    getPlayerScore(player) {
        let scores = localStorage.getItem(this.#key.score);
        if (scores)
            scores = JSON.parse(scores);
        else
            scores = this.clearPlayerScores();
    
        return scores[player];
    }

    updatePlayerScore(player, move) {
        let add = 0;
        if (move[1] >= 0)
            add = add + 1;
        if (move[2] >= 0)
            add = add + 1;
        if (add > 0) {
            let scores = localStorage.getItem(this.#key.score);
            if (scores)
                scores = JSON.parse(scores);
            else
                scores = this.clearPlayerScores();
            let newScore = scores[player] + add;
            scores[player] = newScore;
            localStorage.setItem(this.#key.score, JSON.stringify(scores));
        }

        return add;
    }

    pushMove(move) {
        let history = this.history;
        // Add the move to our history
        history.push(move);
        this.history = history;
        // Add the move to our lines array
        let lines = this.lines;
        let line = move[0];
        lines[line] = 1;
        this.lines = lines;
        // Add the move to our claims array 
        if (move[1] + move[2] > -2)
        {
            let claims = this.claims;
            if (move[1] >= 0)
            {
                claims[move[1]] = this.player;
            }
            if (move[2] >= 0)
            {
                claims[move[2]] = this.player;
            }
            this.claims = claims;
        }
        return history;
    }
    
    pushQueue(player, move, score, next) {
        let queue = this.queue;
        let animate = {
            player: player,
            move: move,
            score: score,
            next: next
        };
        queue.push(animate);
        this.queue = queue;
    }

    get queueItem() {
        let queueItem = null;
        if (this.queue.length > 0)
            queueItem = this.queue[0];
        return queueItem;
    }

    storeNewGameSetup(numPlayers=0, machine=0) {
        if (numPlayers === 0)
            numPlayers = PARTICIPANTS[DEFAULT_PARTICIPANT_INDEX][1];
        if (machine === 0)
            machine = DEFAULT_MACHINE_PLAYER;
        this.numPlayers = numPlayers;
        this.machinePlayer = machine;
        this.initPlayerNames(numPlayers, machine);
        this.clearGameValues();
    }
    
    // Pop the last move from storage. 
    popLastMove() {
        let moves = this.history;
        let popped = moves.pop();
        this.history = moves;
        return popped;
    }
    
    // Clear all game specific values from storage
    clearGameValues()
    {
        let clear = [];
        this.history = clear; // Remove does not remove the key
        this.claims = clear; // Remove does not remove the key
        this.queue = clear;
        localStorage.removeItem(this.#key.lines);
        // Set the current player back to player 1
        this.initPlayer();
        // Reset game scores to zeros
        this.clearPlayerScores();
    }
}

pydots.dotgame.storage = new GameStorage();

// Retrieve saved game from localstorage and POST it to server
pydots.dotgame.resumeGame = function()
{
    let game = {
        "size": pydots.dotgame.storage.level,
        "theme": pydots.dotgame.storage.theme,
        "lines": pydots.dotgame.storage.lines,
        "claims": pydots.dotgame.storage.claims
    }
    // Tell fetch we want a POST using JSON data
    // and send the request.
    let options = {
        method: 'POST',
        headers: {
            'Content-Type':
                'application/json;charset=utf-8'
        },
        body: JSON.stringify(game)
    }
    let fetchRes = fetch('/resume/', options);
    fetchRes.then(res => res.text()).then((data) =>
    {
        return data;
    });
}

pydots.dotgame.validateMove = function (line, bAnimate=true)
{
    let player = pydots.dotgame.storage.player;
    let next = player;
    let score = pydots.dotgame.storage.getPlayerScore(player);
    // Send a POST request to the server informing it of our move
    // The body of the request contains the current game state.
    let specs = {
        "size": GAME_SIZE,
        "lines": pydots.dotgame.storage.lines,
        "newline": line
    }
    // Tell fetch we want a POST using JSON data
    // and send the request.
    let options = {
        method: 'POST',
        headers: {
            'Content-Type':
                'application/json;charset=utf-8'
        },
        body: JSON.stringify(specs)
    }
    let fetchRes = fetch('/verify/', options);
    fetchRes.then(res =>
        res.json()).then(d => {
            d.forEach(move => {
                // The final move in the list may signal the game is over
                let gameIsOver = pydots.dotgame.gameOver(move);
                if (gameIsOver)
                {
                    player = -1;
                    next = -1;
                }
                else
                {
                    pydots.dotgame.storage.pushMove(move);
                    // Update our internal score
                    if (pydots.dotgame.storage.updatePlayerScore(player, move) > 0)
                    {
                        score = pydots.dotgame.storage.getPlayerScore(player);
                    }
                    else
                    {
                        // Move to the other player
                        next = pydots.dotgame.storage.switchPlayer();
                    }
                }
                pydots.dotgame.storage.pushQueue(player, move, score, next);
            })
            let event = new CustomEvent('displayMoves');
            document.dispatchEvent(event);
        });
    return;
}

pydots.dotgame.makeMove = function ()
{
    let player = pydots.dotgame.storage.player;
    let next = player;
    let score = pydots.dotgame.storage.getPlayerScore(player);
    let specs = {
        "size": pydots.dotgame.storage.level,
        "lines": pydots.dotgame.storage.lines
    }
    // Tell fetch we want a POST using JSON data
    // and send the request.
    let options = {
        method: 'POST',
        headers: {
            'Content-Type':
                'application/json;charset=utf-8'
        },
        body: JSON.stringify(specs)
    }
    let fetchRes = fetch('/find/', options);
    fetchRes.then(res =>
        res.json()).then(d => {
                d.forEach(move => {
                    // A list of moves is returned. The final entry in the
                    // list may indicate the game has ended.
                    
                    let gameIsOver = pydots.dotgame.gameOver(move);
                    if (gameIsOver)
                    {
                        player = -1;
                        next = -1;
                    }
                    else
                    {
                        pydots.dotgame.storage.pushMove(move);
                        // Do we need to update the score?
                        if (pydots.dotgame.storage.updatePlayerScore(player, move) > 0)
                        {
                            score = pydots.dotgame.storage.getPlayerScore(player);
                        }
                        else
                        {
                            // Machine turn has ended. Switch to human player
                            next = pydots.dotgame.storage.switchPlayer();
                        }
                    }
                    pydots.dotgame.storage.pushQueue(player, move, score, next);
                })
                let event = new CustomEvent("displayMoves");
                document.dispatchEvent(event);
        });
    return;
}

pydots.dotgame.gameOver = function(move)
{
    return move[0] < 0;
}

// Remove the indicated lines and box claims from the game board.
// moves is a list of tuples (line_id, box_id), (line_id, box_id), ...
pydots.dotgame.eraseMove = function (moves, bAnimate=true)
{
    return;
}

// Return true if it is the machine's turn.
pydots.dotgame.isMachineTurn = function()
{
    let player = pydots.dotgame.storage.player;
    return player == pydots.dotgame.storage.machinePlayer;
}

pydots.dotgame.isBottomEdge = function(lineNum)
{
    let maxSquare = GAME_SIZE * GAME_SIZE - 1;
    return lineNum > maxSquare && lineNum <= maxSquare + GAME_SIZE;
}

pydots.dotgame.isRightEdge = function(lineNum)
{
    let numLines = 2 * (GAME_SIZE * GAME_SIZE + GAME_SIZE);
    return lineNum >= numLines - GAME_SIZE && lineNum < numLines;
}

pydots.dotgame.isHorizontal = function(lineNum)
{
    return lineNum < GAME_SIZE * GAME_SIZE + GAME_SIZE;
}

pydots.dotgame.getAdjacentLine = function(lineNum)
{
    let lineIndex = Number(lineNum);
    if (lineIndex >= 2 * (GAME_SIZE * GAME_SIZE + GAME_SIZE) - 1)
        adj = -1;
    else if (lineIndex >= 2 * GAME_SIZE * GAME_SIZE + GAME_SIZE)
        adj = lineIndex + 1
    else if (lineIndex >= 2 * GAME_SIZE * GAME_SIZE )
        adj = -1;
    else if (lineIndex >= GAME_SIZE * GAME_SIZE + GAME_SIZE) 
        adj = lineIndex + GAME_SIZE;
    else if ((lineIndex + 1) % GAME_SIZE > 0)
        adj = lineIndex + 1;
    else
        adj = -1;

    return adj;
}

pydots.dotgame.getBoxNum = function(lineNum)
{
    let boxNum = -1;
    let vertical = lineNum >= GAME_SIZE * GAME_SIZE + GAME_SIZE;
    if (pydots.dotgame.isBottomEdge(lineNum))
        boxNum = lineNum - GAME_SIZE;
    else if (pydots.dotgame.isRightEdge(lineNum))
        boxNum = (lineNum % GAME_SIZE) * GAME_SIZE + GAME_SIZE -1;
    else if (vertical)
        boxNum = lineNum - (GAME_SIZE * GAME_SIZE + GAME_SIZE);
    else
        boxNum = lineNum;
    
    return boxNum;
}

pydots.dotgame.sanitizeString = function(str)
{
    //From StackOverflow
    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
    return str.trim();
}

