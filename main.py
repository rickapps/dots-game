# Latest source available at: https://github.com/rickapps/dots-game
# rick@rickapps.com
# August 1, 2022
#
from flask import Flask, render_template, request
import json
import dotgame
app = Flask(__name__)
app.config.from_pyfile('config.py')

# Some definitions:
# lines: a list of lines on the gameboard. A value of 1 means the line
# has been selected. A value of 0 means the line is available to select.
#
# move: a three value tuple. Val0 is the line# selected, Val1 is the box# claimed.
# Val3 is the second box claimed. (2, 2, -1) means line#2 was selected and it 
# completes box#2. (2,-1,-1) means line#2 was selected and no boxes were completed.
# (-1,-1,-1) means game is over, there are no lines left to select.
#
# moves: a list of move tuples. Whenever a player completes a box, he gets to
# select a new line. The list of move tuples will always end with (line#, -1, -1),
# except for the last move of the game.
#
# history: a list of all moves in the game. It is a list of lists of move tuples.
#
# claims: a list of all boxes on the gameboard. If the value is 0, the box
# is not claimed. Values greater than zero are the player number of the box owner.
#### 
#  Start the game with default values. 
glevels = app.config['GAME_LEVELS']
gthemes = app.config['GAME_THEMES']
gplayers = app.config['PARTICIPANTS']
machine = app.config['MACHINE_NAME']
nomachine = app.config['NO_MACHINE']
pnames = app.config['PLAYER_NAMES']
default_size = app.config['DEFAULT_SIZE_INDEX']
default_theme = app.config['DEFAULT_THEME_INDEX']
size = int(glevels[default_size][1])
theme = gthemes[default_theme][1]
lines = []
boxes = []

# Start a new game with values specified by the user (or not). 
@app.route("/new/", methods = ['GET', 'POST'])
def new_game():
    if request.method == 'POST':
        size = int(request.form['glevel'])
        theme = request.form['gcolors']
    lines = dotgame.init_game(size)
    boxes = dotgame.game_board(size, lines)
    return render_template('mainpage.html',size=size, theme=theme, \
         lines=lines, boxes=boxes, glevels=glevels, gthemes=gthemes)

# Resume a game using values from local storage
# The post is done from javascript.
@app.route("/resume/", methods = ['POST'])
def resume_game():
    size = int(request.form['size'])
    theme = request.form['theme']
    # There has got to be a better way to do this! How can I
    # send array data on a form?
    lines = list(map(int, request.form['lines'][1:-1].split(',')))
    claims = list(map(int, request.form['claims'][1:-1].split(',')))
    boxes = dotgame.game_board(size, lines, claims)
    return render_template('mainpage.html',size=size, theme=theme, \
        lines=lines, boxes=boxes, glevels=glevels, gthemes=gthemes)

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

# Display the options page.
@app.route("/options/")
def show_options():
    return render_template('options.html', size=size, theme=theme, \
        lines=lines, boxes=boxes, glevels=glevels, gthemes=gthemes, \
        gplayers=gplayers, machine=machine, nomachine=nomachine, \
        pnames=pnames)

# A catch-all for unknown requests. path is here for future use.
@app.route("/", defaults={'path': ''})
@app.route('/<path:path>')
def home(path):
    return render_template('startup.html',size=size, theme=theme, \
         lines=lines, boxes=boxes, glevels=glevels, gthemes=gthemes)

if __name__ == "__main__":
    app.run(debug=True)

