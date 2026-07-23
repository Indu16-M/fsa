import os
import sys
import unittest
import json
import datetime

# Inject backend directory into sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app import create_app, db
from models import User, FoodDonation, DonationRequest, Delivery, NgoProfile, calculate_haversine_distance

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

    def get_token(self, username, password):
        response = self.client.post('/api/auth/login', json={
            'username': username,
            'password': password
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
        token = self.get_token('donor_swiggy', 'donorpass123')
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

    def test_full_donation_request_and_delivery_lifecycle(self):
        """3. Test end-to-end request -> approval -> delivery creation with OTP verification code"""
        donor_token = self.get_token('donor_swiggy', 'donorpass123')
        ngo_token = self.get_token('ngo_zomato', 'ngopass123')
        
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

        # Step 2: NGO requests food
        req_res = self.client.post('/api/ngo/requests', json={'donation_id': donation_id}, headers=n_headers)
        self.assertEqual(req_res.status_code, 201)
        request_id = json.loads(req_res.data.decode('utf-8'))['request']['id']

        # Step 3: Donor approves request -> triggers Delivery object creation
        appr_res = self.client.post(f'/api/ngo/requests/{request_id}/approve', headers=d_headers)
        self.assertEqual(appr_res.status_code, 200)
        deliv_data = json.loads(appr_res.data.decode('utf-8'))['delivery']
        
        self.assertEqual(deliv_data['tracking_status'], 'assigned')
        self.assertTrue(deliv_data['verification_code'].startswith('VRFY-'))
        self.assertIn('distance_km', deliv_data)
        self.assertIn('eta_minutes', deliv_data)

    def test_live_delivery_location_tracking_update(self):
        """4. Test live driver coordinate updates on tracking map"""
        donor_token = self.get_token('donor_swiggy', 'donorpass123')
        ngo_token = self.get_token('ngo_zomato', 'ngopass123')
        d_headers = {'Authorization': f'Bearer {donor_token}'}
        n_headers = {'Authorization': f'Bearer {ngo_token}'}

        # Create & approve delivery
        don_res = self.client.post('/api/donations', data={
            'title': 'Paneer Curry Bowls',
            'food_type': 'cooked',
            'quantity': '20',
            'storage_condition': 'refrigerated',
            'temperature_celsius': '4.0',
            'prep_time': datetime.datetime.utcnow().isoformat()
        }, headers=d_headers)
        don_id = json.loads(don_res.data.decode('utf-8'))['donation']['id']

        req_res = self.client.post('/api/ngo/requests', json={'donation_id': don_id}, headers=n_headers)
        req_id = json.loads(req_res.data.decode('utf-8'))['request']['id']

        appr_res = self.client.post(f'/api/ngo/requests/{req_id}/approve', headers=d_headers)
        delivery_id = json.loads(appr_res.data.decode('utf-8'))['delivery']['id']

        # Update live driver location coordinates (midway)
        midway_lat = 12.9550
        midway_lon = 77.6320
        loc_res = self.client.patch(f'/api/ngo/deliveries/{delivery_id}/location', json={
            'latitude': midway_lat,
            'longitude': midway_lon
        }, headers=n_headers)

        self.assertEqual(loc_res.status_code, 200)
        updated_deliv = json.loads(loc_res.data.decode('utf-8'))['delivery']
        self.assertEqual(updated_deliv['current_latitude'], midway_lat)
        self.assertEqual(updated_deliv['current_longitude'], midway_lon)

    def test_verification_code_delivery_completion(self):
        """5. Test delivery completion requires correct OTP verification code"""
        donor_token = self.get_token('donor_swiggy', 'donorpass123')
        ngo_token = self.get_token('ngo_zomato', 'ngopass123')
        d_headers = {'Authorization': f'Bearer {donor_token}'}
        n_headers = {'Authorization': f'Bearer {ngo_token}'}

        # Create & approve delivery
        don_res = self.client.post('/api/donations', data={
            'title': 'Rice Bowls Batch',
            'food_type': 'cooked',
            'quantity': '30',
            'storage_condition': 'ambient',
            'temperature_celsius': '22.0',
            'prep_time': datetime.datetime.utcnow().isoformat()
        }, headers=d_headers)
        don_id = json.loads(don_res.data.decode('utf-8'))['donation']['id']

        req_res = self.client.post('/api/ngo/requests', json={'donation_id': don_id}, headers=n_headers)
        req_id = json.loads(req_res.data.decode('utf-8'))['request']['id']

        appr_res = self.client.post(f'/api/ngo/requests/{req_id}/approve', headers=d_headers)
        deliv = json.loads(appr_res.data.decode('utf-8'))['delivery']
        deliv_id = deliv['id']
        vcode = deliv['verification_code']

        # Attempt completing delivery with WRONG code -> 400 Failure
        fail_res = self.client.patch(f'/api/ngo/deliveries/{deliv_id}', json={
            'tracking_status': 'delivered',
            'verification_code': 'WRONG-1234'
        }, headers=n_headers)
        self.assertEqual(fail_res.status_code, 400)

        # Attempt completing delivery with CORRECT code -> 200 Success
        pass_res = self.client.patch(f'/api/ngo/deliveries/{deliv_id}', json={
            'tracking_status': 'delivered',
            'verification_code': vcode
        }, headers=n_headers)
        self.assertEqual(pass_res.status_code, 200)
        completed_deliv = json.loads(pass_res.data.decode('utf-8'))['delivery']
        self.assertEqual(completed_deliv['tracking_status'], 'delivered')

if __name__ == '__main__':
    unittest.main()
