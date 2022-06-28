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
    // Does not repaint the screen unless first. Might want to
    // trigger events to update screen instead.
    evt.target.classList.add("selected");
    let move = validateMove(parseInt(evt.target.id));
    if (!claimSquares(move, 1))
    {
        // toggle turn
    }
    if (move[0] >= 0)
    {
        // Store the move
        pushMove(move)
        // draw our line
        evt.target.classList.add("selected");
        // claim any squares
    }
} 

