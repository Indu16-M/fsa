import datetime
import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import joblib
import pandas as pd
from models import FoodDonation, User
from services.matching_service import recommend_ngos
from routes.donations import predict_remaining_shelf_life
from config import Config

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/predict-expiry', methods=['POST'])
def manual_predict():
    data = request.get_json() or {}
    
    food_type = data.get('food_type')
    storage_condition = data.get('storage_condition')
    temperature = float(data.get('temperature_celsius', 25.0))
    prep_time_str = data.get('prep_time')
    
    if not food_type or not storage_condition or not prep_time_str:
        return jsonify({'message': 'Missing food_type, storage_condition, or prep_time'}), 400
        
    try:
        prep_time = datetime.datetime.fromisoformat(prep_time_str.replace('Z', ''))
    except Exception:
        return jsonify({'message': 'Invalid prep_time date format (must be ISO format)'}), 400
        
    now = datetime.datetime.utcnow()
    hours_since_prep = (now - prep_time).total_seconds() / 3600.0
    hours_since_prep = max(0.1, hours_since_prep)
    
    remaining = predict_remaining_shelf_life(food_type, storage_condition, temperature, hours_since_prep)
    estimated_expiry = now + datetime.timedelta(hours=remaining)
    
    # Risk Level
    if remaining <= 6.0:
        risk_level = 'High Risk'
    elif remaining <= 24.0:
        risk_level = 'Medium Risk'
    else:
        risk_level = 'Safe'
        
    return jsonify({
        'hours_since_prep': round(hours_since_prep, 2),
        'predicted_remaining_shelf_life_hours': round(remaining, 2),
        'estimated_expiry': estimated_expiry.isoformat(),
        'risk_level': risk_level
    }), 200

@ai_bp.route('/forecast', methods=['GET'])
@jwt_required()
def forecast_waste():
    # Predict/forecast waste index based on seasonal and preparing patterns
    try:
        if os.path.exists(Config.FORECAST_MODEL_PATH):
            model = joblib.load(Config.FORECAST_MODEL_PATH)
            
            # Form standard inputs representing month-wise typical buffet/prep sizes
            months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            results = []
            for m in months:
                # Mock average weekday preps
                input_df = pd.DataFrame([{
                    'month': m,
                    'day_of_week': 2, # Wednesday
                    'food_type': 'cooked',
                    'preparation_quantity': 150.0
                }])
                pred = model.predict(input_df)[0]
                results.append({
                    'month': m,
                    'predicted_waste_kg': round(float(pred), 2)
                })
            return jsonify(results), 200
    except Exception as e:
        print(f"Error forecasting waste: {e}")
        
    # Return realistic fallback data
    fallback_forecast = [
        {'month': 1, 'predicted_waste_kg': 12.5},
        {'month': 2, 'predicted_waste_kg': 13.2},
        {'month': 3, 'predicted_waste_kg': 14.8},
        {'month': 4, 'predicted_waste_kg': 16.5},
        {'month': 5, 'predicted_waste_kg': 22.1}, # Summer rise
        {'month': 6, 'predicted_waste_kg': 24.5},
        {'month': 7, 'predicted_waste_kg': 23.0},
        {'month': 8, 'predicted_waste_kg': 20.2},
        {'month': 9, 'predicted_waste_kg': 17.8},
        {'month': 10, 'predicted_waste_kg': 15.3},
        {'month': 11, 'predicted_waste_kg': 13.9},
        {'month': 12, 'predicted_waste_kg': 16.2}  # Holiday rise
    ]
    return jsonify(fallback_forecast), 200

@ai_bp.route('/recommend-ngos/<int:donation_id>', methods=['GET'])
@jwt_required()
def recommend_ngos_for_donation(donation_id):
    donation = FoodDonation.query.get_or_404(donation_id)
    ngos = User.query.filter_by(role='ngo').all()
    recommendations = recommend_ngos(donation, ngos)
    return jsonify(recommendations), 200

