from flask import Flask, render_template, request
import json
import dotgame
app = Flask(__name__)
app.config.from_pyfile('config.py')

# Some definitions:
# move: a three value tuple. Val0 is the line# selected, Val1 is the box# claimed.
# Val3 is the second box claimed. (2, 0, -1) means line#2 was selected and it 
# completes box#0. (2,-1,-1) means line#2 was selected and no boxes were completed.
# (-1,-1,-1) means game is over, there are no lines left to select.
# lines: a list of lines on the gameboard. A value of 1 means the line
# has been selected. A value of 0 means the line is available to select.
# moves: a list of move tuples. Whenever a player completes a box, he gets to
# select a new line. The list of move tuples will always end with (line#, -1, -1),
# except for the last move of the game.
# history: a list of all moves in the game. It is a list of lists of move tuples.
# Odd indexes will be player0 moves and even indexes will be player1 moves.
# claims: a list of all boxes on the gameboard. If the value is -1, the box
# is not claimed. A value of 1 or 2 means a claim by player1 or player2.
#### 
#  Start the game with default values. We won't clear local storage here
# because the user could be continuing their last game.
glevels = app.config['GAME_LEVELS']
gthemes = app.config['GAME_THEMES']
@app.route("/")
def home():
    default = app.config['DEFAULT_SIZE_INDEX']
    size = glevels[default][1]
    lines = dotgame.init_game(size)
    boxes = dotgame.game_board(size, lines)
    return render_template('index.html', size=size, lines=lines, boxes=boxes, glevels=glevels, gthemes=gthemes)

# Start a new game with values specified by the user. For this case, 
# localStorage has been cleared before the POST was issued.
@app.route("/new/", methods = ['POST'])
def new_game():
    size = int(request.form['glevel'])
    lines = dotgame.init_game(size);
    boxes = dotgame.game_board(size, lines)
    return render_template('index.html',size=size, lines=lines, boxes=boxes, glevels=glevels, gthemes=gthemes)

# Return a list of moves to make for the specified lines list
@app.route("/find/", methods = ['POST'])
def find_best_move():
    # Get the game size and line array. Return a list of tuples.
    mydata = request.json
    size = mydata['size'] 
    lines = mydata['lines']
    move = dotgame.find_move(size, lines)
    return

# Return the box state after the user's move. If box state is
# -1, the player's turn is over. 
@app.route("/verify/", methods = ['POST'])
def verify_user_move():
    # Get game size, line array, and the move to be made.
    mydata = request.json
    size = mydata['size'] 
    lines = mydata['lines']
    line = mydata['newline']
    # Return a tuple (move, box) as json
    return json.dumps(dotgame.verify_move(size, lines, line))

if __name__ == "__main__":
    app.run(debug=True)

