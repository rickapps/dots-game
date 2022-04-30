from flask import Flask, render_template
app = Flask(__name__)

@app.route("/")
def home():
    size = 3
    boxes = []
    for i in range(size * size):
        boxType = 'Normal';
        if (i+1)%3 == 0:
            boxType = 'Right'
        if i >= size * (size-1):
            if boxType == 'Normal':
                boxType = 'Bottom'
            else:
                boxType = 'Both'
        boxes.append(boxType)

    return render_template('index.html', size=size, boxes = boxes)

if __name__ == "__main__":
    app.run(debug=True)

@app.context_processor
def utility_processor():
    def box_type():
        return 'cat'
    return dict(box_type=box_type)

