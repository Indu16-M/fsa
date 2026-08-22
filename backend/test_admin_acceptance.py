import urllib.request, json

BASE = 'http://localhost:5000'

def post(url, body):
    req = urllib.request.Request(
        f'{BASE}{url}',
        data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

print("=== ADMIN LOGIN ACCEPTANCE TESTS ===\n")

# Test 1a: Admin OTP request (admin@foodshare.org)
print("TEST 1a: Admin OTP request for admin@foodshare.org")
status, data = post('/api/auth/login-role-email-otp-request', {'email': 'admin@foodshare.org', 'role': 'admin'})
otp = data.get('dev_otp')
print(f"  Status : {status}")
print(f"  dev_otp: {otp}")
assert status == 200, f"Expected 200, got {status}"
assert otp is not None, "dev_otp missing"
print("  PASS\n")

# Test 1b: Admin OTP request (studentperson189@gmail.com)
print("TEST 1b: Admin OTP request for studentperson189@gmail.com")
status_b, data_b = post('/api/auth/login-role-email-otp-request', {'email': 'studentperson189@gmail.com', 'role': 'admin'})
otp_b = data_b.get('dev_otp')
print(f"  Status : {status_b}")
print(f"  dev_otp: {otp_b}")
assert status_b == 200, f"Expected 200, got {status_b}"
assert otp_b is not None, "dev_otp missing"
print("  PASS\n")

# Test 2: Admin OTP verification for studentperson189@gmail.com
print("TEST 2: Admin OTP verify for studentperson189@gmail.com")
status2, data2 = post('/api/auth/login-role-email-otp-verify', {'email': 'studentperson189@gmail.com', 'role': 'admin', 'otp_code': otp_b})
db_role = data2.get('user', {}).get('role')
print(f"  Status : {status2}")
print(f"  DB role: {db_role}")
assert status2 == 200, f"Expected 200, got {status2}"
assert db_role == 'admin', f"Expected 'admin', got '{db_role}'"
print("  PASS\n")

# Test 3: Donor email tried with Admin role - mismatch error
print("TEST 3: Donor email tried with Admin role - mismatch error")
status3, data3 = post('/api/auth/login-role-email-otp-request', {'email': 'donations@grandhotel.com', 'role': 'admin'})
msg3 = data3.get('message', '')
print(f"  Status : {status3}")
print(f"  Message: {msg3}")
assert status3 == 403, f"Expected 403, got {status3}"
assert 'DONOR' in msg3.upper() or 'mismatch' in msg3.lower(), f"Expected role mismatch message, got: {msg3}"
print("  PASS\n")

# Test 4: Unknown email on Admin login - specific admin error
print("TEST 4: Unknown email on Admin login - specific admin error")
status4, data4 = post('/api/auth/login-role-email-otp-request', {'email': 'unregistered_person@gmail.com', 'role': 'admin'})
msg4 = data4.get('message', '')
print(f"  Status : {status4}")
print(f"  Message: {msg4}")
assert status4 == 404, f"Expected 404, got {status4}"
assert 'sign up' not in msg4.lower(), f"Should NOT say sign up for admin! Got: {msg4}"
assert 'admin' in msg4.lower(), f"Should mention Admin. Got: {msg4}"
print("  PASS\n")

print("=== ALL ADMIN TESTS PASSED ===")
