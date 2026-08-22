from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, FoodRequest, User
import datetime

requests_bp = Blueprint('requests', __name__)

@requests_bp.route('/', methods=['POST'])
@jwt_required()
def create_request():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.role not in ['receiver', 'donor', 'user']:
        return jsonify({'message': 'Only authorized users can request food.'}), 403

    data = request.get_json()
    
    if not data.get('food_needed') or not data.get('location'):
        return jsonify({'message': 'Food Needed and Location are required.'}), 400

    new_request = FoodRequest(
        receiver_id=user_id,
        food_needed=data.get('food_needed'),
        category=data.get('category', 'Any'),
        number_of_people=data.get('number_of_people', 1),
        meals_required=data.get('meals_required', 1),
        urgency=data.get('urgency', 'Normal'),
        needed_date=data.get('needed_date', ''),
        needed_time=data.get('needed_time', ''),
        location=data.get('location'),
        additional_instructions=data.get('additional_instructions', ''),
        status='PENDING'
    )
    
    db.session.add(new_request)
    db.session.commit()
    
    return jsonify({
        'message': 'Food request submitted successfully.',
        'request': new_request.to_dict()
    }), 201

@requests_bp.route('/', methods=['GET'])
@jwt_required()
def get_my_requests():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'Unauthorized'}), 401
        
    requests = FoodRequest.query.filter_by(receiver_id=user_id).order_by(FoodRequest.created_at.desc()).all()
    
    return jsonify([req.to_dict() for req in requests]), 200
