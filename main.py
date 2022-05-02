from flask import Flask, render_template, request
app = Flask(__name__)

def initGame(size):
    boxes = []
    
    for i in range(size * size):
        boxType = 'Normal'
        if (i+1)%size == 0:
            boxType = 'Right'
        if i >= size * (size-1):
            if boxType == 'Normal':
                boxType = 'Bottom'
            else:
                boxType = 'Both'
        boxes.append(boxType)

    return boxes

@app.route("/")
def home():
    size = 3
    boxes = initGame(size)
    return render_template('index.html', size=size, boxes = boxes)

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

@app.context_processor
def utility_processor():
    def box_type():
        return 'cat'
    return dict(box_type=box_type)

