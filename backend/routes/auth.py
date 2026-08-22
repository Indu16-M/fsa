import datetime
import json
import secrets
import os
import urllib.request
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from config import Config
from models import db, User, NgoProfile, DonorProfile, ReceiverProfile, OTPCode
from services.email_service import generate_otp, send_otp_email

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    purpose = data.get('purpose', 'registration')
    
    if not email or '@' not in email or '.' not in email:
        return jsonify({'message': 'Please enter a valid email address (e.g. user@domain.com).'}), 400

    # If purpose is registration, check if user already exists
    if purpose == 'registration':
        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'An account with this email address already exists. Please log in.'}), 400

    # Check for recent OTP requests to enforce resend cooldown
    cooldown_seconds = getattr(Config, 'OTP_RESEND_COOLDOWN_SECONDS', 60)
    recent_otp = OTPCode.query.filter_by(email=email, purpose=purpose).order_by(OTPCode.created_at.desc()).first()
    
    if recent_otp and (datetime.datetime.utcnow() - recent_otp.created_at).total_seconds() < cooldown_seconds:
        remaining = int(cooldown_seconds - (datetime.datetime.utcnow() - recent_otp.created_at).total_seconds())
        return jsonify({'message': f'Please wait {remaining} seconds before requesting a new verification code.'}), 429

    # Generate new 6-digit OTP
    otp_code = generate_otp()
    expiry_minutes = getattr(Config, 'OTP_EXPIRY_MINUTES', 5)
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=expiry_minutes)

    # Save OTP record with secure hash
    new_otp = OTPCode(
        email=email,
        purpose=purpose,
        attempts=0,
        is_verified=False,
        expires_at=expires_at
    )
    new_otp.set_otp(otp_code)
    
    try:
        db.session.add(new_otp)
        db.session.commit()

        # Send real email via SMTP
        success, err = send_otp_email(email, otp_code, purpose=purpose.capitalize())
        
        if not success and not err.startswith("Dev mode"):
            return jsonify({'message': f'Failed to send verification email: {err}'}), 500

        res_msg = f'OTP sent to {email}. Please check your inbox.'
        if err and err.startswith("Dev mode"):
            res_msg += ' (Development Mode: Check server terminal for OTP)'

        resp_data = {
            'message': res_msg,
            'email': email,
            'expires_in_minutes': expiry_minutes,
            'resend_cooldown_seconds': 60
        }
        if getattr(Config, 'DEBUG', True) or not getattr(Config, 'SMTP_USER', None) or getattr(Config, 'SMTP_USER', '') == 'your-email@gmail.com' or 'example.com' in email or 'feedhungry.org' in email:
            resp_data['dev_otp'] = otp_code

        return jsonify(resp_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error generating OTP: {str(e)}'}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    otp_input = data.get('otp_code', '').strip()
    purpose = data.get('purpose', 'registration')

    if not email or not otp_input:
        return jsonify({'message': 'Email and 6-digit verification code are required.'}), 400

    otp_record = OTPCode.query.filter_by(email=email, purpose=purpose).order_by(OTPCode.created_at.desc()).first()

    if not otp_record:
        return jsonify({'message': 'No verification code found. Please click Send OTP.'}), 400

    # Check expiration (5 minutes)
    if datetime.datetime.utcnow() > otp_record.expires_at:
        return jsonify({'message': 'Verification code has expired. Please request a new code.'}), 400

    max_attempts = getattr(Config, 'OTP_MAX_ATTEMPTS', 3)
    if otp_record.attempts >= max_attempts:
        return jsonify({'message': 'Maximum verification attempts exceeded. Please request a new code.'}), 400

    # Increment attempt count
    otp_record.attempts += 1

    if not otp_record.check_otp(otp_input):
        db.session.commit()
        remaining = max_attempts - otp_record.attempts
        if remaining > 0:
            return jsonify({'message': f'Invalid verification code. {remaining} attempt(s) remaining.'}), 400
        else:
            return jsonify({'message': 'Maximum verification attempts exceeded. Please request a new code.'}), 400

    # Mark OTP as verified
    otp_record.is_verified = True
    try:
        db.session.commit()
        return jsonify({'message': 'Email verified successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error verifying OTP: {str(e)}'}), 500


@auth_bp.route('/register-ngo', methods=['POST'])
def register_ngo():
    data = request.get_json() or {}
    
    ngo_name = data.get('ngoName', '').strip()
    reg_number = data.get('registrationNumber', '').strip()
    ngo_type = data.get('ngoType', 'NGO').strip()
    description = data.get('description', '').strip()
    established_year = data.get('establishedYear', '').strip()
    
    contact_person = data.get('contactPerson', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip().lower()
    address = data.get('address', '').strip()
    city = data.get('city', '').strip()
    state = data.get('state', '').strip()
    pincode = data.get('pincode', '').strip()
    
    documents = data.get('documents', {})
    password = data.get('password', '').strip()

    if not email or not ngo_name or not reg_number:
        return jsonify({'message': 'NGO Name, Registration Number, and Email are required.'}), 400

    if not password or len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters.'}), 400

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'An account with this email address already exists.'}), 400

    # Create NGO user with status='pending_approval'
    user = User(
        username=email,
        email=email,
        role='ngo',
        phone=phone,
        address=f"{address}, {city}, {state} - {pincode}",
        status='pending_approval',
        is_email_verified=True
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()

        ngo_profile = NgoProfile(
            user_id=user.id,
            organization_name=ngo_name,
            registration_number=reg_number,
            ngo_type=ngo_type,
            description=description,
            established_year=established_year,
            contact_person=contact_person,
            official_email=email,
            phone=phone,
            address=address,
            city=city,
            state=state,
            pincode=pincode,
            documents=json.dumps(documents) if isinstance(documents, dict) else str(documents),
            verified=False
        )
        db.session.add(ngo_profile)
        db.session.commit()

        return jsonify({
            'message': 'Your NGO registration has been submitted successfully. Your account is waiting for Admin approval.',
            'status': 'pending_approval',
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to register NGO: {str(e)}'}), 500


@auth_bp.route('/register-donor', methods=['POST'])
def register_donor():
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    donor_type = data.get('donorType', 'Restaurant').strip()
    org_name = data.get('organizationName', name).strip()
    address = data.get('address', '').strip()
    city = data.get('city', '').strip()
    state = data.get('state', '').strip()
    pincode = data.get('pincode', '').strip()
    otp_code = data.get('otp_code', '').strip()

    if not email or not name:
        return jsonify({'message': 'Full Name and Email are required.'}), 400

    # Check if Donor profile already exists for this email
    if User.query.filter_by(email=email, role='donor').first():
        return jsonify({'message': 'A Donor account with this email address already exists. Please log in.'}), 400

    password = data.get('password', '').strip()
    if not password or len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters.'}), 400

    # Create Donor user with status='active'
    user = User(
        username=f"{email}_donor",
        email=email,
        role='donor',
        phone=phone,
        address=f"{address}, {city}, {state} - {pincode}",
        status='active',
        is_email_verified=True
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()

        donor_profile = DonorProfile(
            user_id=user.id,
            organization_name=org_name or name,
            donor_type=donor_type,
            contact_name=name,
            phone=phone,
            email=email,
            address=address,
            city=city,
            state=state,
            pincode=pincode
        )
        db.session.add(donor_profile)
        db.session.commit()

        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'message': 'Donor account created successfully!',
            'status': 'active',
            'token': access_token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create Donor account: {str(e)}'}), 500


@auth_bp.route('/register-receiver', methods=['POST'])
def register_receiver():
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    address = data.get('address', '').strip()
    city = data.get('city', '').strip()
    state = data.get('state', '').strip()
    pincode = data.get('pincode', '').strip()
    family_size = data.get('familySize', 1)
    otp_code = data.get('otp_code', '').strip()

    if not email or not name:
        return jsonify({'message': 'Full Name and Email are required.'}), 400

    # Check if Receiver profile already exists for this email
    if User.query.filter_by(email=email, role='receiver').first():
        return jsonify({'message': 'A Receiver account with this email address already exists. Please log in.'}), 400

    password = data.get('password', '').strip()
    if not password or len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters.'}), 400

    # Create Receiver user with status='active'
    user = User(
        username=f"{email}_receiver",
        email=email,
        role='receiver',
        phone=phone,
        address=f"{address}, {city}, {state} - {pincode}",
        status='active',
        is_email_verified=True
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()

        receiver_profile = ReceiverProfile(
            user_id=user.id,
            contact_name=name,
            phone=phone,
            address=address,
            city=city,
            state=state,
            pincode=pincode,
            family_size=int(family_size)
        )
        db.session.add(receiver_profile)
        db.session.commit()

        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'message': 'Receiver account created successfully!',
            'status': 'active',
            'token': access_token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create Receiver account: {str(e)}'}), 500


@auth_bp.route('/login-otp-request', methods=['POST'])
def login_otp_request():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    selected_role = data.get('role', '').strip().lower()  # 'admin', 'ngo', 'donor', 'receiver'

    if not email or '@' not in email or '.' not in email:
        return jsonify({'message': 'Please enter a valid email address.'}), 400

    if not selected_role or selected_role not in ['admin', 'ngo', 'donor', 'receiver']:
        return jsonify({'message': 'Please select a valid role (ADMIN, NGO, DONOR, or RECEIVER).'}), 400

    user = User.query.filter_by(email=email).first()

    # Admin verification: Non-admin email tries Admin login -> Access denied
    if selected_role == 'admin':
        if not user or user.role != 'admin':
            return jsonify({'message': 'Access denied. This email is not registered as an Admin.'}), 403

    if selected_role == 'ngo':
        if not user or user.role != 'ngo':
            return jsonify({'message': 'No NGO account found for this email. Please create an NGO account.'}), 404

    if selected_role == 'donor':
        if not user or user.role != 'donor':
            return jsonify({'message': 'No Donor account found for this email. Please create a Donor account.'}), 404

    if selected_role == 'receiver':
        if not user or user.role != 'receiver':
            return jsonify({'message': 'No Receiver account found for this email. Please create a Receiver account.'}), 404

    if user.status == 'suspended':
        return jsonify({'message': 'Your account has been suspended. Please contact support.'}), 403

    # Generate 6-digit OTP code
    otp_code = generate_otp()
    expiry_minutes = getattr(Config, 'OTP_EXPIRY_MINUTES', 5)
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=expiry_minutes)

    new_otp = OTPCode(
        email=user.email,
        purpose='login',
        attempts=0,
        is_verified=False,
        expires_at=expires_at
    )
    new_otp.set_otp(otp_code)

    try:
        db.session.add(new_otp)
        db.session.commit()

        success, err = send_otp_email(user.email, otp_code, purpose=f"Login ({selected_role.upper()})")
        if not success and not err.startswith("Dev mode"):
            return jsonify({'message': f'Failed to deliver OTP email: {err}'}), 500

        res_msg = f'OTP sent to {user.email}'
        if err and err.startswith("Dev mode"):
            res_msg += ' (Dev Mode: Check server terminal for OTP)'

        return jsonify({
            'message': res_msg,
            'email': user.email,
            'role': user.role,
            'requires_otp': True,
            'expires_in_minutes': expiry_minutes,
            'resend_cooldown_seconds': 60
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error generating OTP: {str(e)}'}), 500


@auth_bp.route('/login-otp-verify', methods=['POST'])
def login_otp_verify():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    selected_role = data.get('role', '').strip().lower()
    otp_input = data.get('otp_code', '').strip()

    if not email or not otp_input:
        return jsonify({'message': 'Email and 6-digit OTP code are required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'Email address is not registered.'}), 404

    if selected_role and user.role != selected_role:
        return jsonify({'message': 'Role authorization mismatch.'}), 403

    otp_record = OTPCode.query.filter_by(email=user.email, purpose='login').order_by(OTPCode.created_at.desc()).first()

    if not otp_record:
        return jsonify({'message': 'No verification code found. Please request a new OTP.'}), 400

    if datetime.datetime.utcnow() > otp_record.expires_at:
        return jsonify({'message': 'Verification code has expired. Please request a new OTP.'}), 400

    max_attempts = getattr(Config, 'OTP_MAX_ATTEMPTS', 3)
    if otp_record.attempts >= max_attempts:
        return jsonify({'message': 'Maximum verification attempts exceeded. Please request a new code.'}), 400

    otp_record.attempts += 1

    if not otp_record.check_otp(otp_input):
        db.session.commit()
        remaining = max_attempts - otp_record.attempts
        if remaining > 0:
            return jsonify({'message': f'Incorrect OTP. {remaining} attempt(s) remaining.'}), 400
        else:
            return jsonify({'message': 'Maximum verification attempts exceeded. Please request a new code.'}), 400

    # Correct OTP verified!
    otp_record.is_verified = True
    user.is_email_verified = True

    try:
        db.session.commit()

        access_token = create_access_token(identity=str(user.id))
        user_data = user.to_dict()
        if user.role == 'ngo' and user.ngo_profile:
            user_data['ngo_profile'] = user.ngo_profile.to_dict()
        elif user.role == 'donor' and user.donor_profile:
            user_data['donor_profile'] = user.donor_profile.to_dict()
        elif user.role == 'receiver' and user.receiver_profile:
            user_data['receiver_profile'] = user.receiver_profile.to_dict()

        return jsonify({
            'message': 'Login successful!',
            'token': access_token,
            'user': user_data,
            'status': user.status,
            'role': user.role
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Login verification error: {str(e)}'}), 500


@auth_bp.route('/resubmit-ngo', methods=['POST'])
@jwt_required()
def resubmit_ngo():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'ngo':
        return jsonify({'message': 'Unauthorized. NGO role required.'}), 403

    data = request.get_json() or {}
    ngo_profile = user.ngo_profile

    if not ngo_profile:
        return jsonify({'message': 'NGO Profile not found.'}), 404

    ngo_profile.organization_name = data.get('ngoName', ngo_profile.organization_name)
    ngo_profile.registration_number = data.get('registrationNumber', ngo_profile.registration_number)
    ngo_profile.ngo_type = data.get('ngoType', ngo_profile.ngo_type)
    ngo_profile.description = data.get('description', ngo_profile.description)
    ngo_profile.established_year = data.get('establishedYear', ngo_profile.established_year)
    ngo_profile.contact_person = data.get('contactPerson', ngo_profile.contact_person)
    ngo_profile.phone = data.get('phone', ngo_profile.phone)
    ngo_profile.address = data.get('address', ngo_profile.address)
    ngo_profile.city = data.get('city', ngo_profile.city)
    ngo_profile.state = data.get('state', ngo_profile.state)
    ngo_profile.pincode = data.get('pincode', ngo_profile.pincode)

    if 'documents' in data:
        docs = data.get('documents')
        ngo_profile.documents = json.dumps(docs) if isinstance(docs, dict) else str(docs)

    user.status = 'pending_approval'
    ngo_profile.verified = False
    ngo_profile.rejection_reason = ''

    try:
        db.session.commit()
        return jsonify({
            'message': 'Your NGO application has been resubmitted successfully. Waiting for Admin approval.',
            'status': 'pending_approval',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to resubmit application: {str(e)}'}), 500

@auth_bp.route('/register', methods=['POST'])

def register():
    data = request.get_json() or {}
    
    username = data.get('username', '').strip() if data.get('username') else None
    email = data.get('email', '').strip().lower() if data.get('email') else None
    password = data.get('password')
    role = data.get('role')  # 'donor', 'ngo', 'receiver'
    otp_code = data.get('otp_code', '').strip()
    
    if not username or not email or not password or not role:
        return jsonify({'message': 'Missing required fields'}), 400
        
    if role == 'admin':
        return jsonify({'message': 'Public registration for Admin accounts is strictly prohibited.'}), 403

    if role not in ['donor', 'ngo', 'receiver']:
        return jsonify({'message': 'Invalid role type. Must be donor, ngo, or receiver'}), 400
        
    # Check if user already exists
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'message': 'Username or Email already registered'}), 400

    # Verify email OTP
    verified_otp = OTPCode.query.filter_by(email=email, is_verified=True).order_by(OTPCode.created_at.desc()).first()
    
    if not verified_otp and otp_code:
        # Check inline OTP code if provided during register call
        otp_rec = OTPCode.query.filter_by(email=email, purpose='registration').order_by(OTPCode.created_at.desc()).first()
        if otp_rec and datetime.datetime.utcnow() <= otp_rec.expires_at and otp_rec.otp_code == otp_code:
            otp_rec.is_verified = True
            verified_otp = otp_rec

    if not verified_otp:
        return jsonify({'message': 'Email address has not been verified. Please complete email verification first.'}), 400

    # Get location and phone coordinates if provided
    latitude = float(data.get('latitude', 12.9716)) # default Bengaluru coordinates
    longitude = float(data.get('longitude', 77.5946))
    address = data.get('address', '')
    phone = data.get('phone', '')
    
    # NGO details
    status = 'active'
    if role == 'ngo':
        # Admin must approve NGOs before they can accept donations (or start as pending)
        status = 'pending_approval'
        
    user = User(
        username=username,
        email=email,
        role=role,
        latitude=latitude,
        longitude=longitude,
        address=address,
        phone=phone,
        status=status,
        is_email_verified=True
    )
    user.set_password(password)
    
    try:
        db.session.add(user)
        db.session.commit()
        
        # If user is NGO, create profile
        if role == 'ngo':
            ngo_name = data.get('organization_name', f"{username} Foundation")
            reg_num = data.get('registration_number', 'PENDING-REG')
            tax_id = data.get('tax_id', '')
            capacity = int(data.get('capacity_people', 100))
            pref_types = data.get('preferred_food_types', 'all')
            website = data.get('website', '')
            
            ngo_prof = NgoProfile(
                user_id=user.id,
                organization_name=ngo_name,
                registration_number=reg_num,
                tax_id=tax_id,
                capacity_people=capacity,
                preferred_food_types=pref_types,
                website=website,
                verified=False
            )
            db.session.add(ngo_prof)
            db.session.commit()
            
        elif role == 'receiver':
            recv_prof = ReceiverProfile(
                user_id=user.id,
                contact_name=username,
                phone=phone,
                address=address,
                family_size=1
            )
            db.session.add(recv_prof)
            db.session.commit()
            
        return jsonify({
            'message': f"User registered successfully. Status: {status}",
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Registration failed: {str(e)}"}), 500

@auth_bp.route('/login-role-email-otp-request', methods=['POST'])
def login_role_email_otp_request():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    selected_role = data.get('role', '').strip().lower()  # 'admin', 'ngo', 'donor', 'receiver'
    
    if not email or '@' not in email or '.' not in email:
        return jsonify({'message': 'Please enter a valid email address (e.g. user@domain.com).'}), 400

    if not selected_role or selected_role not in ['admin', 'ngo', 'donor', 'receiver']:
        return jsonify({'message': 'Please select a valid role (ADMIN, NGO, DONOR, or RECEIVER).'}), 400

    # Backend check: Is email registered for selected_role?
    user = User.query.filter_by(email=email, role=selected_role).first()
    if not user:
        if selected_role in ['donor', 'receiver']:
            # Check if user has an existing account under another normal role
            other_user = User.query.filter(User.email == email, User.role.in_(['donor', 'receiver'])).first()
            if other_user:
                # Auto-create profile for selected_role so both Donor & Receiver co-exist for this email
                user = User(
                    username=f"{email}_{selected_role}",
                    email=email,
                    role=selected_role,
                    phone=other_user.phone or '',
                    address=other_user.address or '',
                    status='active',
                    is_email_verified=True,
                    password_hash='NOPASSWORD_OTP_ONLY'
                )
                db.session.add(user)
                db.session.commit()
                if selected_role == 'receiver':
                    rp = ReceiverProfile(user_id=user.id, contact_name=other_user.username or email)
                    db.session.add(rp)
                elif selected_role == 'donor':
                    dp = DonorProfile(user_id=user.id, organization_name=other_user.username or email)
                    db.session.add(dp)
                db.session.commit()
            else:
                return jsonify({'message': 'Email address is not registered. Please click "Create Account" to sign up.'}), 404
        elif selected_role == 'admin':
            return jsonify({'message': 'This email is not registered as an Admin account. Admin accounts cannot be self-registered.'}), 404
        else:
            return jsonify({'message': 'This email is not registered as an NGO account. Please register your NGO.'}), 404
        
    if user.status == 'suspended':
        if selected_role == 'admin':
            return jsonify({'message': 'Your Admin account is currently suspended. Please contact system administration.'}), 403
        return jsonify({'message': 'Your account has been suspended. Please contact platform support.'}), 403

    if user.status == 'blocked':
        return jsonify({'message': 'Your account has been blocked. Please contact platform support.'}), 403

    # Generate 6-digit OTP code
    otp_code = generate_otp()
    expiry_minutes = getattr(Config, 'OTP_EXPIRY_MINUTES', 5)
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=expiry_minutes)

    # Save OTP record for purpose='login'
    new_otp = OTPCode(
        email=user.email,
        otp_code=otp_code,
        purpose='login',
        attempts=0,
        is_verified=False,
        expires_at=expires_at
    )

    try:
        db.session.add(new_otp)
        db.session.commit()

        # Send real OTP email via SMTP to that exact email
        success, err = send_otp_email(user.email, otp_code, purpose=f"Login ({selected_role.upper()})")
        
        if not success and not err.startswith("Dev mode"):
            return jsonify({'message': f'Failed to deliver OTP email: {err}'}), 500

        res_msg = f'OTP sent to that exact email: {user.email}'
        if err and err.startswith("Dev mode"):
            res_msg += ' (Dev Mode: Check server terminal log for OTP)'

        resp_data = {
            'message': res_msg,
            'email': user.email,
            'role': user.role,
            'requires_otp': True,
            'expires_in_minutes': expiry_minutes,
            'resend_cooldown_seconds': 60
        }
        # Always expose dev_otp in dev/no-smtp mode for ALL roles (including admin)
        is_dev_mode = (
            getattr(Config, 'DEBUG', True)
            or not getattr(Config, 'SMTP_USER', None)
            or getattr(Config, 'SMTP_USER', '') == 'your-email@gmail.com'
            or 'example.com' in user.email
        )
        if is_dev_mode:
            resp_data['dev_otp'] = otp_code

        return jsonify(resp_data), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error generating OTP: {str(e)}'}), 500


@auth_bp.route('/login-role-email-otp-verify', methods=['POST'])
def login_role_email_otp_verify():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    selected_role = data.get('role', '').strip().lower()
    otp_input = data.get('otp_code', '').strip()

    if not email or not otp_input:
        return jsonify({'message': 'Email and 6-digit verification code are required.'}), 400

    user = User.query.filter_by(email=email, role=selected_role).first()
    if not user:
        if selected_role in ['donor', 'receiver']:
            other_user = User.query.filter(User.email == email, User.role.in_(['donor', 'receiver'])).first()
            if other_user:
                user = User(
                    username=f"{email}_{selected_role}",
                    email=email,
                    role=selected_role,
                    phone=other_user.phone or '',
                    address=other_user.address or '',
                    status='active',
                    is_email_verified=True,
                    password_hash='NOPASSWORD_OTP_ONLY'
                )
                db.session.add(user)
                db.session.commit()
                if selected_role == 'receiver':
                    rp = ReceiverProfile(user_id=user.id, contact_name=other_user.username or email)
                    db.session.add(rp)
                elif selected_role == 'donor':
                    dp = DonorProfile(user_id=user.id, organization_name=other_user.username or email)
                    db.session.add(dp)
                db.session.commit()
            else:
                return jsonify({'message': 'Email address is not registered.'}), 404
        else:
            return jsonify({'message': 'Email address is not registered.'}), 404

    # Query latest OTP record for purpose='login'
    otp_record = OTPCode.query.filter_by(email=user.email, purpose='login').order_by(OTPCode.created_at.desc()).first()

    if not otp_record:
        return jsonify({'message': 'No verification code found. Please click Send OTP.'}), 400

    # Check expiration (5 minutes)
    if datetime.datetime.utcnow() > otp_record.expires_at:
        return jsonify({'message': 'Verification code has expired (5-minute limit). Please click Resend OTP.'}), 400

    max_attempts = getattr(Config, 'OTP_MAX_ATTEMPTS', 3)
    if otp_record.attempts >= max_attempts:
        return jsonify({'message': 'Maximum verification attempts exceeded. Please request a new code.'}), 400

    # Increment attempt count
    otp_record.attempts += 1

    if otp_record.otp_code != otp_input:
        db.session.commit()
        remaining = max_attempts - otp_record.attempts
        if remaining > 0:
            return jsonify({'message': f'Invalid verification code. {remaining} attempt(s) remaining.'}), 400
        else:
            return jsonify({'message': 'Maximum verification attempts exceeded. Please request a new code.'}), 400

    # OTP verified successfully!
    otp_record.is_verified = True
    user.is_email_verified = True

    try:
        db.session.commit()
        
        # Generate JWT session token
        access_token = create_access_token(identity=str(user.id))
        
        user_data = user.to_dict()
        if user.role == 'ngo' and user.ngo_profile:
            user_data['ngo_profile'] = user.ngo_profile.to_dict()

        return jsonify({
            'message': 'Login successful!',
            'token': access_token,
            'user': user_data
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Login verification error: {str(e)}'}), 500


@auth_bp.route('/login-email-otp-request', methods=['POST'])

def login_email_otp_request():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    
    if not email or '@' not in email or '.' not in email:
        return jsonify({'message': 'Please enter a valid email address (e.g. user@domain.com).'}), 400

    # Backend check: Is email registered?
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'Email address is not registered. Please sign up for a new account.'}), 404
        
    if user.status == 'suspended':
        return jsonify({'message': 'Your account has been suspended. Please contact platform support.'}), 403

    # Generate 6-digit OTP code
    otp_code = generate_otp()
    expiry_minutes = getattr(Config, 'OTP_EXPIRY_MINUTES', 5)
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=expiry_minutes)

    # Save OTP record for purpose='login'
    new_otp = OTPCode(
        email=user.email,
        otp_code=otp_code,
        purpose='login',
        attempts=0,
        is_verified=False,
        expires_at=expires_at
    )

    try:
        db.session.add(new_otp)
        db.session.commit()

        # Send real OTP email via SMTP
        success, err = send_otp_email(user.email, otp_code, purpose="Login Authentication")
        
        if not success and not err.startswith("Dev mode"):
            return jsonify({'message': f'Failed to deliver OTP email: {err}'}), 500

        res_msg = f'Verification code sent to {user.email}. Please check your inbox.'
        if err and err.startswith("Dev mode"):
            res_msg += ' (Dev Mode: Check server terminal log for OTP)'

        return jsonify({
            'message': res_msg,
            'email': user.email,
            'requires_otp': True,
            'expires_in_minutes': expiry_minutes,
            'resend_cooldown_seconds': 60
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error generating OTP: {str(e)}'}), 500


@auth_bp.route('/login-email-otp-verify', methods=['POST'])
def login_email_otp_verify():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    otp_input = data.get('otp_code', '').strip()

    if not email or not otp_input:
        return jsonify({'message': 'Email and 6-digit verification code are required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'Email address is not registered.'}), 404

    # Query latest OTP record for purpose='login'
    otp_record = OTPCode.query.filter_by(email=user.email, purpose='login').order_by(OTPCode.created_at.desc()).first()

    if not otp_record:
        return jsonify({'message': 'No login verification code found. Please click Request OTP.'}), 400

    # Check expiration (5 minutes)
    if datetime.datetime.utcnow() > otp_record.expires_at:
        return jsonify({'message': 'Verification code has expired (5-minute limit). Please click Resend Code.'}), 400

    max_attempts = getattr(Config, 'OTP_MAX_ATTEMPTS', 3)
    if otp_record.attempts >= max_attempts:
        return jsonify({'message': 'Maximum verification attempts exceeded. Please request a new code.'}), 400

    # Increment attempt count
    otp_record.attempts += 1

    if otp_record.otp_code != otp_input:
        db.session.commit()
        remaining = max_attempts - otp_record.attempts
        if remaining > 0:
            return jsonify({'message': f'Invalid verification code. {remaining} attempt(s) remaining.'}), 400
        else:
            return jsonify({'message': 'Maximum verification attempts exceeded. Please request a new code.'}), 400

    # OTP verified successfully!
    otp_record.is_verified = True
    user.is_email_verified = True

    try:
        db.session.commit()
        
        # Generate JWT session token
        access_token = create_access_token(identity=str(user.id))
        
        user_data = user.to_dict()
        if user.role == 'ngo' and user.ngo_profile:
            user_data['ngo_profile'] = user.ngo_profile.to_dict()
        elif user.role == 'donor' and user.donor_profile:
            user_data['donor_profile'] = user.donor_profile.to_dict()
        elif user.role == 'receiver' and user.receiver_profile:
            user_data['receiver_profile'] = user.receiver_profile.to_dict()

        return jsonify({
            'message': 'Login successful!',
            'token': access_token,
            'user': user_data
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Login verification error: {str(e)}'}), 500


@auth_bp.route('/login-request-otp', methods=['POST'])

def login_request_otp():
    data = request.get_json() or {}
    username = data.get('username', '').strip() if data.get('username') else None
    password = data.get('password')
    selected_role = data.get('role')  # 'donor', 'ngo', 'admin'
    
    if not username or not password:
        return jsonify({'message': 'Please enter your username/email and password'}), 400

    user = User.query.filter((User.username == username) | (User.email == username)).first()
    
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid username/email or password.'}), 401
        
    if user.status == 'suspended':
        return jsonify({'message': 'Your account has been suspended. Contact support.'}), 403

    # Enforce role matching: ensure selected role matches registered account role
    if selected_role:
        is_normal_user = user.role in ['donor', 'receiver']
        selected_normal_role = selected_role in ['donor', 'receiver']
        if is_normal_user and selected_normal_role:
            pass # Allow
        elif user.role != selected_role:
            role_labels = {'donor': 'Donor', 'ngo': 'NGO', 'admin': 'Admin', 'receiver': 'Receiver'}
            actual_label = role_labels.get(user.role, user.role)
            selected_label = role_labels.get(selected_role, selected_role)
            return jsonify({'message': f'Role mismatch: This account is registered as a {actual_label}, not {selected_label}. Please select the {actual_label} role card.'}), 403

    # Generate 6-digit OTP
    otp_code = generate_otp()
    expiry_minutes = getattr(Config, 'OTP_EXPIRY_MINUTES', 5)
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=expiry_minutes)

    # Save OTP record for purpose='login'
    new_otp = OTPCode(
        email=user.email,
        otp_code=otp_code,
        purpose='login',
        attempts=0,
        is_verified=False,
        expires_at=expires_at
    )

    try:
        db.session.add(new_otp)
        db.session.commit()

        # Send real email via SMTP
        success, err = send_otp_email(user.email, otp_code, purpose="Login Authentication")
        
        if not success and not err.startswith("Dev mode"):
            return jsonify({'message': f'Failed to deliver OTP to email: {err}'}), 500

        res_msg = f'Verification code has been sent to {user.email}. Please check your email inbox.'
        if err and err.startswith("Dev mode"):
            res_msg += ' (Dev Mode: Check server terminal log for OTP)'

        return jsonify({
            'message': res_msg,
            'email': user.email,
            'requires_otp': True,
            'expires_in_minutes': expiry_minutes,
            'resend_cooldown_seconds': 60
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error generating OTP: {str(e)}'}), 500


@auth_bp.route('/login-verify-otp', methods=['POST'])
def login_verify_otp():
    data = request.get_json() or {}
    username = data.get('username', '').strip() if data.get('username') else None
    password = data.get('password')
    otp_input = data.get('otp_code', '').strip()
    selected_role = data.get('role')

    if not username or not password or not otp_input:
        return jsonify({'message': 'Missing credentials or 6-digit verification code.'}), 400

    user = User.query.filter((User.username == username) | (User.email == username)).first()
    
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials.'}), 401

    if selected_role and user.role != selected_role:
        return jsonify({'message': 'Role authorization failed.'}), 403

    # Query latest OTP record for login
    otp_record = OTPCode.query.filter_by(email=user.email, purpose='login').order_by(OTPCode.created_at.desc()).first()

    if not otp_record:
        return jsonify({'message': 'No login verification code found. Please request a new code.'}), 400

    # Check expiration (5 minutes)
    if datetime.datetime.utcnow() > otp_record.expires_at:
        return jsonify({'message': 'Verification code has expired (5-minute limit). Please click Resend Code.'}), 400

    max_attempts = getattr(Config, 'OTP_MAX_ATTEMPTS', 3)
    if otp_record.attempts >= max_attempts:
        return jsonify({'message': 'Maximum verification attempts exceeded. Please request a new code.'}), 400

    # Increment attempt count
    otp_record.attempts += 1

    if otp_record.otp_code != otp_input:
        db.session.commit()
        remaining = max_attempts - otp_record.attempts
        if remaining > 0:
            return jsonify({'message': f'Invalid verification code. {remaining} attempt(s) remaining.'}), 400
        else:
            return jsonify({'message': 'Maximum verification attempts exceeded. Please request a new code.'}), 400

    # OTP verified successfully!
    otp_record.is_verified = True
    user.is_email_verified = True

    try:
        db.session.commit()
        
        # Generate JWT session token
        access_token = create_access_token(identity=str(user.id))
        
        user_data = user.to_dict()
        if user.role == 'ngo' and user.ngo_profile:
            user_data['ngo_profile'] = user.ngo_profile.to_dict()

        return jsonify({
            'message': 'Login successful!',
            'token': access_token,
            'user': user_data
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Login verification error: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip() if data.get('username') else None
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400
        
    user = User.query.filter((User.username == username) | (User.email == username)).first()
    
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    if user.status == 'suspended':
        return jsonify({'message': 'Your account has been suspended. Contact support.'}), 403
        
    # Generate JWT
    access_token = create_access_token(identity=str(user.id))
    
    user_data = user.to_dict()
    if user.role == 'ngo' and user.ngo_profile:
        user_data['ngo_profile'] = user.ngo_profile.to_dict()
        
    return jsonify({
        'token': access_token,
        'user': user_data
    }), 200



@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 444
        
    user_data = user.to_dict()
    if user.role == 'ngo' and user.ngo_profile:
        user_data['ngo_profile'] = user.ngo_profile.to_dict()
        
    return jsonify(user_data), 200

@auth_bp.route('/location', methods=['PATCH'])
@jwt_required()
def update_location():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    data = request.get_json() or {}
    lat = data.get('latitude')
    lon = data.get('longitude')
    address = data.get('address')
    
    if lat is not None:
        user.latitude = float(lat)
    if lon is not None:
        user.longitude = float(lon)
    if address is not None:
        user.address = str(address)
        
    try:
        db.session.commit()
        return jsonify({
            'message': 'User location updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f"Failed to update location: {str(e)}"}), 500


@auth_bp.route('/google-login', methods=['POST'])
def google_login():
    data = request.get_json() or {}
    credential = data.get('credential', '').strip()   # Real Google JWT token
    email_fallback = data.get('email', '').strip().lower()  # Dev/fallback plain email
    selected_role = data.get('role', '').strip().lower()  # 'admin', 'ngo', 'donor', 'receiver'

    email = ''

    # ── Verify real Google JWT credential ────────────────────────────────────
    if credential:
        try:
            import urllib.parse
            token_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={urllib.parse.quote(credential)}"
            with urllib.request.urlopen(token_url, timeout=5) as resp:
                token_data = json.loads(resp.read().decode())
            email = token_data.get('email', '').strip().lower()
            if not email:
                return jsonify({'message': 'Google token did not contain a valid email.'}), 400
        except Exception as e:
            return jsonify({'message': f'Google token verification failed: {str(e)}'}), 401
    elif email_fallback:
        # Dev-mode or legacy flow — accept plain email without token verification
        email = email_fallback
    else:
        return jsonify({'message': 'Please provide a Google credential or email.'}), 400
    
    if not email or '@' not in email or '.' not in email:
        return jsonify({'message': 'Please select or enter a valid Google account email.'}), 400

    if not selected_role or selected_role not in ['admin', 'ngo', 'donor', 'receiver']:
        return jsonify({'message': 'Please select a valid role (ADMIN, NGO, DONOR, or RECEIVER).'}), 400

    # 1. Lookup user in database by (email, selected_role)
    user = User.query.filter_by(email=email, role=selected_role).first()
    
    # 2. If user profile for selected_role does NOT exist in database
    if not user:
        if selected_role in ['donor', 'receiver']:
            # Auto-create profile for selected_role so both Donor & Receiver co-exist for this Google email
            other_user = User.query.filter(User.email == email, User.role.in_(['donor', 'receiver'])).first()
            user = User(
                username=f"{email}_{selected_role}",
                email=email,
                role=selected_role,
                phone=other_user.phone if other_user else '',
                address=other_user.address if other_user else '',
                status='active',
                is_email_verified=True,
                password_hash='NOPASSWORD_GOOGLE'
            )
            db.session.add(user)
            db.session.commit()
            if selected_role == 'receiver':
                rp = ReceiverProfile(user_id=user.id, contact_name=other_user.username if other_user else email)
                db.session.add(rp)
            elif selected_role == 'donor':
                dp = DonorProfile(user_id=user.id, organization_name=other_user.username if other_user else email)
                db.session.add(dp)
            db.session.commit()
        elif selected_role == 'admin':
            return jsonify({'message': 'Your Google account is not authorized for Admin access.'}), 404
        else:
            return jsonify({'message': 'Your Google account is not associated with an approved NGO account.'}), 404

    # 3. Account status check
    if user.status == 'suspended':
        if selected_role == 'admin':
            return jsonify({'message': 'Your Admin account is currently suspended. Please contact system administration.'}), 403
        return jsonify({'message': 'Your account has been suspended. Please contact platform support.'}), 403

    if user.status == 'blocked':
        return jsonify({'message': 'Your account has been blocked. Please contact platform support.'}), 403

    # 5. Generate JWT session token
    access_token = create_access_token(identity=str(user.id))
    
    user_data = user.to_dict()
    if user.role == 'ngo' and user.ngo_profile:
        user_data['ngo_profile'] = user.ngo_profile.to_dict()

    return jsonify({
        'message': 'Google authentication successful!',
        'token': access_token,
        'user': user_data
    }), 200


@auth_bp.route('/password-login', methods=['POST'])
def password_login():
    """Login with email + password + role."""
    data = request.get_json() or {}
    email         = data.get('email', '').strip().lower()
    password      = data.get('password', '').strip()
    selected_role = data.get('role', '').strip().lower()

    if not email or not password:
        return jsonify({'message': 'Email and password are required.'}), 400

    if not selected_role or selected_role not in ['admin', 'ngo', 'donor', 'receiver']:
        return jsonify({'message': 'Please select a valid role.'}), 400

    # Find user by email + role
    user = User.query.filter_by(email=email, role=selected_role).first()

    if not user:
        return jsonify({'message': f'No {selected_role.capitalize()} account found for this email.'}), 404

    # Blocked / Suspended check
    if user.status == 'suspended':
        return jsonify({'message': 'Your account has been suspended. Please contact support.'}), 403
    if user.status == 'blocked':
        return jsonify({'message': 'Your account has been blocked. Please contact support.'}), 403

    # NGO pending approval
    if user.role == 'ngo' and user.status == 'pending_approval':
        return jsonify({'message': 'Your NGO account is awaiting admin approval.', 'status': 'pending_approval'}), 403

    # Verify password (Google-auth users have no real password)
    if user.password_hash == 'NOPASSWORD_GOOGLE':
        return jsonify({'message': 'This account uses Google Sign-In. Please use Google to log in.'}), 400

    if not user.check_password(password):
        return jsonify({'message': 'Incorrect password. Please try again.'}), 401

    # Issue JWT
    access_token = create_access_token(identity=str(user.id))
    user_data = user.to_dict()
    if user.role == 'ngo' and user.ngo_profile:
        user_data['ngo_profile'] = user.ngo_profile.to_dict()

    return jsonify({
        'message': 'Login successful!',
        'token': access_token,
        'user': user_data
    }), 200
