#!/usr/bin/env python3
from enum import Enum, unique
from xmlrpc.client import FastMarshaller

@unique
class BoxPosition(Enum):
    Normal = 1
    RightEdge = 2
    BottomEdge = 3
    BottomRight = 4

@unique
class BoxClaim(Enum):
    Unclaimed = 0
    Player1 = 1
    Player2 = 2


class DotSquare:
    def __init__(self, type):
        self.boxType = type
        self.claim = BoxClaim.Unclaimed

class GameBoard:
            
    def __init__(self, size):
        self.size = size
        self.squares = []
        self.score1 = 0
        self.score2 = 0
        GameBoard.resetBoard(size)

    def resetBoard(size):
        GameBoard.squares.clear()
        for x in range(size*size):
            rightEdge = True if (x + 1) % size == 0 else False
            bottomEdge = True if x >= size * (size-1) else False 
            if rightEdge and bottomEdge:
                squareType = BoxPosition.BottomRight
            elif rightEdge:
                squareType = BoxPosition.RightEdge
            elif bottomEdge:
                squareType = BoxPosition.BottomEdge
            else:
                squareType = BoxPosition.Normal
            GameBoard.squares.append(DotSquare(squareType))
        GameBoard.score1 = 0
        GameBoard.score2 = 0


               

