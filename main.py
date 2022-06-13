from flask import Flask, render_template, request
import json
import dotgame
app = Flask(__name__)

# Start the game with default values
@app.route("/")
def home():
    size = 3
    boxes = dotgame.game_board(size)
    return render_template('index.html', size=size, boxes = boxes)

# Start a new game with user values
@app.route("/new/", methods = ['POST'])
def new_game():
    size = request.form['glevel']
    boxes = dotgame.game_board(int(size))
    return render_template('index.html',size=size, boxes = boxes)

# Return a list of moves to make for specified board.
@app.route("/find/", methods = ['POST'])
def find_best_move():
    # Get the game size and line array. Return a list of tuples.
    return

# Return the box state after the user's move. If box state is
# -1, the player's turn is over. 
@app.route("/verify/", methods = ['POST'])
def verify_user_move():
    # Get game size, line array, and the move to be made.
    mydata = request.json
    size = mydata['size'] 
    lines = mydata['lines']
    move = mydata['move']
    # Return a tuple (move, box)
    return dotgame.verify_move(size, lines, move)

if __name__ == "__main__":
    app.run(debug=True)

