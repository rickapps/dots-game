# Class to represent a dot game board. 
class GameBoard:
    def __init__(self, size, lines):
        self.size = size
        self.lines = lines
        self.num_boxes = size*size
        self.num_lines = 2 * (self.num_boxes + self.size)
        self.num_horizontal = int(self.num_lines / 2)   # We know num_lines is always even
        

    # Indicates if the line is horizontal or vertical
    def is_horizontal(self, line_num):
        return line_num < self.num_horizontal

    # Returns the two boxes that include the line
    # The two boxes will be (box_left, box_right) OR (box_top, box_bottom)
    def get_boxes(self, line_num):
        box1 = -1 # left or top
        box2 = -1 # right or bottom
        if self.is_horizontal(line_num):
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
    def complete_the_square(self, box_num):
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
        boxes = self.get_boxes(new_line)
        new_box1 = -1
        new_box2 = -1
        if boxes[0] >= 0 and self.is_box_complete(boxes[0]):
            new_box1 = boxes[0]
        if boxes[1] >= 0 and self.is_box_complete(boxes[1]):
            new_box2 = boxes[1]
        return (new_line, new_box1, new_box2)

    # Calculate the max number of points that could be
    # obtained by the indicated move. We pass a copy
    # of self.lines to the method.
    def calculate_points(self, new_line, lines):
        boxes = self.get_boxes(new_line)
        lines[new_line] = 1
        if self.is_box_complete(boxes[0]):
            points+=1
        else:
            line = self.complete_the_square 
    

