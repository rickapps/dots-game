# Latest source available at: https://github.com/rickapps/dots-game
# rick@rickapps.com
# August 1, 2022
#
from flask import Flask, render_template, request, abort, send_from_directory
import json
import dotgame
app = Flask(__name__)

VALID_SIZES = {3, 5, 7, 10}

def _validate_size(size):
    if size not in VALID_SIZES:
        abort(400)

def _validate_lines(size, lines):
    expected = 2 * (size * size + size)
    if len(lines) != expected or not all(v in (0, 1) for v in lines):
        abort(400)

def _validate_claims(size, claims):
    if len(claims) != size * size or not all(0 <= v <= 4 for v in claims):
        abort(400)

def _validate_newline(lines, line):
    if not (0 <= line < len(lines)) or lines[line] != 0:
        abort(400)

@app.errorhandler(400)
def bad_request(error):
    return render_template('error.html'), 400

@app.errorhandler(404)
def page_not_found(error):
    return render_template('error.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('error.html'), 500

# Start a new game with values specified by the user (or not).
@app.route("/new/", methods = ['POST'])
def new_game():
    try:
        size = int(request.form['glevel'])
    except (KeyError, ValueError):
        abort(400)
    _validate_size(size)
    lines = dotgame.init_game(size)
    boxes = dotgame.game_board(size, lines)
    return render_template('mainpage.html', size=size, lines=lines, boxes=boxes)

# Resume a game using values from local storage
# The post is done from javascript.
@app.route("/resume/", methods = ['POST'])
def resume_game():
    try:
        size = int(request.form['size'])
        # Arrays arrive as JSON-stringified values from localStorage
        lines = list(map(int, request.form['lines'][1:-1].split(',')))
        claims = list(map(int, request.form['claims'][1:-1].split(',')))
    except (KeyError, ValueError):
        abort(400)
    _validate_size(size)
    _validate_lines(size, lines)
    _validate_claims(size, claims)
    boxes = dotgame.game_board(size, lines, claims)
    return render_template('mainpage.html', size=size, lines=lines, boxes=boxes)

# Return a list of moves to make for the specified lines array.
# This is where the 'computer' calculates the best move
@app.route("/find/", methods = ['POST'])
def find_best_move():
    try:
        mydata = request.json
        size = int(mydata['size'])
        lines = list(map(int, mydata['lines']))
    except (TypeError, KeyError, ValueError):
        abort(400)
    _validate_size(size)
    _validate_lines(size, lines)
    move = dotgame.find_move(size, lines)
    # Return a list of tuples [(line,boxA,boxB), (...)]
    return json.dumps(move)

# Get the user's last move. We check if their line
# completes any squares and return the info to the client.
@app.route("/verify/", methods = ['POST'])
def verify_user_move():
    try:
        mydata = request.json
        size = int(mydata['size'])
        lines = list(map(int, mydata['lines']))
        line = int(mydata['newline'])
    except (TypeError, KeyError, ValueError):
        abort(400)
    _validate_size(size)
    _validate_lines(size, lines)
    _validate_newline(lines, line)
    # Return a tuple (line, boxA, boxB) as json
    return json.dumps(dotgame.verify_move(size, lines, line))

# Return a Level 1 hint message based on the current board state.
@app.route("/hint/", methods = ['POST'])
def get_hint():
    try:
        mydata = request.json
        size = int(mydata['size'])
        lines = list(map(int, mydata['lines']))
    except (TypeError, KeyError, ValueError):
        abort(400)
    _validate_size(size)
    _validate_lines(size, lines)
    hint = dotgame.get_hint(size, lines)
    return json.dumps(hint)

@app.route("/robots.txt")
def robots():
    return send_from_directory(app.root_path, 'robots.txt')

@app.route("/sitemap.xml")
def sitemap():
    return send_from_directory(app.root_path, 'sitemap.xml', mimetype='application/xml')

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
