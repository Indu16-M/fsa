from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, FoodDonation, FoodClaim, Notification
import random
import string
import datetime

claims_bp = Blueprint('claims', __name__)

@claims_bp.route('/available', methods=['GET'])
@jwt_required()
def get_available_donations():
    """
    Returns available food. 
    Exact coordinates and address are masked for privacy until claimed.
    """
    now = datetime.datetime.utcnow()
    donations = FoodDonation.query.filter(
        FoodDonation.status == 'AVAILABLE',
        FoodDonation.estimated_expiry > now
    ).order_by(FoodDonation.created_at.desc()).all()
    
    masked_donations = []
    for d in donations:
        data = d.to_dict()
        # Privacy masking: Hide exact address, latitude, and longitude
        data['donor_address'] = '' 
        data['latitude'] = 0.0
        data['longitude'] = 0.0
        
        # We can keep the 'city' visible
        masked_donations.append(data)
        
    return jsonify(masked_donations), 200

@claims_bp.route('/<int:donation_id>/claim', methods=['POST'])
@jwt_required()
def claim_donation(donation_id):
    """
    Allows a Receiver or NGO to claim a donation and initiate the pickup flow.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    
    # Normal users (donors/receivers) and NGOs can claim food. Admins usually don't.
    if user.role == 'admin':
        return jsonify({'message': 'Admins cannot claim food.'}), 403
        
    donation = FoodDonation.query.get_or_404(donation_id)
    
    if donation.status != 'AVAILABLE':
        return jsonify({'message': f'Donation is not available. Current status: {donation.status}'}), 400
        
    # Generate verification code
    vcode = f"VRFY-{random.randint(1000, 9999)}"
    
    claim = FoodClaim(
        donation_id=donation.id,
        user_id=user_id,
        status='CLAIMED',
        verification_code=vcode
    )
    
    donation.status = 'CLAIMED'
    
    db.session.add(claim)
    
    # Notify Donor
    notif = Notification(
        user_id=donation.donor_id,
        type='donation_claimed',
        title='Food Claimed!',
        message=f"{user.username} has claimed your donation '{donation.title}' and will be picking it up soon. Verification Code: {vcode}"
    )
    db.session.add(notif)
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Successfully claimed donation!',
            'claim': claim.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to claim donation: {str(e)}'}), 500

@claims_bp.route('/my-claims', methods=['GET'])
@jwt_required()
def get_my_claims():
    """
    Fetch all claims for the logged in Receiver or NGO.
    """
    user_id = int(get_jwt_identity())
    claims = FoodClaim.query.filter_by(user_id=user_id).order_by(FoodClaim.claimed_at.desc()).all()
    
    return jsonify([c.to_dict() for c in claims]), 200

@claims_bp.route('/<int:claim_id>/status', methods=['PATCH'])
@jwt_required()
def update_claim_status(claim_id):
    """
    Update claim status (ON_THE_WAY, ARRIVED, FOOD_COLLECTED).
    Requires verification code to transition to FOOD_COLLECTED.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    
    claim = FoodClaim.query.get_or_404(claim_id)
    donation = claim.donation
    
    if claim.user_id != user_id and donation.donor_id != user_id and user.role != 'admin':
        return jsonify({'message': 'Unauthorized to update this claim.'}), 403
        
    data = request.get_json() or {}
    new_status = data.get('status')
    verify_code = data.get('verification_code')
    
    if new_status not in ['ON_THE_WAY', 'ARRIVED', 'FOOD_COLLECTED', 'COMPLETED', 'CANCELLED']:
        return jsonify({'message': 'Invalid status update'}), 400
        
    if new_status == 'FOOD_COLLECTED' or new_status == 'COMPLETED':
        if not verify_code:
            return jsonify({'message': 'Verification code is required to complete the handover.'}), 400
        
        if verify_code.strip().upper() != claim.verification_code.strip().upper():
            return jsonify({'message': 'Invalid verification code.'}), 400
            
        claim.status = 'COMPLETED'
        donation.status = 'COMPLETED'
        claim.completed_at = datetime.datetime.utcnow()
        
        # Notify Donor
        db.session.add(Notification(
            user_id=donation.donor_id,
            type='donation_completed',
            title='Handover Complete',
            message=f"Donation '{donation.title}' was successfully handed over to {claim.claimant.username}."
        ))
    else:
        claim.status = new_status
        donation.status = new_status
        
        if new_status == 'ARRIVED':
            db.session.add(Notification(
                user_id=donation.donor_id,
                type='claimant_arrived',
                title='Recipient Arrived!',
                message=f"{claim.claimant.username} has arrived to pick up '{donation.title}'. Please provide them with the food."
            ))
            
    try:
        db.session.commit()
        return jsonify({
            'message': f"Claim status updated to {new_status}",
            'claim': claim.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Failed to update claim: {str(e)}"}), 500

@claims_bp.route('/<int:claim_id>', methods=['GET'])
@jwt_required()
def get_claim_detail(claim_id):
    """
    Fetch details for a specific claim.
    Returns the exact donor location if the requester is the claimant.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    
    claim = FoodClaim.query.get_or_404(claim_id)
    
    # Check permissions: only the claimant, donor, or admin can view this
    if claim.user_id != user_id and claim.donation.donor_id != user_id and user.role != 'admin':
        return jsonify({'message': 'Unauthorized to view this claim.'}), 403
        
    return jsonify(claim.to_dict()), 200
