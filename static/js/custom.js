// Get the style sheet
var bodyStyles = document.body.style;
// Set variables in our style sheet.
bodyStyles.setProperty('--gridSize', GAME_SIZE);

// Initialize the game size drop down on the panel
var sizeDropDown = document.getElementById("glevel");
sizeDropDown.value = GAME_SIZE;

// Define a function to change our css theme
const setTheme = theme => document.documentElement.className = theme;
// Set the theme to whatever it was before. We keep that value in localStorage
var theme = localStorage.getItem('theme');
if (theme === null) theme = 'theme1';
setTheme(theme);

// Listen for when someone changes the theme
colorDropDown = document.getElementById("gcolors");
colorDropDown.value = theme;
colorDropDown.onchange = function () {
    setTheme(this.value);
    // Save the value of the theme so we can retrieve it after a POST
    localStorage.setItem('theme', this.value);
}

// Listen for when someone wants to start a new game
newGame = document.getElementById("gamevals");
newGame.onsubmit = function() {
    // Verify it is what our user wants to do
    alert("This will end your current game.")
    // Clear our local storage values
    clearGameValues();
}


// Add an event listener to all the lines on our gameboard.
const gameboard = document.getElementById("gameboard");
const lines = gameboard.getElementsByTagName("a");
for (let line of lines) {
    line.addEventListener("click", selectLine, false);
}

// Update the gameboard when someone clicks on a line
function selectLine(evt) {
    // Send a POST request to the server informing it of our move
    // The body of the request contains the current game state.
    specs = {
        "size": GAME_SIZE,
        "lines": getLines(),
        "newline": evt.target.id,
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
    // Use our results to update the gameboard. The only thing
    // new we get from the server is whether we need to claim 
    // a square and give our player a point.
    fetchRes.then(res =>
        res.json()).then(d => {
            console.log(d)
        })
    // Call drawMove from dotgame.js
    evt.target.classList.add("selected");
    drawMove(evt.target.id)
} 

