import os
import sys
import unittest
import json
import datetime

# Inject backend directory into sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app import create_app, db
from models import User, FoodDonation, FoodClaim, NgoProfile, calculate_haversine_distance

class MapDeliveryTestCase(unittest.TestCase):
    """
    Test suite for Real-World Map Tracking, Haversine Distance/ETA calculations,
    Location Updates, Delivery Lifecycle, and OTP Verification Code workflows.
    """

    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['JWT_SECRET_KEY'] = 'test-secret-map-key-999'
        
        self.client = self.app.test_client()
        
        with self.app.app_context():
            db.drop_all()
            db.create_all()
            
            # Setup Donor (Koramangala, Bengaluru: 12.9352, 77.6245)
            self.donor = User(
                username='donor_swiggy',
                email='donor@swiggy.test',
                role='donor',
                latitude=12.9352,
                longitude=77.6245,
                address='Koramangala 5th Block, Bengaluru',
                phone='+91 9876543210',
                status='active'
            )
            self.donor.set_password('donorpass123')
            
            # Setup NGO (Indiranagar, Bengaluru: 12.9784, 77.6408)
            self.ngo = User(
                username='ngo_zomato',
                email='ngo@zomato.test',
                role='ngo',
                latitude=12.9784,
                longitude=77.6408,
                address='Indiranagar 100ft Road, Bengaluru',
                phone='+91 9123456789',
                status='active'
            )
            self.ngo.set_password('ngopass123')

            db.session.add(self.donor)
            db.session.add(self.ngo)
            db.session.commit()

            self.ngo_profile = NgoProfile(
                user_id=self.ngo.id,
                organization_name='Akshaya Care Foundation',
                registration_number='REG-BANGALORE-2026',
                capacity_people=250,
                preferred_food_types='cooked,dairy',
                verified=True
            )
            db.session.add(self.ngo_profile)
            db.session.commit()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.close_all_sessions()
            db.drop_all()

    def get_token(self, email, password, role):
        response = self.client.post('/api/auth/password-login', json={
            'email': email,
            'password': password,
            'role': role
        })
        data = json.loads(response.data.decode('utf-8'))
        return data.get('token')

    def test_haversine_distance_calculation(self):
        """1. Test Haversine formula calculation for exact physical distance"""
        # Koramangala (12.9352, 77.6245) to Indiranagar (12.9784, 77.6408) ~ 5.1 - 5.5 km
        dist = calculate_haversine_distance(12.9352, 77.6245, 12.9784, 77.6408)
        self.assertGreater(dist, 4.5)
        self.assertLess(dist, 6.5)

    def test_user_location_update_endpoint(self):
        """2. Test updating user pin location on map via /api/auth/location"""
        token = self.get_token('donor@swiggy.test', 'donorpass123', 'donor')
        headers = {'Authorization': f'Bearer {token}'}

        payload = {
            'latitude': 12.9250,
            'longitude': 77.5938,
            'address': 'Jayanagar 4th Block, Bengaluru'
        }
        res = self.client.patch('/api/auth/location', json=payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data.decode('utf-8'))
        self.assertEqual(data['user']['latitude'], 12.9250)
        self.assertEqual(data['user']['address'], 'Jayanagar 4th Block, Bengaluru')

    def test_food_claim_pickup_flow(self):
        """3. Test food claim pickup and OTP verification flow"""
        donor_token = self.get_token('donor@swiggy.test', 'donorpass123', 'donor')
        ngo_token = self.get_token('ngo@zomato.test', 'ngopass123', 'ngo')
        
        d_headers = {'Authorization': f'Bearer {donor_token}'}
        n_headers = {'Authorization': f'Bearer {ngo_token}'}

        # Step 1: Create food donation
        don_res = self.client.post('/api/donations', data={
            'title': 'Biryani Meal Surplus',
            'food_type': 'cooked',
            'quantity': '15',
            'storage_condition': 'refrigerated',
            'temperature_celsius': '5.0',
            'prep_time': datetime.datetime.utcnow().isoformat()
        }, headers=d_headers)
        self.assertEqual(don_res.status_code, 201)
        donation_id = json.loads(don_res.data.decode('utf-8'))['donation']['id']

        # Step 2: NGO claims the food
        claim_res = self.client.post(f'/api/claims/{donation_id}/claim', headers=n_headers)
        self.assertEqual(claim_res.status_code, 201)
        claim_data = json.loads(claim_res.data.decode('utf-8'))['claim']
        claim_id = claim_data['id']
        vcode = claim_data['verification_code']
        self.assertTrue(vcode.startswith('VRFY-'))

        # Step 3: Update status to ON_THE_WAY
        status_res = self.client.patch(f'/api/claims/{claim_id}/status', json={
            'status': 'ON_THE_WAY'
        }, headers=n_headers)
        self.assertEqual(status_res.status_code, 200)

        # Step 4: Complete claim with WRONG code -> 400 Failure
        fail_res = self.client.patch(f'/api/claims/{claim_id}/status', json={
            'status': 'FOOD_COLLECTED',
            'verification_code': 'WRONGCODE'
        }, headers=n_headers)
        self.assertEqual(fail_res.status_code, 400)

        # Step 5: Complete claim with CORRECT code -> 200 Success
        pass_res = self.client.patch(f'/api/claims/{claim_id}/status', json={
            'status': 'FOOD_COLLECTED',
            'verification_code': vcode
        }, headers=n_headers)
        self.assertEqual(pass_res.status_code, 200)

if __name__ == '__main__':
    unittest.main()
