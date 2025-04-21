from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import requests
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
load_dotenv()  # Load environment variables from .env
    
API_KEY = os.environ.get("KEY")

# Initialize the OpenAI client with the API key
client = OpenAI(api_key=API_KEY)

# Global list to store water entries
waterLog = []
# Global variable to store recommended intake
recommendedIntake = None
# Global product cache with trie structure
productCache = {}

# Trie node structure
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False
        self.product_data = None

# Trie data structure for efficient product search
class Trie:
    def __init__(self):
        self.root = TrieNode()
    
    def insert(self, word, product_data):
        node = self.root
        word = word.lower()
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True
        node.product_data = product_data
    
    def search(self, prefix):
        results = []
        node = self.root
        prefix = prefix.lower()
        
        # Navigate to the node representing the prefix
        for char in prefix:
            if char not in node.children:
                return results
            node = node.children[char]
        
        # Collect all words with the given prefix
        self._collect_words(node, prefix, results)
        return results
    
    def _collect_words(self, node, prefix, results):
        if node.is_end_of_word:
            results.append(node.product_data)
        
        for char, child_node in node.children.items():
            self._collect_words(child_node, prefix + char, results)

# Initialize the trie
product_trie = Trie()

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

@app.route('/api/search/products', methods=['GET'])
def search_products():
    query = request.args.get('q', '')
    if not query or len(query) < 2:
        return jsonify({'results': []})
    
    # Search the trie for products matching the query
    results = product_trie.search(query)
    
    # If no results in trie, search the API
    if not results:
        results = search_food_api(query)
        
        # Add results to trie for future searches
        for product in results:
            product_name = product.get('product_name', '')
            if product_name:
                product_trie.insert(product_name, product)
    
    return jsonify({'results': results[:10]})  # Limit to top 10 results

def search_food_api(query):
    url = "https://world.openfoodfacts.org/cgi/search.pl"
    params = {
        'search_terms': query,
        'search_simple': 1,
        'action': 'process',
        'json': 1,
        'page_size': 10
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        if 'products' in data:
            return data['products']
    except Exception as e:
        print(f"Error searching food API: {e}")
    
    return []

@app.route('/api/product', methods=['POST'])
def addFromProduct():
    global waterLog
    data = request.get_json()
    product_name = data.get('productName')
    product_id = data.get('productId')
    
    if not product_name and not product_id:
        return jsonify({'error': 'No product name or ID provided'}), 400

    product = None
    
    # If product_id is provided, try to look up directly
    if product_id:
        url = f"https://world.openfoodfacts.org/api/v0/product/{product_id}.json"
        try:
            response = requests.get(url)
            data = response.json()
            if data.get('status') == 1:
                product = data.get('product')
        except Exception as e:
            print(f"Error fetching product by ID: {e}")
    
    # If no product found by ID or no ID provided, search by name
    if not product:
        # First check the trie
        results = product_trie.search(product_name)
        if results:
            product = results[0]  # Use the first match
        else:
            # Query Open Food Facts
            url = "https://world.openfoodfacts.org/cgi/search.pl"
            params = {
                'search_terms': product_name,
                'search_simple': 1,
                'action': 'process',
                'json': 1
            }
            try:
                response = requests.get(url, params=params)
                jsonData = response.json()
                if 'products' in jsonData and jsonData['products']:
                    product = jsonData['products'][0]
                    # Add to trie for future searches
                    product_trie.insert(product.get('product_name', ''), product)
            except Exception as e:
                return jsonify({'error': f'API error: {str(e)}'}), 500

    if not product:
        return jsonify({'error': 'No product found'}), 404

    # Check if product is a water-related drink
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