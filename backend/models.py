import datetime
import bcrypt
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    __table_args__ = (
        db.UniqueConstraint('email', 'role', name='_email_role_uc'),
        db.UniqueConstraint('username', 'role', name='_username_role_uc'),
    )
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'donor', 'receiver', 'ngo', 'admin'
    latitude = db.Column(db.Float, default=0.0)
    longitude = db.Column(db.Float, default=0.0)
    address = db.Column(db.String(255), default='')
    phone = db.Column(db.String(20), default='')
    status = db.Column(db.String(20), default='active')  # 'active', 'pending_approval', 'suspended'
    is_email_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    ngo_profile = db.relationship('NgoProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    donor_profile = db.relationship('DonorProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    donations = db.relationship('FoodDonation', backref='donor', lazy=True, cascade="all, delete-orphan")
    requests = db.relationship('DonationRequest', backref='ngo', lazy=True, cascade="all, delete-orphan")
    receiver_profile = db.relationship('ReceiverProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    claims = db.relationship('FoodClaim', backref='claimant', lazy=True, cascade="all, delete-orphan")
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade="all, delete-orphan")

    
    def set_password(self, password):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
        
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'address': self.address,
            'phone': self.phone,
            'status': self.status,
            'is_email_verified': self.is_email_verified,
            'created_at': self.created_at.isoformat()
        }

class OTPCode(db.Model):
    __tablename__ = 'otp_codes'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), index=True, nullable=False)
    otp_code = db.Column(db.String(10), nullable=False)
    otp_hash = db.Column(db.String(255), nullable=True)
    purpose = db.Column(db.String(50), default='registration') # 'registration', 'login'
    attempts = db.Column(db.Integer, default=0)
    is_verified = db.Column(db.Boolean, default=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def set_otp(self, code):
        self.otp_code = code
        salt = bcrypt.gensalt()
        self.otp_hash = bcrypt.hashpw(code.encode('utf-8'), salt).decode('utf-8')
        
    def check_otp(self, code):
        if self.otp_hash:
            return bcrypt.checkpw(code.encode('utf-8'), self.otp_hash.encode('utf-8'))
        return self.otp_code == code
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'purpose': self.purpose,
            'attempts': self.attempts,
            'is_verified': self.is_verified,
            'expires_at': self.expires_at.isoformat(),
            'created_at': self.created_at.isoformat()
        }


class NgoProfile(db.Model):
    __tablename__ = 'ngo_profiles'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    organization_name = db.Column(db.String(150), nullable=False)
    registration_number = db.Column(db.String(100), nullable=False)
    ngo_type = db.Column(db.String(50), default='NGO')  # Shelter, Orphanage, Community Kitchen, NGO
    description = db.Column(db.Text, default='')
    established_year = db.Column(db.String(20), default='')
    contact_person = db.Column(db.String(100), default='')
    official_email = db.Column(db.String(150), default='')
    phone = db.Column(db.String(30), default='')
    address = db.Column(db.String(255), default='')
    city = db.Column(db.String(100), default='')
    state = db.Column(db.String(100), default='')
    pincode = db.Column(db.String(20), default='')
    tax_id = db.Column(db.String(50), default='')
    capacity_people = db.Column(db.Integer, default=0)
    preferred_food_types = db.Column(db.String(255), default='all')  # comma-separated
    verified = db.Column(db.Boolean, default=False)
    website = db.Column(db.String(255), default='')
    documents = db.Column(db.Text, default='{}')  # JSON string of uploaded documents metadata
    rejection_reason = db.Column(db.Text, default='')
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'organization_name': self.organization_name,
            'registration_number': self.registration_number,
            'ngo_type': self.ngo_type,
            'description': self.description,
            'established_year': self.established_year,
            'contact_person': self.contact_person,
            'official_email': self.official_email,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'pincode': self.pincode,
            'tax_id': self.tax_id,
            'capacity_people': self.capacity_people,
            'preferred_food_types': self.preferred_food_types,
            'verified': self.verified,
            'website': self.website,
            'documents': self.documents,
            'rejection_reason': self.rejection_reason
        }


