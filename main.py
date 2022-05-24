from flask import Flask, render_template, request
app = Flask(__name__)

# Initialize our box array. The box array is used to draw the gameboard.
def initGame(size):
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

# Start the game with default values
@app.route("/")
def home():
    size = 3
    boxes = initGame(size)
    return render_template('index.html', size=size, boxes = boxes)

# Start a new game with user values
@app.route("/new/", methods = ['POST', 'GET'])
def newgame():
    if request.method == 'GET':
        return f"The URL /data is accessed directly. Try going to '/form' to submit form"
    if request.method == 'POST':
        size = request.form['glevel']
        boxes = initGame(int(size))
        return render_template('index.html',size=size, boxes = boxes)


if __name__ == "__main__":
    app.run(debug=True)

