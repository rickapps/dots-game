# Dots Game Project Log

**2022-05-24 10:43:06**   
Created this keyboard shortcut to insert the date and time. Ctrl+k+t
**2022-05-24 11:15:32**   
Uploaded latest version to gcloud:
1. cd to project folder
2. gcloud auth login
3. gcloud config set project playdots
4. gcloud app deploy
5. gcloud app browse
You will need to refresh browser and possibly wait for new version to upload completely.

**2022-05-24 16:20:28**   
Added logic to create ids for all boxes and lines. The ids will be used by javascript.

**2022-05-24 20:31:45**   
Created javascript event listener function to change color and disable hover on selected lines.

**2022-05-25 17:29:30**   
Added event listener to all lines on gameboard.

**2022-05-29 20:17:18**   
Got lines to change width with game size. Use absolute positioning but still responsive layout

**2022-06-09 15:26:23**   
Task list -
1. Create javascript to post new, verify, and find with appropriate parameters. For verify and find we
do not need an actual form. We could make javascript calls to create post requests.
2. Create python methods to return appropriate data structures in response to javascript post requests

**2022-06-15 11:17:03**   
1. Python does not need to store any information. It will be stateless. Only javascript needs to store
history, lines, and score.  Python will generate initial values for all three, return them to javascript
and javascript will store them. There is no need to store a copy of the gameboard, it can be generated
by python using javascript's stored values.
2. Easiest way for python to communicate values to javascript would
be to have jinja code initialize javascript variable when page loads. Jinja code would also need to clear localStorage values when
the gameboard is initialized.

**2022-06-26 11:10:38**   
1. Javascript needs to be coded differently. Current design makes it difficult to keep business logic separate
from UI logic. I will refactor the code to use events and event listeners. Javascript UI will respond to
events triggered by business logic.
2. Need to restructure storage to serialize claimed squares. This is
needed only so we can continue a game from one session to another.

