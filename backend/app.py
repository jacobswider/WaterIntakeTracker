from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import requests

app = Flask(__name__)
CORS(app)

API_KEY = "REPLACE"  # Replace with your actual API key

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
    global recommendedIntake
    data = request.get_json()
    height = data.get('height')
    weight = data.get('weight')
    age = data.get('age')
    gender = data.get('gender')
    
    prompt = (
        f"Based on the following details, provide the recommended daily water intake in milliLiters "
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
    
    recommendedIntake = float(response.choices[0].message.content.strip())
    return jsonify({"recommendedWater": recommendedIntake})

@app.route('/api/product', methods=['POST'])
def addFromProduct():
    global waterLog
    data = request.get_json()
    product_name = data.get('productName')
    
    if not product_name:
        return jsonify({'error': 'No product name provided'}), 400

    # Query Open Food Facts
    url = f"https://world.openfoodfacts.org/cgi/search.pl"
    params = {
        'search_terms': product_name,
        'search_simple': 1,
        'action': 'process',
        'json': 1
    }
    response = requests.get(url, params=params)
    jsonData = response.json()

    if 'products' not in jsonData or not jsonData['products']:
        return jsonify({'error': 'No product found'}), 404

    # Check if product is a water-related drink
    product = jsonData['products'][0]
    product_name = product.get('product_name', '').lower()
    categories = product.get('categories', '').lower()

    if 'water' in categories or 'water' in product_name or 'bottle' in product_name:
        quantity_str = product.get('quantity', '').lower()
        actual_amount = 0
        if 'ml' in quantity_str:
            actual_amount = int(''.join(filter(str.isdigit, quantity_str)))
        elif 'l' in quantity_str:
            try:
                num = float(''.join(filter(lambda c: c.isdigit() or c == '.', quantity_str)))
                actual_amount = int(num * 1000)
            except ValueError:
                actual_amount = 0
        if actual_amount <= 0:
            actual_amount = 250  # Default amount if we can't determine the size
        waterLog.append(actual_amount)
        return jsonify({'added': actual_amount, 'totalWater': sum(waterLog)})
    else:
        return jsonify({'error': 'Product is not water'}), 400

if __name__ == '__main__':
    app.run(debug=True)