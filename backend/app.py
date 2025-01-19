from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os

app = Flask(__name__)

# Apply CORS with explicit configuration
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Allow requests from your frontend

# Load models and dictionaries
def load_pickle(filepath):
    try:
        with open(filepath, 'rb') as file:
            return pickle.load(file)
    except Exception as e:
        print(f"Error loading {filepath}: {str(e)}")
        return None
@app.route('/home', methods=['GET'])
def home():
    return "Hello, Flask!"

# Test route to verify API is working
@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "API is working!"})

# Crop recommendation models
crop_models = {
    'knn': load_pickle('../models/crop_recommendation/knn_pipeline.pkl'),
    'rf': load_pickle('../models/crop_recommendation/rf_pipeline.pkl'),
    'xgb': load_pickle('../models/crop_recommendation/xgb_pipeline.pkl')
}
label_dictionary = load_pickle('../models/crop_recommendation/label_dictionary.pkl')

# Fertilizer recommendation models
fertilizer_models = {
    'rf': load_pickle('../models/fertilizer_recommendation/rf_pipeline.pkl'),
    'svm': load_pickle('../models/fertilizer_recommendation/svm_pipeline.pkl'),
    'xgb': load_pickle('../models/fertilizer_recommendation/xgb_pipeline.pkl')
}
croptype_dict = load_pickle('../models/fertilizer_recommendation/croptype_dict.pkl')
soiltype_dict = load_pickle('../models/fertilizer_recommendation/soiltype_dict.pkl')
fertname_dict = load_pickle('../models/fertilizer_recommendation/fertname_dict.pkl')

@app.route('/predict/crop', methods=['POST'])
def predict_crop():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        print("Received data:", data)  # Debug print
        
        model_name = data.get('model', 'rf')  # default to random forest
        features = data.get('features')
        
        if not features:
            return jsonify({'error': 'No features provided'}), 400
        
        model = crop_models.get(model_name)
        if not model:
            return jsonify({'error': 'Invalid model name'}), 400
        
        prediction = model.predict([features])[0]
        crop_name = label_dictionary[prediction]
        
        return jsonify({'prediction': crop_name})
        
    except Exception as e:
        print(f"Error in predict_crop: {str(e)}")  # Debug print
        return jsonify({"error": str(e)}), 500

@app.route('/predict/fertilizer', methods=['POST'])
def predict_fertilizer():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        print("Received data:", data)  # Debug print
        
        model_name = data.get('model', 'rf')  # default to random forest
        features = data.get('features')
        
        if not features:
            return jsonify({'error': 'No features provided'}), 400
        
        model = fertilizer_models.get(model_name)
        if not model:
            return jsonify({'error': 'Invalid model name'}), 400
        
        prediction = model.predict([features])[0]
        fertilizer_name = fertname_dict[prediction]
        
        return jsonify({'prediction': fertilizer_name})
        
    except Exception as e:
        print(f"Error in predict_fertilizer: {str(e)}")  # Debug print
        return jsonify({"error": str(e)}), 500

# CORS headers after each request to ensure cross-origin support
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'  # Allows any origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5001)
