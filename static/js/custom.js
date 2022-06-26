// Get the style sheet
let bodyStyles = document.body.style;
// Set variables in our style sheet.
bodyStyles.setProperty('--gridSize', GAME_SIZE);

// Initialize the game size drop down on the panel
let sizeDropDown = document.getElementById("glevel");
sizeDropDown.value = GAME_SIZE;

// Define a function to change our css theme
const setTheme = theme => document.documentElement.className = theme;
// Set the theme to whatever it was before. We keep that value in localStorage
let theme = localStorage.getItem('theme');
if (theme === null) theme = 'theme1';
setTheme(theme);

// Listen for when someone changes the theme
let colorDropDown = document.getElementById("gcolors");
colorDropDown.value = theme;
colorDropDown.onchange = function () {
    setTheme(this.value);
    // Save the value of the theme so we can retrieve it after a POST
    localStorage.setItem('theme', this.value);
}

// Listen for when someone wants to start a new game
let newGame = document.getElementById("gamevals");
newGame.onsubmit = function() {
    // Verify it is what our user wants to do
    alert("This will end your current game.")
    // Clear our local storage values
    clearGameValues();
}

// Once the page is fully loaded, modify the css to show drawn
// lines and claimed boxes.
window.addEventListener("load", () => {
    // Obtain the current lines
    let lines = getLines();
    let len = lines.length;
    let element;
    for (let i=0; i<len; i++) {
        if (lines[i] > 0)
        {
            element = document.getElementById(i.toString());
            element.classList.add("selected");   
        }
        // We need to claim the squares
    }
});

// Add an event listener to all the lines on our gameboard.
let gameboard = document.getElementById("gameboard");
let lines = gameboard.getElementsByTagName("a");
for (let line of lines) {
    line.addEventListener("click", selectLine, false);
}

function updateSquare(boxNum, player)
{
    let square = document.getElementById("B-" + boxNum);
    let claim = player == 1 ? "claim1" : "claim2";
    square.classList.add(claim);
}

// Check if the move claims any squares. If so, update the
// gameboard with the player's color, update the player's
// score and return true. Otherwise, do nothing and return false.
function claimSquares(move, player) {
    let points = 0;
    if (move[1] >= 0)
    {
        points += 1;
        updateSquare(move[1], player);
    }
    if (move[2] >= 0)
    {
        points += 1;
        updateSquare(move[2], player);
    }
    updateScore(player, points);
    return points > 0;
}

// Update the gameboard when someone clicks on a line
// In other words, the user has made a move. This is
// the meat and potatoes of the game.
function selectLine(evt) {
    // Send a POST request to the server informing it of our move
    // The body of the request contains the current game state.
    let specs = {
        "size": GAME_SIZE,
        "lines": getLines(),
        "newline": parseInt(evt.target.id)
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
    // any squares and give our player one or two points.
    fetchRes.then(res =>
        res.json()).then(d => {
            // Update our storage
            pushMove(d);
            claimSquares(d);
        })
    evt.target.classList.add("selected");
    drawMove(evt.target.id)
} 

