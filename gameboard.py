# Latest source available at: https://github.com/rickapps/dots-game
# rick@rickapps.com
# August 1, 2022
#
# Class to represent a dot game board. 
class GameBoard:
    def __init__(self, size, lines):
        self.size = size
        self.lines = lines
        self.num_boxes = size*size
        self.num_lines = 2 * (self.num_boxes + self.size)
        self.num_horizontal = int(self.num_lines / 2)   # We know num_lines is always even
        

    # Indicates if the line is horizontal or vertical
    def is_line_horizontal(self, line_num):
        return line_num < self.num_horizontal

    # Returns the two boxes that include the line
    # The two boxes will be (box_left, box_right) OR (box_top, box_bottom)
    def get_adjacent_boxes(self, line_num):
        box1 = -1 # left or top
        box2 = -1 # right or bottom
        if self.is_line_horizontal(line_num):
            box2 = line_num
            box1 = line_num - self.size
            # Special case
            if box2 >= self.num_boxes:
                box2 = -1
            if box1 < 0:
                box1 = -1
        else:
            box2 = line_num - self.num_horizontal
            box1 = box2 - 1
            # Special cases
            if box2 >= self.num_boxes:
                box2 = -1
                box1 = (line_num % self.size) * self.size + self.size - 1 
            if box2 % self.size == 0:
                box1 = -1
    
        return (box1,box2)
    
    # Get the top and bottom of the box
    def get_box_sides_h(self, box_num):
        box_top = box_num
        box_bottom = box_top + self.size
        return (box_top, box_bottom)

    # Get the right and left sides of the box
    def get_box_sides_v(self, box_num):
        box_left = box_num + self.num_horizontal
        box_right = box_left + 1
        if box_right % self.size == 0:
            box_right = int((box_left - self.num_horizontal) // self.size) + self.num_lines - self.size
        return (box_left, box_right)

    # Indicates if all four sides of the box are drawn
    def is_box_complete(self, box_num):
        is_complete = self.count_completed_sides(box_num) == 4
        return is_complete

    # Return the line that would complete the given square if it
    # exists. Otherwise, return -1.
    def get_missing_side(self, box_num):
        # If the box has three sides, return the missing line
        lines = self.get_box_sides_h(box_num) + self.get_box_sides_v(box_num)
        # Loop on values in the tuple
        count = 0
        free = -1
        for line in lines:
            if self.lines[line] == 0:
                free = line
            else:
                count+=1
        line = free if count == 3 else -1
        return line

    # Return a count of the number of completed sides of the 
    # specified square.
    def count_completed_sides(self, box_num):
        hlines = self.get_box_sides_h(box_num)
        vlines = self.get_box_sides_v(box_num)
        count = self.lines[hlines[0]] + self.lines[hlines[1]] + \
           self.lines[vlines[0]] + self.lines[vlines[1]] 
        return count

    # Update the lines array with the specified move and determine
    # if the move completes any boxes. -1 means box not complete
    def update_game_board(self, new_line):
        self.lines[new_line ] = 1
        boxes = self.get_adjacent_boxes(new_line)
        new_box1 = -1
        new_box2 = -1
        if boxes[0] >= 0 and self.is_box_complete(boxes[0]):
            new_box1 = boxes[0]
        if boxes[1] >= 0 and self.is_box_complete(boxes[1]):
            new_box2 = boxes[1]
        return (new_line, new_box1, new_box2)

    def is_scoring_line(self, line):
        assert(self.lines[line] == 0), "Line is not empty - is_scoring_line"
        scoring = False
        boxes = self.get_adjacent_boxes(line)
        if boxes[0] >= 0 and self.count_completed_sides(boxes[0]) == 3:
            scoring = True
        if boxes[1] >= 0 and self.count_completed_sides(boxes[1]) == 3:
            scoring = True
        return scoring

    def get_line_cost(self, line):
        assert(self.is_scoring_line(line) == False), "Bad line - get_line_cost"
        moves = []
        # Make the move
        moves.append(self.update_game_board(line))
        box = max(self.get_adjacent_boxes(line))
        # See what opposing player can do
        cost = self.complete_joined_boxes(box, moves)
        # Return the game to its original state
        self.undo_moves(moves)
        return cost
        
    # Reset the specified lines to zero in the lines array
    def undo_moves(self, moves):
        for move in moves:
            index = move[0]
            self.lines[index] = 0
        return

    # Provide a starting box and an empty moves array.
    # The function will complete all boxes in a chain.
    # Each line drawn is added to the moves array.
    # The total number of points earned by the moves is
    # returned. The method returns 0 if the start box
    # does not have three sides.
    def complete_joined_boxes(self, start_box, moves):
        boxes = []
        points = 0
        # Make sure our start box has three sides
        line = self.get_missing_side(start_box)
        if line >= 0:
            moves.append(self.update_game_board(line))
            # A bit inefficient here
            boxes = self.get_adjacent_boxes(line)
        # Figure out the next box in the chain
        for box in boxes:
            if self.is_box_complete(box):
                points += 1
            else:
                points += self.complete_joined_boxes(box, moves)
        
        return points
    

