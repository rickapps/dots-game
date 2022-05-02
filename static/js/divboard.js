// Set up the proper number of columns for our boxes
var columns = document.getElementById("gameSize").value;
var bodyStyles = document.body.style;
// Set variables in our style sheet.
bodyStyles.setProperty('--gridSize', columns);

// Initialize the game size drop down on the panel
var sizeDropDown = document.getElementById("glevel");
sizeDropDown.value = columns;