class DonorProfile(db.Model):
    __tablename__ = 'donor_profiles'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    organization_name = db.Column(db.String(150), default='')
    donor_type = db.Column(db.String(50), default='Restaurant')  # Hotel, Restaurant, Bakery, Household, Store
    contact_name = db.Column(db.String(100), default='')
    phone = db.Column(db.String(30), default='')
    email = db.Column(db.String(150), default='')
    address = db.Column(db.String(255), default='')
    city = db.Column(db.String(100), default='')
    state = db.Column(db.String(100), default='')
    pincode = db.Column(db.String(20), default='')
    latitude = db.Column(db.Float, default=0.0)
    longitude = db.Column(db.Float, default=0.0)
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'organization_name': self.organization_name,
            'donor_type': self.donor_type,
            'contact_name': self.contact_name,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'pincode': self.pincode,
            'latitude': self.latitude,
            'longitude': self.longitude
        }


class ReceiverProfile(db.Model):
    __tablename__ = 'receiver_profiles'
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    contact_name = db.Column(db.String(100), default='')
    phone = db.Column(db.String(30), default='')
    address = db.Column(db.String(255), default='')
    city = db.Column(db.String(100), default='')
    state = db.Column(db.String(100), default='')
    pincode = db.Column(db.String(20), default='')
    family_size = db.Column(db.Integer, default=1)
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'contact_name': self.contact_name,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'pincode': self.pincode,
            'family_size': self.family_size
        }


