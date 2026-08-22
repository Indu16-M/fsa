import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

# 1. Login/Register as a Receiver
email = "recv_test@example.com"
requests.post(f"{BASE_URL}/auth/login-role-email-otp-request", json={'email': email, 'role': 'receiver'})
time.sleep(1)

# We need the OTP from the backend task log or database. Let's just query SQLite directly.
import sqlite3
import os

db_path = os.path.abspath('food_sharing.db')
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Get the latest OTP
cur.execute("SELECT otp_code FROM otp_codes WHERE email=? ORDER BY created_at DESC LIMIT 1", (email,))
otp = cur.fetchone()[0]

# Verify OTP
res = requests.post(f"{BASE_URL}/auth/login-role-email-otp-verify", json={'email': email, 'otp': otp})
token = res.json()['token']
headers = {'Authorization': f'Bearer {token}'}

# 2. Fetch available donations
res = requests.get(f"{BASE_URL}/claims/available", headers=headers)
donations = res.json()
if not donations:
    print("No donations available to test. Need a donor donation first.")
else:
    target_donation = donations[0]
    donation_id = target_donation['id']
    
    # 3. Fetch single donation (should be masked)
    res = requests.get(f"{BASE_URL}/donations/{donation_id}", headers=headers)
    detail = res.json()
    print("MASKED DETAIL:", detail.get('donor_address'), detail.get('donor_latitude'), detail.get('donor_longitude'))
    assert detail.get('donor_address') == ''
    
    # 4. Claim the donation
    res = requests.post(f"{BASE_URL}/claims/{donation_id}/claim", headers=headers)
    print("CLAIM RESULT:", res.json())
    claim_id = res.json()['claim']['id']
    
    # 5. Fetch claim (should be unmasked)
    res = requests.get(f"{BASE_URL}/claims/{claim_id}", headers=headers)
    claim_detail = res.json()
    print("UNMASKED CLAIM:", claim_detail.get('donor_address'), claim_detail.get('donor_latitude'), claim_detail.get('donor_longitude'))
    assert claim_detail.get('donor_address') != ''
    
    print("SUCCESS! Verification complete.")
