# dots-game
## Client/Server Dots game using Python Flask, Javascript, and CSS 

Links: [https://dotsgame.rickapps.com](https://dotsgame.rickapps.com) or [https://playdots.uc.r.appspot.com/](https://playdots.uc.r.appspot.com/)

### Server Commands

1) Start a new game. Returns a web page depicting a gameboard of the specified size.

        POST /new/
        {
            size: size
        }
2) Resume a game in progress. Returns a web page depicting a gameboard of the specified state.

        POST /resume/
        {
            size: size,
            lines: lines[],
            claims: claims[]
        }

3) Determine the best move(s) for a gameboard of the specified state. Typically this would be the computer's turn in the game. Returns a list of tuples: **[(line#,box#,box#), (line#,box#,box#), ...]** where line number is the line to add. A single line can complete up to two boxes. Box#  is -1 if no box is complete, otherwise the box# of the completed box. As long as at least one box is completed, the player adds an additional line. The last tuple in the list will always have -1 for both box numbers.

        POST /find/
        {
            size: size,
            lines: lines[]
        }

4) Determine squares completed by a specified line. Typically this would be a player's turn in the game. Returns a single tuple: **(line#,box#,box#)** using the same format as above. If both box#'s are -1, the player's turn has ended. If line# is -1, the game is over or the line was already taken.  

        POST /verify/
        {
            size: size,
            lines: lines[],
            line: line#
        }

5) Clear localStorage used by the game in the event of corruption or updates. Players are directed here in response to server errors. Once storage is cleared, a new game is started.

        GET /reset/

6) Normal entry-point to the game. If localStorage contains a game in progress, player is redirected to ***/resume/***. If no game is in progress, player is redirected to ***/new/***.

        GET /

### Definitions of terms used in the code

**claims[]:** A list of all boxes on the gameboard. If **claims[box#]** is 0, the box is not claimed. Values greater than zero are the player number of the box owner. Boxes are numbered according to the diagram below.

**history[]:** A list of all moves in the game. It is a list of lists of move tuples.

**lines[]:** The lines connecting the dots on the gameboard. **lines[line#]** is 1 if the line has been drawn or 0 if the line is available. Lines are numbered according to the diagram below. 

**move:** A move is a tuple (line#,box#,box#) where lines and boxes are numbered according to the diagram below. A player's turn can consist of multiple moves. A single line can complete up to two boxes. If a line completes a box, that player gets another move. (2, -1, -1) means no boxes were completed by the line, (2, 2, -1) means line2 completed box2 and no other boxes. 

**size:** The number of squares on each side of the gameboard. The total number of squares is size**2. Note: The terms *boxes* and *squares* are used interchangeably. A gameboard of size three contains nine squares or boxes.

### Box and Line Numbering Scheme
 
The top left square has id=0. The bottom right square has id=squareCount-1. Each square has four sides; Top, Right, Bottom, and Left. If the square is complete it has a claim by the player that completed the box. All horizontal lines are numbered sequentially from the top left to the bottom right. The top segment of square zero is numbered zero, the top segment of square one is one, the bottom segment of square squareCount-1 is numbered (squareCount-1)+gameSize; Vertical lines are then numbered sequentially starting with the left side of square zero (The line id is squareCount+gameSize). However, vertical lines are not numbered sequentially all the way to the last column. Instead, the numbering ends at the right side of the square just before the last column. The vertical lines composing the outer right edge of the dot game board are not assigned numbers until all the other vertical lines are assigned. Then the right edge is numbered from top to bottom. 

![Example 4x4 game](static/img/DotNumbering2.png)

For 4x4 game board, gameSize is 4. squareCount is 16. Squares are numbered 0-15. Horizontal lines on top edge of game board are numbered 0-3. Horizontal lines on bottom edge of game board are numbered 16-19. Vertical lines on the left edge are numbered 20,24,28,32. Vertical lines on the right edge of the game board are numbered 36,37,38,39. Vertical lines on the first row of the gameboard are numbered 20,21,22,23,36. The second row of vertical lines are numbered 24,25,26,27,37. The numbering scheme makes formulas for computing related squares and lines easier.

