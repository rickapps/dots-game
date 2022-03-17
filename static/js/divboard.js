var slider = document.getElementById("myRange");
var side = document.getElementById("gameboard");

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  var myside = 350 + 5 * this.value + 'px';
  side.style.width = myside;
  side.style.height = myside;

} 