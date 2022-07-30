import json
import gameboard
import random

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
    game = gameboard.GameBoard(size, lines)
    # Check for squares that can be made
    points = 0
    move = []
    more_three_sided = True
    while more_three_sided:
        more_three_sided = False
        for i in range(game.num_boxes):
            if game.count_completed_sides(i) == 3:
                more_three_sided = True
                points += game.complete_joined_boxes(i, move)
                break

    # All scoring moves have been made
    # Randomly pick indices until we find a line that is not taken
    upper = game.num_lines
    index_list = [random.randint(0, upper-1) for i in range(0,upper)]
    for index in index_list:
        if lines[index] == 0:
            # We found a move
            move.append(game.update_game_board(index))
            if move[-1][1] == -1 and move[-1][2] == -1:
                break
        
    return move  

# Main purpose is to indicate if a box color should
# change (claim a square). The return value is a tuple,
# (line, box1, box2). If both boxes are -1, the turn is ended. 
# If any box is positive, that box is claimed, and the player 
# gets another turn. If line is -1, the game is over.
def verify_move(size, lines, newline):
    game = gameboard.GameBoard(size, lines)
    move = game.update_game_board(newline)
    return move


    