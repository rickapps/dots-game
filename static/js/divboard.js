// Set up the proper number of columns for our boxes
var columns = document.getElementById("gameSize").value;
var bodyStyles = document.body.style;
// Set variables in our style sheet.
bodyStyles.setProperty('--gridSize', columns);

// Initialize the game size drop down on the panel
var sizeDropDown = document.getElementById("glevel");
sizeDropDown.value = columns;

// Define a function to change our css theme
const setTheme = theme => document.documentElement.className = theme;
// Set the theme to whatever it was before.
var theme = localStorage.getItem('theme');
if (theme === null) theme = 'theme1';
setTheme(theme);
// Set the theme when the dropdown changes
colorDropDown = document.getElementById("gcolors");
colorDropDown.value = theme;
colorDropDown.onchange = function() {
    setTheme(this.value);
    // Save the value of the theme so we can retrieve it after a POST
    localStorage.setItem('theme', this.value);
}

// Add an event listener to all our gameboard lines
const gameboard = document.getElementById("gameboard");
const lines = gameboard.getElementsByTagName("a");
for (let line of lines) {
    line.addEventListener("click", selectLine, false);
}

function selectLine(evt) {
    evt.target.classList.add("selected");

} 