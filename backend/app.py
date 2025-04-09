from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

waterLog = []
@app.route('/api/water', methods=['POST'])
def addWater():
    data = request.get_json()
    waterAmount = data.get('waterValue')

    # Only add to the log if the amount is greater than 0
    if waterAmount > 0:
        waterLog.append(waterAmount) #add new entry into our log
    
    total = sum(waterLog)
    return jsonify({'totalWater': total})


@app.route('/api/reset', methods=['POST'])
def resetWater():
    global waterLog # Declare using the global waterLog
    waterLog = []  # Reset the log to an empty list
    return jsonify({'totalWater': 0})  # Return 0 as the new total

if __name__ == '__main__':
    app.run()