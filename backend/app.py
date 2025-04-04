from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

waterLog = []
@app.route('/api/water', methods=['POST'])
def addWater():

    data = request.get_json()

    waterAmount = data.get('waterValue')

    waterLog.append(waterAmount) #add new entry into our log

    return '' #Should work on getting more informational codes

if __name__ == '__main__':
    app.run()