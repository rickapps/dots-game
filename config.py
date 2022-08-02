# Latest source available at: https://github.com/rickapps/dots-game
# rick@rickapps.com
# August 1, 2022
#
# Set the default game size. The value is the list index in GAME_LEVELS
DEFAULT_SIZE_INDEX=1 
# Set the default theme. The value is the list index in GAME_THEMES
DEFAULT_THEME_INDEX=0

# Game Levels - A size of 3 means there are 3x3 boxes and 4x4 dots on the gameboard.
GAME_LEVELS =	[
    ('Easy', 3),
    ('Medium', 5),
    ('Difficult', 7),
    ('Expert', 10)
]

# Game Themes - column1 is the name to display. Column2 is the name of the class in the css file.
# Remember that the class name is case sensitive. It must match exactly what is in themes.css file.
GAME_THEMES = [
    ('Spring', 'theme1'),
    ('Summer', 'theme2'),
    ('Fall', 'theme3'),
    ('Winter', 'theme4')
]
