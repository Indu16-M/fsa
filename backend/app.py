import os
import datetime
from dotenv import load_dotenv
load_dotenv()  # Load .env variables before Config is imported
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db, User, NgoProfile, FoodDonation, AnalyticsSnapshot

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable Cross-Origin Resource Sharing for react development
    CORS(app)
    
    # Initialize database
    db.init_app(app)
    
    # Initialize JWT Manager
    jwt = JWTManager(app)
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.donations import donations_bp
    from routes.ngo import ngo_bp
    from routes.ai import ai_bp
    from routes.admin import admin_bp
    from routes.claims import claims_bp
    from routes.chat import chat_bp
    from routes.notifications import notifications_bp
    from routes.requests import requests_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(donations_bp, url_prefix='/api/donations')
    app.register_blueprint(ngo_bp, url_prefix='/api/ngo')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(claims_bp, url_prefix='/api/claims')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(requests_bp, url_prefix='/api/requests')
    
    # Serve static uploaded files (Donation pictures & QR codes)
    @app.route('/uploads/<path:filename>')
    def serve_uploaded_file(filename):
        return send_from_directory(Config.UPLOAD_FOLDER, filename)
        
    @app.errorhandler(422)
    def handle_422(err):
        print(f"422 Error Occurred! Headers: {request.headers}")
        print(f"422 Error Data: {request.get_data()}")
        print(f"422 Error Exception: {err.description if hasattr(err, 'description') else str(err)}")
        return jsonify({"msg": "422 Unprocessable Entity logged"}), 422

        
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.datetime.utcnow().isoformat(),
            'database': app.config['SQLALCHEMY_DATABASE_URI'].split('://')[0]
        }), 200
        
    # Context processor/database auto-init for convenience
    with app.app_context():
        # Auto-create SQLite tables if they do not exist
        # This makes local verification completely zero-configuration for the developer!
        db.create_all()
        
        # Check if database is empty. If so, seed initial mock records
        if User.query.count() == 0:
            print("Database is empty. Populating with initial seed data...")
            seed_initial_data()
            
    return app

def seed_initial_data():
    # Admin User (password123)
    admin = User(
        username='admin_user', email='admin@foodshare.org',
        role='admin', latitude=12.971598, longitude=77.594562,
        address='Central Admin Center, Bengaluru, Karnataka', phone='+91 9999999999', status='active', is_email_verified=True
    )
    admin.set_password('password123')
    db.session.add(admin)
    
    # Donor Users
    donor1 = User(
        username='grand_hotel', email='donations@grandhotel.com',
        role='donor', latitude=12.9784, longitude=77.6408,
        address='Grand Hotel, Indiranagar, Bengaluru, Karnataka', phone='+91 9888888881', status='active', is_email_verified=True
    )
    donor1.set_password('password123')
    db.session.add(donor1)
    
    donor2 = User(
        username='supermart_fresh', email='waste_mgmt@freshmart.com',
        role='donor', latitude=12.9345, longitude=77.6101,
        address='FreshMart Supermarket, Koramangala, Bengaluru, Karnataka', phone='+91 9888888882', status='active', is_email_verified=True
    )
    donor2.set_password('password123')
    db.session.add(donor2)
    
    donor3 = User(
        username='anna_kitchen', email='annakitchen@gmail.com',
        role='donor', latitude=12.9698, longitude=77.7499,
        address='Anna Kitchen, Whitefield, Bengaluru, Karnataka', phone='+91 9888888883', status='active', is_email_verified=True
    )
    donor3.set_password('password123')
    db.session.add(donor3)
    
    # NGO Users
    ngo1 = User(
        username='feed_the_hungry', email='contact@feedhungry.org',
        role='ngo', latitude=12.9756, longitude=77.6012,
        address='Feed The Hungry NGO Office, MG Road, Bengaluru, Karnataka', phone='+91 9777777771', status='active', is_email_verified=True
    )
    ngo1.set_password('password123')
    db.session.add(ngo1)
    
    ngo2 = User(
        username='care_foundation', email='info@carefoundation.org',
        role='ngo', latitude=12.9279, longitude=77.6244,
        address='Care Foundation Shelter, HSR Layout, Bengaluru, Karnataka', phone='+91 9777777772', status='active', is_email_verified=True
    )
    ngo2.set_password('password123')
    db.session.add(ngo2)
    
    ngo3 = User(
        username='hope_kitchen_ngo', email='hopekitchen@ngo.org',
        role='ngo', latitude=12.9904, longitude=77.5312,
        address='Hope Kitchen, Rajajinagar, Bengaluru, Karnataka', phone='+91 9777777773', status='pending_approval', is_email_verified=True
    )
    ngo3.set_password('password123')
    db.session.add(ngo3)


    
    # Save Users
    db.session.commit()
    
    # NGO Profiles
    p1 = NgoProfile(
        user_id=ngo1.id, organization_name='Feed The Hungry India',
        registration_number='REG-102938475', tax_id='TAX-FEED-12345',
        capacity_people=250, preferred_food_types='cooked,bakery,produce,packaged,dry', verified=True, website='https://feedhungry.org'
    )
    db.session.add(p1)
    
    p2 = NgoProfile(
        user_id=ngo2.id, organization_name='Care Foundation Bengaluru',
        registration_number='REG-564738291', tax_id='TAX-CARE-98765',
        capacity_people=150, preferred_food_types='cooked,dairy,produce,dry', verified=True, website='https://carefoundation.org'
    )
    db.session.add(p2)
    
    p3 = NgoProfile(
        user_id=ngo3.id, organization_name='Hope Kitchen Foundation',
        registration_number='REG-839201948', tax_id='TAX-HOPE-45612',
        capacity_people=100, preferred_food_types='cooked,bakery,packaged', verified=False, website='https://hopekitchen.org'
    )
    db.session.add(p3)
    
    db.session.commit()

    
    # Seed Analytics snapshots
    now_date = datetime.date.today()
    for i in range(4):
        snap = AnalyticsSnapshot(
            date=now_date - datetime.timedelta(days=i+1),
            total_donations=20 - (i*4),
            total_waste_saved_kg=120.0 - (i*25.5),
            active_ngos=3,
            active_donors=3
        )
        db.session.add(snap)
        
    db.session.commit()
    print("Database seeding completed.")

app = create_app()

if __name__ == '__main__':
    # Running flask in production-ready mode (debug=False to prevent restart on uploads)
    app.run(host='0.0.0.0', port=5000, debug=False)

