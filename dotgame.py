import json
import gameboard
# Returns the array of boxes that constitues the game board.
# The number of boxes returned is size**2. The lines array
# indicates which box sides have already been drawn (prefill).
# The history array are moves made after the game has started. 
# Box squares can only be claimed (colored) based on history.
def game_board(size, lines=[], history=[]):
    boxes = []
    
    for i in range(size * size):
        box = {}
        box['boxID'] = "B-" + str(i)
        boxType = 'Normal'
        if (i+1)%size == 0:
            boxType = 'Right'
        if i >= size * (size-1):
            if boxType == 'Normal':
                boxType = 'Bottom'
            else:
                boxType = 'Both'
        box['boxType'] = boxType
        box['top'] = i
        box['left'] = i+size*(size+1)
        box['bottom'] = i+size
        box['right'] = i+1+size*(size+1)
        if boxType == 'Right' or boxType == 'Both':
            box['right'] = size*size+((i+1)//size + size*(size+1))-1
        boxes.append(box)

    return boxes

# No gameboard is necessary. If no prefill is needed,
# an array of blank lines is returned. Otherwise,
# box lines are drawn, but no squares are completed.
# The returned array should be passed to game_board.
def init_game(size, prefill=False):
    # The number of lines is size*size*2+2*size. Initially,
    # all lines in the array are zero.
    lines = [0] * (size*size*2 + 2*size)
    return lines

# Search for the best move given the lines that are
# currently drawn. If a square is completed, a list
# of moves is returned. If the final move is (-1,-1,-1),
# the game is over. A move is a tuple (line, box1, box2) where
# line is the line# to draw and box is the square to claim. Up
# to two boxes can be claimed by a single line.
# find_move returns a list of moves.
def find_move(size, lines):
    return [(7,3,-1)]  

# Main purpose is to indicate if a box color should
# change (claim a square). The return value is a tuple,
# (line, box1, box2). If both boxes are -1, the turn is ended. 
# If any box is positive, that box is claimed, and the player 
# gets another turn. If line is -1, the game is over.
def verify_move(size, lines, newline):
    game = gameboard.GameBoard(size, lines)
    move = game.update_game_board(newline)
    return move

