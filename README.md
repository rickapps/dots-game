# dots-game
## Dots game using CSS, Javascript, and Flask

Links: [https://dotsgame.rickapps.com](https://dotsgame.rickapps.com) or [https://playdots.uc.r.appspot.com/](https://playdots.uc.r.appspot.com/)

Modify the look and feel of the game by changing the three css files located in folder **static/css.** You may also want to revise **static/js/custom.js. Custom.js** contains code to respond to three custom events; *drawLine*, *updatePlayer*, and *updateScore*. These events draw a single line connecting two dots, update the board to indicate whose turn it is, and update the scoreboard respectively. 

You can code a UI that does not use Flask. The UI only needs to post the player's move to the server and request the machine move from the server. The server provides logic to detect when a square is complete and when a player's turn has ended. It can also determine the best available move at any time. The jinja code in the current UI allows the Flask server to create an initial gameboard of any size. But if you remove the jinja, you could host the UI of the dots game on any server and make POST requests to a Flask server hosted elsewhere.

### Box and Line Numbering Scheme
 
The top left square has id=0. The bottom right square has id=squareCount-1. Each square has four sides; Top, Right, Bottom, and Left. If the square is complete it has an owner of Player1 or Player2. All horizontal lines are numbered sequentially from the top left to the bottom right. The top segment 
of square zero is numbered zero, the top segment of square one is one, the bottom segment of square squareCount-1 is numbered (squareCount-1)+gameSize; Vertical lines are then numbered sequentially starting with the left side of square zero (The line id is squareCount+gameSize). However, vertical lines are not numbered sequentially all the way to the last column. Instead, the numbering ends at the right side of the square just before the last column. The vertical lines composing the outer right edge of the dot game board are not assigned numbers until all the other vertical lines are assigned. Then the right edge is numbered from top to bottom. 

![Example 4x4 game](static/img/DotNumbering2.png)

For 4x4 game board, gameSize is 4. squareCount is 16. Squares are numbered 0-15. Horizontal lines on top edge of game board are numbered 0-3. Horizontal lines on bottom edge of game board are numbered 16-19. Vertical lines on the left edge are numbered 20,24,28,32. Vertical lines on the right edge of the game board are numbered 36,37,38,39. Vertical lines on the first row of the gameboard are numbered 20,21,22,23,36. The second row of vertical lines are numbered 24,25,26,27,37. The numbering scheme makes formulas for computing related squares and lines easier.

### Definitions of terms used in the code

**claims:** a list of all boxes on the gameboard. Indices correspond to the description above. If a list value is -1, the box is not claimed. A value of 1 or 2 means a claim by player1 or player2.

**history:** a list of all moves in the game. It is a list of lists of move tuples. Odd indexes will be player0 moves and even indexes will be player1 moves.

**lines:** a list of lines on the gameboard. Indices correspond to the description above. A value of 1 means the line has been selected. A value of 0 means the line is available to select.

**move:** a three value tuple. Val0 is the line# selected, Val1 is the box# claimed. Val3 is the second box claimed. (2, 0, -1) means line#2 was selected and it completes box#0. (2,-1,-1) means line#2 was selected and no boxes were completed. (-1,-1,-1) means game is over, there are no lines left to select.

**moves:** a list of move tuples. Whenever a player completes a box, he gets to select a new line. The list of move tuples will always end with move (line#, -1,-1), except for the last move of the game.