class FoodDonation(db.Model):
    __tablename__ = 'food_donations'
    
    id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    food_type = db.Column(db.String(30), nullable=False)  # 'cooked', 'raw_meat', 'dairy', etc.
    quantity = db.Column(db.Float, nullable=False)
    quantity_unit = db.Column(db.String(20), default='kg')
    storage_condition = db.Column(db.String(30), nullable=False)  # 'ambient', 'refrigerated', 'frozen'
    temperature_celsius = db.Column(db.Float, nullable=False)
    prep_time = db.Column(db.DateTime, nullable=False)
    estimated_expiry = db.Column(db.DateTime)
    remaining_shelf_life_hours = db.Column(db.Float, default=0.0)
    risk_level = db.Column(db.String(20), default='Safe')  # 'Safe', 'Medium Risk', 'High Risk'
    status = db.Column(db.String(20), default='AVAILABLE')  # 'AVAILABLE', 'CLAIMED', 'PICKUP_PENDING', 'ON_THE_WAY', 'ARRIVED', 'FOOD_COLLECTED', 'COMPLETED', 'EXPIRED', 'CANCELLED'
    image_url = db.Column(db.String(255), default='')
    qr_code_data = db.Column(db.String(255), default='')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    requests = db.relationship('DonationRequest', backref='donation', lazy=True, cascade="all, delete-orphan")
    claims = db.relationship('FoodClaim', backref='donation', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        donor_address = self.donor.address if self.donor else ''
        # Extract city from address for privacy-safe display (first segment before comma or full if no comma)
        donor_city = donor_address.split(',')[0].strip() if donor_address else 'Nearby Area'
        
        return {
            'id': self.id,
            'donor_id': self.donor_id,
            'donor_name': self.donor.username if self.donor else 'Unknown',
            'donor_phone': self.donor.phone if self.donor else '',
            'donor_address': donor_address,
            'donor_city': donor_city,
            'donor_latitude': self.donor.latitude if self.donor else 0.0,
            'donor_longitude': self.donor.longitude if self.donor else 0.0,
            'title': self.title,
            'description': self.description,
            'food_type': self.food_type,
            'quantity': self.quantity,
            'quantity_unit': self.quantity_unit,
            'storage_condition': self.storage_condition,
            'temperature_celsius': self.temperature_celsius,
            'prep_time': self.prep_time.isoformat(),
            'estimated_expiry': self.estimated_expiry.isoformat() if self.estimated_expiry else None,
            'remaining_shelf_life_hours': self.remaining_shelf_life_hours,
            'risk_level': self.risk_level,
            'status': self.status,
            'image_url': self.image_url,
            'qr_code_data': self.qr_code_data,
            'created_at': self.created_at.isoformat(),
            'requests': [req.to_dict() for req in self.requests] if self.requests else []
        }

class DonationRequest(db.Model):
    __tablename__ = 'donation_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    donation_id = db.Column(db.Integer, db.ForeignKey('food_donations.id', ondelete='CASCADE'), nullable=False)
    ngo_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # 'pending', 'accepted', 'rejected', 'cancelled'
    requested_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Delivery model removed in favor of direct FoodClaim
    
    def to_dict(self):
        return {
            'id': self.id,
            'donation_id': self.donation_id,
            'donation_title': self.donation.title if self.donation else 'Deleted Donation',
            'donor_name': self.donation.donor.username if self.donation and self.donation.donor else '',
            'ngo_id': self.ngo_id,
            'ngo_name': self.ngo.username if self.ngo else 'Unknown NGO',
            'status': self.status,
            'requested_at': self.requested_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

import math

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    try:
        lat1, lon1, lat2, lon2 = float(lat1 or 0), float(lon1 or 0), float(lat2 or 0), float(lon2 or 0)
        if lat1 == 0 and lon1 == 0 or lat2 == 0 and lon2 == 0:
            return 0.0
        R = 6371.0 # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 2)
    except Exception:
        return 0.0

class FoodClaim(db.Model):
    __tablename__ = 'food_claims'
    
    id = db.Column(db.Integer, primary_key=True)
    donation_id = db.Column(db.Integer, db.ForeignKey('food_donations.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False) # Receiver or NGO who claimed
    status = db.Column(db.String(30), default='CLAIMED')  # CLAIMED, ON_THE_WAY, ARRIVED, FOOD_COLLECTED, COMPLETED
    verification_code = db.Column(db.String(10), default='')
    claimed_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        donor_addr = self.donation.donor.address if (self.donation and self.donation.donor) else ''
        donor_lat = self.donation.donor.latitude if (self.donation and self.donation.donor) else 0.0
        donor_lon = self.donation.donor.longitude if (self.donation and self.donation.donor) else 0.0

        # Intelligent fallback for known locations if coordinates were not explicitly set
        if (donor_lat == 0.0 or donor_lon == 0.0) and donor_addr:
            addr_lower = donor_addr.lower()
            if 'poonamale' in addr_lower or 'poonamallee' in addr_lower:
                donor_lat, donor_lon = 13.0404, 80.1296
            elif 'chennai' in addr_lower:
                donor_lat, donor_lon = 13.0827, 80.2707
            elif 'bengaluru' in addr_lower or 'bangalore' in addr_lower or 'indiranagar' in addr_lower or 'koramangala' in addr_lower or 'whitefield' in addr_lower:
                donor_lat, donor_lon = 12.9716, 77.5946
            elif 'hyderabad' in addr_lower:
                donor_lat, donor_lon = 17.3850, 78.4867
            elif 'mumbai' in addr_lower:
                donor_lat, donor_lon = 19.0760, 72.8777
            elif 'delhi' in addr_lower:
                donor_lat, donor_lon = 28.6139, 77.2090

        claimant_lat = self.claimant.latitude if self.claimant else 0.0
        claimant_lon = self.claimant.longitude if self.claimant else 0.0

        distance_km = calculate_haversine_distance(claimant_lat, claimant_lon, donor_lat, donor_lon)
        eta_minutes = int(round((distance_km / 25.0) * 60)) if distance_km > 0 else 0

        return {
            'id': self.id,
            'donation_id': self.donation_id,
            'donation_title': self.donation.title if self.donation else 'Deleted Donation',
            'user_id': self.user_id,
            'claimant_name': self.claimant.username if self.claimant else 'Unknown',
            'claimant_role': self.claimant.role if self.claimant else 'Unknown',
            'status': self.status,
            'verification_code': self.verification_code,
            'donor_latitude': donor_lat,
            'donor_longitude': donor_lon,
            'donor_address': donor_addr,
            'claimant_latitude': claimant_lat,
            'claimant_longitude': claimant_lon,
            'distance_km': distance_km,
            'eta_minutes': eta_minutes,
            'claimed_at': self.claimed_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }



class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    donation_id = db.Column(db.Integer, db.ForeignKey('food_donations.id', ondelete='CASCADE'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    sender = db.relationship('User', foreign_keys=[sender_id])
    receiver = db.relationship('User', foreign_keys=[receiver_id])
    donation = db.relationship('FoodDonation', foreign_keys=[donation_id])
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'sender_name': self.sender.username if self.sender else 'Deleted User',
            'receiver_id': self.receiver_id,
            'receiver_name': self.receiver.username if self.receiver else 'Deleted User',
            'donation_id': self.donation_id,
            'donation_title': self.donation.title if self.donation else 'Deleted Donation',
            'message': self.message,
            'sent_at': self.sent_at.isoformat()
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'expiry_warning', 'new_donation', 'request_received', etc.
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'type': self.type,
            'title': self.title,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }

class AnalyticsSnapshot(db.Model):
    __tablename__ = 'analytics_snapshots'
    
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, unique=True, nullable=False)
    total_donations = db.Column(db.Integer, default=0)
    total_waste_saved_kg = db.Column(db.Float, default=0.0)
    active_ngos = db.Column(db.Integer, default=0)
    active_donors = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat(),
            'total_donations': self.total_donations,
            'total_waste_saved_kg': self.total_waste_saved_kg,
            'active_ngos': self.active_ngos,
            'active_donors': self.active_donors
        }

class FoodRequest(db.Model):
    __tablename__ = 'food_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    food_needed = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    number_of_people = db.Column(db.Integer, default=1)
    meals_required = db.Column(db.Integer, default=1)
    urgency = db.Column(db.String(20), default='Normal')
    needed_date = db.Column(db.String(50), nullable=False)
    needed_time = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    additional_instructions = db.Column(db.Text, default='')
    status = db.Column(db.String(20), default='PENDING')  # PENDING, MATCHED, FULFILLED, EXPIRED, CANCELLED
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    receiver = db.relationship('User', backref=db.backref('food_requests', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'receiver_id': self.receiver_id,
            'food_needed': self.food_needed,
            'category': self.category,
            'number_of_people': self.number_of_people,
            'meals_required': self.meals_required,
            'urgency': self.urgency,
            'needed_date': self.needed_date,
            'needed_time': self.needed_time,
            'location': self.location,
            'additional_instructions': self.additional_instructions,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }


class BeneficiaryGroup(db.Model):
    __tablename__ = 'beneficiary_groups'
    
    id = db.Column(db.Integer, primary_key=True)
    ngo_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    group_type = db.Column(db.String(50), default='Community')  # Community, Shelter, Orphanage, Relief Group, Support Group
    number_of_people = db.Column(db.Integer, default=1)
    area = db.Column(db.String(255), default='')
    food_requirements = db.Column(db.String(255), default='Any')
    contact_phone = db.Column(db.String(30), default='')
    contact_person = db.Column(db.String(100), default='')
    last_support_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='ACTIVE')  # ACTIVE, INACTIVE
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    ngo = db.relationship('User', backref=db.backref('beneficiaries', lazy=True, cascade="all, delete-orphan"))
    
    def to_dict(self):
        return {
            'id': self.id,
            'ngo_id': self.ngo_id,
            'name': self.name,
            'group_type': self.group_type,
            'number_of_people': self.number_of_people,
            'area': self.area,
            'food_requirements': self.food_requirements,
            'contact_phone': self.contact_phone,
            'contact_person': self.contact_person,
            'last_support_date': self.last_support_date.isoformat() if self.last_support_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }


class FoodDistribution(db.Model):
    __tablename__ = 'food_distributions'
    
    id = db.Column(db.Integer, primary_key=True)
    ngo_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    claim_id = db.Column(db.Integer, db.ForeignKey('food_claims.id', ondelete='SET NULL'), nullable=True)
    food_name = db.Column(db.String(150), nullable=False)
    collected_quantity = db.Column(db.Float, default=0.0)
    quantity_unit = db.Column(db.String(20), default='meals')
    distributed_meals = db.Column(db.Integer, default=0)
    people_served = db.Column(db.Integer, default=0)
    remaining_meals = db.Column(db.Integer, default=0)
    beneficiary_group_id = db.Column(db.Integer, db.ForeignKey('beneficiary_groups.id', ondelete='SET NULL'), nullable=True)
    beneficiary_name = db.Column(db.String(150), default='')
    distribution_date = db.Column(db.Date, default=datetime.date.today)
    status = db.Column(db.String(20), default='DISTRIBUTED')  # DISTRIBUTED, PLANNED, CANCELLED
    notes = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    ngo = db.relationship('User', backref=db.backref('distributions', lazy=True, cascade="all, delete-orphan"))
    claim = db.relationship('FoodClaim', backref=db.backref('distribution', uselist=False))
    beneficiary_group = db.relationship('BeneficiaryGroup', backref=db.backref('distributions', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'ngo_id': self.ngo_id,
            'claim_id': self.claim_id,
            'food_name': self.food_name,
            'collected_quantity': self.collected_quantity,
            'quantity_unit': self.quantity_unit,
            'distributed_meals': self.distributed_meals,
            'people_served': self.people_served,
            'remaining_meals': self.remaining_meals,
            'beneficiary_group_id': self.beneficiary_group_id,
            'beneficiary_name': self.beneficiary_name or (self.beneficiary_group.name if self.beneficiary_group else 'Community'),
            'distribution_date': self.distribution_date.isoformat() if self.distribution_date else None,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }

