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