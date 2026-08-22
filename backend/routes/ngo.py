import random
import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, NgoProfile, FoodDonation, FoodClaim, FoodRequest, DonationRequest, Notification, BeneficiaryGroup, FoodDistribution, calculate_haversine_distance

ngo_bp = Blueprint('ngo', __name__)

def check_ngo_auth():
    """Verify logged-in user exists and has the 'ngo' role."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'ngo':
        return None, jsonify({'message': 'Access forbidden: Only authorized NGOs can access this resource.'}), 403
    return user, None, None


# ============================================================================
# 1. NGO DASHBOARD OVERVIEW & STATS
# ============================================================================

@ngo_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_ngo_overview():
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    now = datetime.datetime.utcnow()
    ngo_profile = user.ngo_profile

    # Verification status
    verified_status = 'VERIFIED' if (ngo_profile and ngo_profile.verified) else (
        'REJECTED' if (ngo_profile and ngo_profile.rejection_reason) else 'PENDING'
    )

    # 1. Available donations count
    available_donations = FoodDonation.query.filter(
        FoodDonation.status == 'AVAILABLE',
        (FoodDonation.estimated_expiry.is_(None) | (FoodDonation.estimated_expiry > now))
    ).all()
    available_count = len(available_donations)

    # 2. Active claims for this NGO
    active_claims = FoodClaim.query.filter(
        FoodClaim.user_id == user.id,
        FoodClaim.status.in_(['CLAIMED', 'ON_THE_WAY', 'ARRIVED'])
    ).order_by(FoodClaim.claimed_at.desc()).all()

    # 3. Completed claims / food collected
    completed_claims = FoodClaim.query.filter(
        FoodClaim.user_id == user.id,
        FoodClaim.status.in_(['FOOD_COLLECTED', 'COMPLETED'])
    ).all()

    # 4. Beneficiaries
    beneficiaries = BeneficiaryGroup.query.filter_by(ngo_id=user.id, status='ACTIVE').all()
    active_beneficiaries_count = len(beneficiaries)

    # 5. Food Distributions
    distributions = FoodDistribution.query.filter_by(ngo_id=user.id).all()
    meals_distributed = sum(d.distributed_meals for d in distributions)
    people_served = sum(d.people_served for d in distributions)

    # Calculate food saved in kg
    food_saved_kg = 0.0
    for claim in completed_claims:
        if claim.donation:
            qty = claim.donation.quantity or 0.0
            unit = (claim.donation.quantity_unit or 'kg').lower()
            if 'kg' in unit:
                food_saved_kg += qty
            elif 'portion' in unit or 'meal' in unit or 'packet' in unit:
                food_saved_kg += qty * 0.4
            elif 'gram' in unit or 'g' in unit:
                food_saved_kg += qty / 1000.0
            else:
                food_saved_kg += qty

    # 6. Pending food requests created by NGO
    pending_requests = FoodRequest.query.filter_by(receiver_id=user.id, status='PENDING').all()

    # 7. Urgent Actions calculation
    urgent_actions = []

    # Expiring within 2 hours
    expiring_soon_donations = [
        d for d in available_donations 
        if 0 < (d.estimated_expiry - now).total_seconds() <= 7200
    ]
    if expiring_soon_donations:
        urgent_actions.append({
            'id': 'expiring_soon',
            'type': 'warning',
            'title': f"{len(expiring_soon_donations)} donation{'s' if len(expiring_soon_donations)>1 else ''} expiring soon",
            'description': 'Food donations available nearby need urgent pickup within 2 hours.',
            'action_label': 'VIEW DONATIONS',
            'action_link': '/ngo/find-food?filter=expiring_soon',
            'count': len(expiring_soon_donations)
        })

    # Pickups requiring attention
    if active_claims:
        urgent_actions.append({
            'id': 'active_pickups',
            'type': 'info',
            'title': f"{len(active_claims)} active pickup{'s' if len(active_claims)>1 else ''} in progress",
            'description': f"Claim for '{active_claims[0].donation_title}' is ready for pickup.",
            'action_label': 'VIEW PICKUP',
            'action_link': f"/ngo/pickup/{active_claims[0].id}",
            'count': len(active_claims)
        })

    # Pending Food Requests waiting
    if pending_requests:
        urgent_actions.append({
            'id': 'pending_requests',
            'type': 'alert',
            'title': f"{len(pending_requests)} food request{'s' if len(pending_requests)>1 else ''} waiting for fulfillment",
            'description': 'Check smart matching suggestions for your requirements.',
            'action_label': 'VIEW REQUESTS',
            'action_link': '/ngo/requests',
            'count': len(pending_requests)
        })

    # Recent available food for quick preview
    recent_available = []
    ngo_lat, ngo_lon = user.latitude or 13.0827, user.longitude or 80.2707
    for d in available_donations[:4]:
        d_dict = d.to_dict()
        d_dict['donor_address'] = ''
        d_dict['latitude'] = 0.0
        d_dict['longitude'] = 0.0
        donor_lat = d.donor.latitude if d.donor else 0.0
        donor_lon = d.donor.longitude if d.donor else 0.0
        d_dict['distance_km'] = calculate_haversine_distance(ngo_lat, ngo_lon, donor_lat, donor_lon) if (donor_lat and donor_lon) else 2.5
        recent_available.append(d_dict)

    return jsonify({
        'ngo_name': ngo_profile.organization_name if (ngo_profile and ngo_profile.organization_name) else user.username,
        'verification_badge': verified_status,
        'verification_details': {
            'verified': ngo_profile.verified if ngo_profile else False,
            'rejection_reason': ngo_profile.rejection_reason if ngo_profile else ''
        },
        'stats': {
            'available_donations': available_count,
            'active_claims': len(active_claims),
            'food_collected': len(completed_claims),
            'meals_distributed': meals_distributed,
            'people_served': people_served,
            'food_saved_kg': round(food_saved_kg, 1),
            'pending_requests': len(pending_requests),
            'active_beneficiaries': active_beneficiaries_count
        },
        'urgent_actions': urgent_actions,
        'active_claim': active_claims[0].to_dict() if active_claims else None,
        'recent_donations': recent_available
    }), 200


# ============================================================================
# 2. FIND FOOD & LOCATION PRIVACY
# ============================================================================

@ngo_bp.route('/find-food', methods=['GET'])
@jwt_required()
def get_ngo_available_food():
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    now = datetime.datetime.utcnow()
    donations = FoodDonation.query.filter(
        FoodDonation.status == 'AVAILABLE',
        (FoodDonation.estimated_expiry.is_(None) | (FoodDonation.estimated_expiry > now))
    ).order_by(FoodDonation.created_at.desc()).all()

    ngo_lat, ngo_lon = user.latitude or 13.0827, user.longitude or 80.2707

    masked_donations = []
    for d in donations:
        data = d.to_dict()
        data['donor_address'] = ''
        data['latitude'] = 0.0
        data['longitude'] = 0.0
        
        donor_lat = d.donor.latitude if d.donor else 0.0
        donor_lon = d.donor.longitude if d.donor else 0.0
        data['approx_distance_km'] = calculate_haversine_distance(ngo_lat, ngo_lon, donor_lat, donor_lon) if (donor_lat and donor_lon) else 3.0
        
        qty = d.quantity or 1.0
        unit = (d.quantity_unit or 'kg').lower()
        if 'kg' in unit:
            data['estimated_meals'] = int(qty * 2.5)
        elif 'portion' in unit or 'meal' in unit or 'packet' in unit:
            data['estimated_meals'] = int(qty)
        else:
            data['estimated_meals'] = int(qty)
            
        masked_donations.append(data)

    return jsonify(masked_donations), 200


# ============================================================================
# 3. CLAIM FOR NGO & DOUBLE-CLAIM PREVENTION
# ============================================================================

@ngo_bp.route('/claims/<int:donation_id>/claim', methods=['POST'])
@jwt_required()
def claim_donation_for_ngo(donation_id):
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    donation = FoodDonation.query.get_or_404(donation_id)

    if donation.status != 'AVAILABLE':
        return jsonify({'message': f'This donation has already been claimed or is unavailable (Status: {donation.status}).'}), 400

    now = datetime.datetime.utcnow()
    if donation.estimated_expiry and donation.estimated_expiry <= now:
        donation.status = 'EXPIRED'
        db.session.commit()
        return jsonify({'message': 'This donation has expired and cannot be claimed.'}), 400

    vcode = f"VRFY-{random.randint(1000, 9999)}"

    claim = FoodClaim(
        donation_id=donation.id,
        user_id=user.id,
        status='CLAIMED',
        verification_code=vcode
    )

    donation.status = 'CLAIMED'
    db.session.add(claim)

    notif = Notification(
        user_id=donation.donor_id,
        type='donation_claimed',
        title='Food Claimed by NGO!',
        message=f"NGO '{user.username}' has claimed your donation '{donation.title}'. Handover Verification Code: {vcode}"
    )
    db.session.add(notif)

    try:
        db.session.commit()
        return jsonify({
            'message': 'Food successfully claimed for your NGO!',
            'claim': claim.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to process claim: {str(e)}'}), 500


# ============================================================================
# 4. NGO MY CLAIMS & PICKUP DETAILS
# ============================================================================

@ngo_bp.route('/claims', methods=['GET'])
@jwt_required()
def get_ngo_claims():
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    claims = FoodClaim.query.filter_by(user_id=user.id).order_by(FoodClaim.claimed_at.desc()).all()
    return jsonify([c.to_dict() for c in claims]), 200


@ngo_bp.route('/claims/<int:claim_id>', methods=['GET'])
@jwt_required()
def get_ngo_claim_detail(claim_id):
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    claim = FoodClaim.query.get_or_404(claim_id)
    if claim.user_id != user.id and user.role != 'admin':
        return jsonify({'message': 'Unauthorized to view this claim.'}), 403

    return jsonify(claim.to_dict()), 200


@ngo_bp.route('/claims/<int:claim_id>/status', methods=['PATCH'])
@jwt_required()
def update_ngo_claim_status(claim_id):
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    claim = FoodClaim.query.get_or_404(claim_id)
    if claim.user_id != user.id and user.role != 'admin':
        return jsonify({'message': 'Unauthorized to update this claim.'}), 403

    data = request.get_json() or {}
    new_status = data.get('status')
    verify_code = data.get('verification_code')

    if new_status not in ['ON_THE_WAY', 'ARRIVED', 'FOOD_COLLECTED', 'COMPLETED', 'CANCELLED']:
        return jsonify({'message': 'Invalid status'}), 400

    donation = claim.donation

    if new_status in ['FOOD_COLLECTED', 'COMPLETED']:
        if not verify_code:
            return jsonify({'message': 'Verification code is required to confirm food collection.'}), 400

        if verify_code.strip().upper() != (claim.verification_code or '').strip().upper():
            return jsonify({'message': 'Invalid verification code. Please check with donor.'}), 400

        claim.status = 'FOOD_COLLECTED'
        if donation:
            donation.status = 'FOOD_COLLECTED'
        claim.completed_at = datetime.datetime.utcnow()

        if donation:
            db.session.add(Notification(
                user_id=donation.donor_id,
                type='donation_completed',
                title='Food Successfully Handed Over',
                message=f"Your donation '{donation.title}' was collected by NGO '{user.username}'."
            ))
    elif new_status == 'CANCELLED':
        claim.status = 'CANCELLED'
        if donation:
            donation.status = 'AVAILABLE'
    else:
        claim.status = new_status
        if donation:
            donation.status = new_status

        if new_status == 'ARRIVED' and donation:
            db.session.add(Notification(
                user_id=donation.donor_id,
                type='claimant_arrived',
                title='NGO Member Arrived!',
                message=f"Authorized NGO member from '{user.username}' has arrived for pickup of '{donation.title}'."
            ))

    try:
        db.session.commit()
        return jsonify({
            'message': f'Status updated to {claim.status}',
            'claim': claim.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update status: {str(e)}'}), 500


# ============================================================================
# 5. NGO FOOD REQUIREMENTS & SMART MATCHING
# ============================================================================

@ngo_bp.route('/requests', methods=['GET'])
@jwt_required()
def get_ngo_food_requests():
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    reqs = FoodRequest.query.filter_by(receiver_id=user.id).order_by(FoodRequest.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reqs]), 200


@ngo_bp.route('/requests', methods=['POST'])
@jwt_required()
def create_ngo_food_request():
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    data = request.get_json() or {}
    food_needed = data.get('food_needed')
    if not food_needed:
        return jsonify({'message': 'Food description is required.'}), 400

    req_obj = FoodRequest(
        receiver_id=user.id,
        food_needed=food_needed,
        category=data.get('category', 'Any'),
        number_of_people=int(data.get('number_of_people', 1)),
        meals_required=int(data.get('meals_required', 1)),
        urgency=data.get('urgency', 'Normal'),
        needed_date=data.get('needed_date', datetime.date.today().isoformat()),
        needed_time=data.get('needed_time', '12:00'),
        location=data.get('location', user.address or 'City Center'),
        additional_instructions=data.get('additional_instructions', ''),
        status='PENDING'
    )

    db.session.add(req_obj)
    db.session.commit()

    return jsonify({
        'message': 'Food requirement submitted successfully!',
        'request': req_obj.to_dict()
    }), 201


@ngo_bp.route('/smart-matches', methods=['GET'])
@jwt_required()
def get_smart_food_matches():
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    now = datetime.datetime.utcnow()
    ngo_requests = FoodRequest.query.filter_by(receiver_id=user.id, status='PENDING').all()
    available_donations = FoodDonation.query.filter(
        FoodDonation.status == 'AVAILABLE',
        (FoodDonation.estimated_expiry.is_(None) | (FoodDonation.estimated_expiry > now))
    ).all()

    ngo_lat, ngo_lon = user.latitude or 13.0827, user.longitude or 80.2707
    matches = []

    for req in ngo_requests:
        for donation in available_donations:
            score = 0
            if req.category == 'Any' or req.category.lower() in (donation.food_type or '').lower():
                score += 40

            donor_qty = donation.quantity or 1
            if donor_qty >= req.meals_required * 0.5:
                score += 30

            donor_lat = donation.donor.latitude if donation.donor else 0.0
            donor_lon = donation.donor.longitude if donation.donor else 0.0
            dist = calculate_haversine_distance(ngo_lat, ngo_lon, donor_lat, donor_lon) if (donor_lat and donor_lon) else 3.0
            if dist <= 5.0:
                score += 20
            elif dist <= 10.0:
                score += 10

            if req.urgency in ['High', 'URGENT']:
                score += 10

            if score >= 40:
                d_dict = donation.to_dict()
                d_dict['donor_address'] = ''
                d_dict['latitude'] = 0.0
                d_dict['longitude'] = 0.0
                d_dict['distance_km'] = dist
                matches.append({
                    'match_score': score,
                    'request_id': req.id,
                    'request_food': req.food_needed,
                    'meals_required': req.meals_required,
                    'donation': d_dict
                })

    matches.sort(key=lambda x: x['match_score'], reverse=True)
    return jsonify(matches[:6]), 200


# ============================================================================
# 6. BENEFICIARY MANAGEMENT
# ============================================================================

@ngo_bp.route('/beneficiaries', methods=['GET'])
@jwt_required()
def get_beneficiaries():
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    groups = BeneficiaryGroup.query.filter_by(ngo_id=user.id).order_by(BeneficiaryGroup.created_at.desc()).all()
    return jsonify([g.to_dict() for g in groups]), 200


@ngo_bp.route('/beneficiaries', methods=['POST'])
@jwt_required()
def add_beneficiary():
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'message': 'Beneficiary group name is required.'}), 400

    group = BeneficiaryGroup(
        ngo_id=user.id,
        name=name,
        group_type=data.get('group_type', 'Community'),
        number_of_people=int(data.get('number_of_people', 1)),
        area=data.get('area', ''),
        food_requirements=data.get('food_requirements', 'Any'),
        contact_phone=data.get('contact_phone', ''),
        contact_person=data.get('contact_person', ''),
        status='ACTIVE'
    )
    db.session.add(group)
    db.session.commit()

    return jsonify({
        'message': 'Beneficiary group added successfully!',
        'beneficiary': group.to_dict()
    }), 201


@ngo_bp.route('/beneficiaries/<int:group_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_beneficiary(group_id):
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    group = BeneficiaryGroup.query.get_or_404(group_id)
    if group.ngo_id != user.id:
        return jsonify({'message': 'Unauthorized.'}), 403

    if request.method == 'DELETE':
        db.session.delete(group)
        db.session.commit()
        return jsonify({'message': 'Beneficiary group removed.'}), 200

    data = request.get_json() or {}
    group.name = data.get('name', group.name)
    group.group_type = data.get('group_type', group.group_type)
    group.number_of_people = int(data.get('number_of_people', group.number_of_people))
    group.area = data.get('area', group.area)
    group.food_requirements = data.get('food_requirements', group.food_requirements)
    group.contact_phone = data.get('contact_phone', group.contact_phone)
    group.contact_person = data.get('contact_person', group.contact_person)
    group.status = data.get('status', group.status)

    db.session.commit()
    return jsonify({
        'message': 'Beneficiary group updated.',
        'beneficiary': group.to_dict()
    }), 200


# ============================================================================
# 7. FOOD DISTRIBUTION LOGGING
# ============================================================================

@ngo_bp.route('/distributions', methods=['GET'])
@jwt_required()
def get_distributions():
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    records = FoodDistribution.query.filter_by(ngo_id=user.id).order_by(FoodDistribution.created_at.desc()).all()
    return jsonify([r.to_dict() for r in records]), 200


@ngo_bp.route('/distributions', methods=['POST'])
@jwt_required()
def record_distribution():
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    data = request.get_json() or {}
    food_name = data.get('food_name')
    if not food_name:
        return jsonify({'message': 'Food name is required.'}), 400

    claim_id = data.get('claim_id')
    distributed_meals = int(data.get('distributed_meals', 0))
    people_served = int(data.get('people_served', distributed_meals))
    collected_quantity = float(data.get('collected_quantity', distributed_meals))
    remaining_meals = max(0, int(collected_quantity) - distributed_meals)

    dist_date = datetime.date.today()
    if data.get('distribution_date'):
        try:
            dist_date = datetime.datetime.strptime(data.get('distribution_date'), '%Y-%m-%d').date()
        except:
            pass

    beneficiary_id = data.get('beneficiary_group_id')
    beneficiary_name = data.get('beneficiary_name', '')
    if beneficiary_id:
        bg = BeneficiaryGroup.query.get(beneficiary_id)
        if bg:
            beneficiary_name = bg.name
            bg.last_support_date = datetime.datetime.utcnow()

    dist = FoodDistribution(
        ngo_id=user.id,
        claim_id=claim_id,
        food_name=food_name,
        collected_quantity=collected_quantity,
        quantity_unit=data.get('quantity_unit', 'meals'),
        distributed_meals=distributed_meals,
        people_served=people_served,
        remaining_meals=remaining_meals,
        beneficiary_group_id=beneficiary_id,
        beneficiary_name=beneficiary_name,
        distribution_date=dist_date,
        status='DISTRIBUTED',
        notes=data.get('notes', '')
    )
    db.session.add(dist)

    if claim_id:
        claim = FoodClaim.query.get(claim_id)
        if claim and claim.user_id == user.id:
            claim.status = 'COMPLETED'
            if claim.donation:
                claim.donation.status = 'COMPLETED'

    db.session.commit()
    return jsonify({
        'message': 'Food distribution recorded successfully!',
        'distribution': dist.to_dict()
    }), 201


# ============================================================================
# 8. IMPACT & ANALYTICS
# ============================================================================

@ngo_bp.route('/impact', methods=['GET'])
@jwt_required()
def get_ngo_impact():
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    distributions = FoodDistribution.query.filter_by(ngo_id=user.id).all()
    completed_claims = FoodClaim.query.filter(
        FoodClaim.user_id == user.id,
        FoodClaim.status.in_(['FOOD_COLLECTED', 'COMPLETED'])
    ).all()

    total_meals_distributed = sum(d.distributed_meals for d in distributions)
    total_people_served = sum(d.people_served for d in distributions)

    food_saved_kg = 0.0
    for claim in completed_claims:
        if claim.donation:
            qty = claim.donation.quantity or 0.0
            unit = (claim.donation.quantity_unit or 'kg').lower()
            if 'kg' in unit:
                food_saved_kg += qty
            elif 'portion' in unit or 'meal' in unit or 'packet' in unit:
                food_saved_kg += qty * 0.4
            else:
                food_saved_kg += qty

    active_beneficiaries = BeneficiaryGroup.query.filter_by(ngo_id=user.id, status='ACTIVE').count()

    activity_by_month = {}
    for d in distributions:
        month_key = d.distribution_date.strftime('%b %Y') if d.distribution_date else 'Recent'
        if month_key not in activity_by_month:
            activity_by_month[month_key] = {'meals': 0, 'people': 0}
        activity_by_month[month_key]['meals'] += d.distributed_meals
        activity_by_month[month_key]['people'] += d.people_served

    monthly_data = [{'month': k, 'meals': v['meals'], 'people': v['people']} for k, v in activity_by_month.items()]

    return jsonify({
        'summary': {
            'total_donations_collected': len(completed_claims),
            'total_meals_distributed': total_meals_distributed,
            'total_people_served': total_people_served,
            'food_saved_kg': round(food_saved_kg, 1),
            'successful_pickups': len(completed_claims),
            'active_beneficiaries': active_beneficiaries
        },
        'monthly_activity': monthly_data
    }), 200


# ============================================================================
# 9. NGO PROFILE & SETTINGS
# ============================================================================

@ngo_bp.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def manage_ngo_profile():
    user, err_resp, err_code = check_ngo_auth()
    if err_resp:
        return err_resp, err_code

    profile = user.ngo_profile
    if not profile:
        profile = NgoProfile(user_id=user.id, organization_name=user.username, registration_number='PENDING')
        db.session.add(profile)
        db.session.commit()

    if request.method == 'PUT':
        data = request.get_json() or {}
        profile.organization_name = data.get('organization_name', profile.organization_name)
        profile.description = data.get('description', profile.description)
        profile.contact_person = data.get('contact_person', profile.contact_person)
        profile.official_email = data.get('official_email', profile.official_email)
        profile.phone = data.get('phone', profile.phone)
        profile.address = data.get('address', profile.address)
        profile.city = data.get('city', profile.city)
        profile.state = data.get('state', profile.state)
        profile.pincode = data.get('pincode', profile.pincode)
        profile.website = data.get('website', profile.website)
        profile.ngo_type = data.get('ngo_type', profile.ngo_type)
        profile.capacity_people = int(data.get('capacity_people', profile.capacity_people or 0))
        profile.preferred_food_types = data.get('preferred_food_types', profile.preferred_food_types)
        
        user.address = profile.address
        user.phone = profile.phone
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully!', 'profile': profile.to_dict()}), 200

    return jsonify({
        'user': user.to_dict(),
        'profile': profile.to_dict(),
        'verification_status': 'VERIFIED' if profile.verified else ('REJECTED' if profile.rejection_reason else 'PENDING')
    }), 200