@ai_bp.route('/food-check', methods=['POST'])
@jwt_required()
def food_check():
    # Simulate an AI visual check of an uploaded food image
    import time
    import random
    
    # In a real scenario, we would parse request.files['image'] and run a CV model.
    # Here, we simulate the processing time and outcome based on the category.
    food_category = request.form.get('category', 'unknown').lower()
    
    # Mock delay to simulate "AI Processing"
    time.sleep(1.5)
    
    confidence = random.randint(85, 98)
    
    if food_category in ['produce', 'vegetables', 'fruits']:
        status = "Appears fresh and suitable for sharing"
        freshness = "Good"
        recommendation = "Share within 48 hours."
    elif food_category in ['cooked', 'cooked meals', 'rice', 'curries']:
        status = "Appears suitable, ensure temperature control"
        freshness = "Fair"
        recommendation = "Share as soon as possible (within 3-4 hours)."
    elif food_category in ['packaged', 'packaged food', 'snacks']:
        status = "Package appears intact"
        freshness = "Excellent"
        recommendation = "Check printed expiry date before sharing."
        confidence = random.randint(95, 99)
    else:
        status = "Appears suitable for sharing"
        freshness = "Good"
        recommendation = "Share promptly."
        
    # Introduce a rare chance of a warning for realism
    if random.random() < 0.05:
        status = "Potential spoilage detected"
        freshness = "Poor"
        recommendation = "WARNING: Food may be unsafe for consumption. Please physically inspect before donating."
        confidence = random.randint(70, 85)
        
    return jsonify({
        'status': status,
        'freshness': freshness,
        'confidence': f"{confidence}%",
        'recommendation': recommendation
    }), 200

@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def ai_chat():
    """
    Simulated AI Chatbot for food storage and donation advice.
    Now context-aware (ShareWise AI).
    """
    import time
    
    data = request.get_json() or {}
    message = data.get('message', '').lower()
    context = data.get('context', {})
    pathname = context.get('pathname', '')
    
    # Simulate processing time
    time.sleep(1.0)
    
    response_text = "I'm ShareWise AI. I can help you with food safety, storage guidelines, and best practices for donating surplus food. How can I help?"
    
    # Context-aware responses
    if 'how does pickup work' in message or 'delivery' in message:
        response_text = "There are no delivery drivers in ShareBite! The Individual Receiver or NGO who claims your food travels directly to your location to pick it up."
    elif 'where is my food' in message or 'track' in message:
        response_text = "Check your Active Pickups! Once a Receiver or NGO claims your food, they will mark when they are 'On the Way' and 'Arrived'."
    elif 'how do i donate food' in message:
        response_text = "Donating is easy! Go to your Donor Dashboard, click 'Donate Food', fill in the details, and submit. Your exact location remains hidden until a verified Receiver or NGO claims the food. Then they will travel to you!"
    elif 'who can claim' in message or 'who gets the food' in message:
        response_text = "Both verified NGOs and Individual Receivers can browse available surplus food and claim it. They must travel to your location to collect it."
        
    # Standard food storage responses
    elif any(word in message for word in ['rice', 'cooked rice']):
        response_text = "Cooked rice should be cooled quickly and refrigerated within 1 hour of cooking. It can be safely stored in the fridge for up to 3-4 days at below 5°C. When donating, please ensure it hasn't been sitting at room temperature!"
    elif any(word in message for word in ['curry', 'stew', 'gravy']):
        response_text = "Curries and stews are great for donation! They can be stored in the fridge for up to 3-4 days. For maximum freshness, store them in shallow airtight containers so they cool rapidly."
    elif any(word in message for word in ['vegetable', 'veg', 'produce', 'fruit']):
        response_text = "Fresh produce is always welcome. Keep leafy greens in the crisper drawer with high humidity, and store apples separately as they release ethylene gas which can ripen other fruits faster."
    elif any(word in message for word in ['milk', 'dairy', 'cheese', 'paneer']):
        response_text = "Dairy products are highly perishable. Store them at the back of the fridge (the coldest part), not in the door. If donating, please ensure the cold chain is maintained!"
    elif any(word in message for word in ['bread', 'bakery', 'chapati', 'roti']):
        response_text = "Bread and rotis should be stored at room temperature in a cool, dry place. Avoid the fridge as it makes them stale faster. If you need to store them longer, freezing is the best option."
    elif any(word in message for word in ['how long', 'store', 'expiry']):
        response_text = "As a general rule for cooked food: store in the fridge below 5°C for no more than 3-4 days, or freeze for up to 2-3 months. Never leave cooked food at room temperature for more than 2 hours."
    elif any(word in message for word in ['hello', 'hi', 'hey']):
        response_text = "Hello! I'm ShareWise AI 👋 I can answer questions about food storage, shelf-life, and donation guidelines. What do you have to share today?"
    elif 'thank' in message:
        response_text = "You're very welcome! Thank you for using ShareByte to help others. Let me know if you need any more tips!"
        
    return jsonify({
        'reply': response_text
    }), 200

