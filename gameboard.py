class GameBoard:
    def __init__(self, size, lines):
        self.size = size
        self.lines = lines

    # Indicates if the line is horizontal or vertical
    def IsHorizontal(lineNum):
        return True

    # Returns the two boxes that include the line
    def GetBoxes(lineNum):
        return tuple(1,2)
    
    # Get the top and bottom of the box
    def GetHBoxSides(boxNum):
        return tuple(1,2)

    # Get the right and left sides of the box
    def GetVBoxSides(boxNum):
        return tuple(21,22)

    # Indicates if all four sides of the box is drawn
    def IsBoxComplete(boxNum):
        return True
    

