from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)
CORS(app)

API_KEY = "REPLACE"

# Initialize the OpenAI client with the API key
client = OpenAI(api_key=API_KEY)

# Global list to store water entries
waterLog = []
# Global variable to store recommended intake
recommendedIntake = None

@app.route('/api/water', methods=['POST'])
def addWater():
    global recommendedIntake
    data = request.get_json()
    waterAmount = data.get('waterValue')
    
    # Check if recommendedIntake is being set/updated from the frontend
    if data.get('recommendedIntake') is not None:
        recommendedIntake = data.get('recommendedIntake')

    if waterAmount > 0:
        waterLog.append(waterAmount)
    
    total = sum(waterLog)

    # cap the total at recommended intake if set
    if recommendedIntake is not None and total > recommendedIntake:
        total = recommendedIntake

    return jsonify({'totalWater': total, 'recommendedIntake': recommendedIntake})

@app.route('/api/reset', methods=['POST'])
def resetWater():
    global waterLog
    waterLog = []
    return jsonify({'totalWater': 0, 'recommendedIntake': recommendedIntake})

@app.route('/api/recommend', methods=['POST'])
def recommendWater():
    data = request.get_json()
    height = data.get('height')
    weight = data.get('weight')
    age = data.get('age')
    gender = data.get('gender')
    
    prompt = (
        f"Based on the following details, provide the recommended daily water intake in milliLiters"
        f"for a person. The details are: Height: {height} ft, "
        f"Weight: {weight} lb, Age: {age} years, Gender: {gender}. "
        f"Reply with only a single number in milliLiters (e.g., '3700')."
    )
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=50,
        temperature=0
    )
    
    recommendedIntake = response.choices[0].message.content.strip()
    return jsonify({"recommendedWater": recommendedIntake})

if __name__ == '__main__':
    app.run()