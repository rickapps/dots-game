# Latest source available at: https://github.com/rickapps/dots-game
# rick@rickapps.com
# August 1, 2022
#
from flask import Flask, render_template, request
import json
import dotgame
app = Flask(__name__)

@app.errorhandler(404)
def page_not_found(error):
    return render_template('error.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('error.html'), 500

# Start a new game with values specified by the user (or not). 
@app.route("/new/", methods = ['POST'])
def new_game():
    size = int(request.form['glevel'])
    lines = dotgame.init_game(size)
    boxes = dotgame.game_board(size, lines)
    return render_template('mainpage.html',size=size, \
        lines=lines, boxes=boxes)

# Resume a game using values from local storage
# The post is done from javascript.
@app.route("/resume/", methods = ['POST'])
def resume_game():
    size = int(request.form['size'])
    # There has got to be a better way to do this! How can I
    # send array data on a form?
    lines = list(map(int, request.form['lines'][1:-1].split(',')))
    claims = list(map(int, request.form['claims'][1:-1].split(',')))
    boxes = dotgame.game_board(size, lines, claims)
    return render_template('mainpage.html',size=size, \
        lines=lines, boxes=boxes)

# Return a list of moves to make for the specified lines array.
# This is where the 'computer' calculates the best move
@app.route("/find/", methods = ['POST'])
def find_best_move():
    # Get the game size and line array. Return a list of tuples.
    mydata = request.json
    size = mydata['size'] 
    lines = mydata['lines']
    move = dotgame.find_move(size, lines)
    # Return a list of tuples [(line,boxA,boxB), (...)]
    return json.dumps(move)

# Get the user's last move. We check if their line
# completes any squares and return the info to the client.
@app.route("/verify/", methods = ['POST'])
def verify_user_move():
    # Get game size, line array, and the move to be made.
    mydata = request.json
    size = mydata['size'] 
    lines = mydata['lines']
    line = mydata['newline']
    # Return a tuple (line, boxA, boxB) as json
    return json.dumps(dotgame.verify_move(size, lines, line))

# Clear all localStorage - might be corrupt.
@app.route("/reset/", methods = ['GET'])
def reset_values ():
    return render_template('startup.html', reset=True)

# A catch-all for unknown requests. path is here for future use.
# This is normal entry-point to the game.
@app.route("/", defaults={'path': ''})
@app.route('/<path:path>')
def home(path):
    return render_template('startup.html', reset=False)

if __name__ == "__main__":
    app.run(debug=True)

