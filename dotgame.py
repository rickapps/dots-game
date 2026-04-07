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

# Returns 'top', 'bottom', 'left', 'right', or 'center' for a Level 2 hint.
# Randomly divides the board into top/bottom or left/right halves. If the
# chosen dividing line shares any point with the game line segment, the
# orientation is switched. If both orientations share a point, returns 'center'.
#
# Horizontal game lines are tested against a vertical (left/right) boundary by
# checking whether the boundary falls strictly within the segment's column span.
# Vertical game lines are tested against a horizontal (top/bottom) boundary the
# same way using the row span. A line that coincides with a boundary (only
# possible on even-sized boards) always fails that orientation's test.
def _get_level2_hint(size, line):
    N = size
    half = N / 2.0
    numH = N * (N + 1)

    if line < numH:
        # Horizontal line: fixed at dot_row, spanning dot cols [col_start, col_start+1]
        dot_row = line // N
        col_start = line % N
        intersects_lr = col_start < half < col_start + 1
        intersects_tb = (dot_row == half)

        orientation = random.choice(['tb', 'lr'])
        if orientation == 'lr' and intersects_lr:
            orientation = 'tb'
        elif orientation == 'tb' and intersects_tb:
            orientation = 'lr'

        if orientation == 'tb':
            return 'center' if intersects_tb else ('top' if dot_row < half else 'bottom')
        else:
            return 'center' if intersects_lr else ('left' if col_start + 0.5 < half else 'right')
    else:
        # Vertical line: fixed at dot_col, spanning dot rows [row_start, row_start+1]
        v = line - numH
        if v < N * N:
            dot_col, row_start = v % N, v // N
        else:                          # right-edge lines
            dot_col, row_start = N, v - N * N

        intersects_tb = row_start < half < row_start + 1
        intersects_lr = (dot_col == half)

        orientation = random.choice(['tb', 'lr'])
        if orientation == 'tb' and intersects_tb:
            orientation = 'lr'
        elif orientation == 'lr' and intersects_lr:
            orientation = 'tb'

        if orientation == 'lr':
            return 'center' if intersects_lr else ('left' if dot_col < half else 'right')
        else:
            return 'center' if intersects_tb else ('top' if row_start + 0.5 < half else 'bottom')

# Analyze the current board and return hint data for all three levels.
# Returns a dict with keys:
#   'hint'     - Level 1 message string
#   'quadrant' - Level 2 quadrant string (e.g. 'top-left')
#   'line'     - Level 3 exact best line index (int)
# Priority: scoring move > free move (cost==0) > min-cost move.
def get_hint(size, lines):
    game = gameboard.GameBoard(size, lines)
    available = [i for i in range(len(lines)) if lines[i] == 0]

    # Check for any scoring move first
    scoring_line = None
    for line in available:
        if game.is_scoring_line(line):
            scoring_line = line
            break

    if scoring_line is not None:
        best_line = scoring_line
        msg = "You have a scoring move!"
    else:
        # Count free moves (cost == 0) and track the min-cost move
        free_count = 0
        first_free = None
        min_cost = None
        min_cost_line = None
        for line in available:
            cost = game.get_line_cost(line)
            if cost == 0:
                free_count += 1
                if first_free is None:
                    first_free = line
            else:
                if min_cost is None or cost < min_cost:
                    min_cost = cost
                    min_cost_line = line

        if free_count > 0:
            best_line = first_free
            if free_count == 1:
                msg = "You have one free move available."
            else:
                msg = f"You have {free_count} free moves available!"
        else:
            best_line = min_cost_line
            if min_cost is None:
                min_cost = 0
            msg = f"Your best move allows your opponent to complete {min_cost} square{'s' if min_cost != 1 else ''}."

    return {'hint': msg, 'half': _get_level2_hint(size, best_line), 'line': best_line}


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

    