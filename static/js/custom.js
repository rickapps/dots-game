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
if (theme === null) theme = INIT_THEME;
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

// Listen for page load, modify the css to show drawn
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
    }
    let claims = getClaims();
    len = claims.length;
    for (let i=0; i<len; i++) {
        if (claims[i] >= 0)
        {
            element = document.getElementById("B-" + i.toString());
            let claim = claims[i] == 1 ? "claim1" : "claim2";
            element.classList.add(claim);
        }
    }
});

// Add an event listener to all the lines on our gameboard.
let gameboard = document.getElementById("gameboard");
let lines = gameboard.getElementsByTagName("a");
for (let line of lines) {
    line.addEventListener("click", selectLine, false);
}
function selectLine(evt) {
    let move = validateMove(parseInt(evt.target.id));
} 

// Add an event listener to update the gameboard when a
// player makes a move.
document.addEventListener("drawMove", (e) => {
    let move = e.detail.move;
    if (move[0] >= 0)
    {
        // Store the move
        pushMove(move)
        // draw our line
        let line = document.getElementById(move[0].toString());
        line.classList.add("selected");
        // claim any squares
        if (!claimSquares(move, 1))
        {
            // toggle turn
        }
    }
});

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

function updateSquare(boxNum, player)
{
    let square = document.getElementById("B-" + boxNum);
    let claim = player == 1 ? "claim1" : "claim2";
    square.classList.add(claim);
}
