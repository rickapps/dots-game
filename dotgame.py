# Copyright (c) 2022 Rick Eichhorn
# Latest source available at: https://github.com/rickapps/
# rick@rickapps.com
# September 4, 2022
#
import json
import gameboard
import random

# Returns the array of boxes that constitutes the game board.
# The number of boxes returned is size**2. The lines array
# indicates which box sides have already been drawn (prefill).
# The claims list contains completed boxes and their owner. 
def game_board(size, lines=[], claims=[]):
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
        box['options'] = []
        if len(lines) > 0 and len(claims) > 0:
            # Check for completed lines and claims
            if lines[box['top']] > 0:
                box['options'].append('top')
            if lines[box['left']] > 0:
                box['options'].append('left')
            if lines[box['bottom']] > 0:
                box['options'].append('bottom')
            if lines[box['right']] > 0:
                box['options'].append('right')
            # Record the claim
            box['options'].append(claims[i])
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

# The best non-scoring move is a move that minimizes the 
# next player's points. If possible, do not create any
# three sided boxes. If you do, make sure it is on the
# shortest box chain.
def find_best_nonscoring_move(size, lines):
    # Make a list of available lines and sort them randomly.
    available = []
    for i in range(len(lines)):
        if lines[i] == 0:
            available.append(i)
    random.shuffle(available)

    # Try each line. If the line does not score any points, check
    # that it does not give another player the chance to complete
    # squares. 
    best_line = -1
    best_move = []
    cost = 1000
    game = gameboard.GameBoard(size, lines)
    for index in available:
        if game.is_scoring_line(index):
            best_move.append(game.update_game_board(index))
        else:
            trial_cost = game.get_line_cost(index)
            if trial_cost < cost:
                best_line = index
                cost = trial_cost
        # Did we find a move that does not cost us anything?
        if cost == 0:
            break
    # Use the line that cost us the least
    best_move.append((best_line, -1, -1))
    return best_move

# Search for a good move given the lines that are
# currently drawn. If a square is completed, a list
# of moves is returned. If the final move is (-1,-1,-1),
# the game is over. A move is a tuple (line, box1, box2) where
# line is the line# to draw and box is the square to claim. Up
# to two boxes can be claimed by a single line.  The code below
# will not always find the 'best' move as it does not look ahead.
# The game should be more fun if the computer sometimes messes up.
# The function returns a list of moves.
def find_move(size, lines):
    game = gameboard.GameBoard(size, lines)
    # Check for squares that can be completed. The computer will
    # always complete a square without looking at the consequences.
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

    # We are out of the loop. Add a move to end our turn
    move.extend(find_best_nonscoring_move(size, game.lines))

    return move   

# Main purpose is to indicate if a box color should
# change (claim a square). The return value is a tuple,
# (line, box1, box2). If both boxes are -1, the turn is ended. 
# If any box is positive, that box is claimed, and the player 
# gets another turn. If line is -1, the game is over.
def verify_move(size, lines, newline):
    move = []
    game = gameboard.GameBoard(size, lines)
    move.append(game.update_game_board(newline))
    if game.is_game_complete():
        move.append((-1,-1,-1))
    return move

    