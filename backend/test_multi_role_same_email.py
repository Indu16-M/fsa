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

TEST_EMAIL = 'indumedagam@gmail.com'

print("=== VERIFYING SAME-EMAIL DONOR + RECEIVER MULTI-ROLE ACCEPTANCE TESTS ===\n")

# TEST 1: Donor OTP login / account setup for TEST_EMAIL
print(f"TEST 1: Login as DONOR using email ({TEST_EMAIL})")
s1_req, d1_req = post('/api/auth/login-role-email-otp-request', {'email': TEST_EMAIL, 'role': 'donor'})
print(f"  OTP Request Status: {s1_req} | dev_otp: {d1_req.get('dev_otp')}")
assert s1_req == 200, f"Expected 200, got {s1_req}"

otp1 = d1_req.get('dev_otp')
s1_v, d1_v = post('/api/auth/login-role-email-otp-verify', {'email': TEST_EMAIL, 'role': 'donor', 'otp_code': otp1})
role1 = d1_v.get('user', {}).get('role')
print(f"  Verify Status     : {s1_v} | DB Profile Role: '{role1}'")
assert s1_v == 200 and role1 == 'donor', f"Expected role=donor, got {role1}"
print("  Target Route: /donor/dashboard  PASS\n")

# TEST 2: Same email TEST_EMAIL logging in as RECEIVER (no role mismatch error!)
print(f"TEST 2: Login as RECEIVER using the SAME email ({TEST_EMAIL})")
s2_req, d2_req = post('/api/auth/login-role-email-otp-request', {'email': TEST_EMAIL, 'role': 'receiver'})
print(f"  OTP Request Status: {s2_req} | dev_otp: {d2_req.get('dev_otp')} | Message: {d2_req.get('message')}")
assert s2_req == 200, f"Expected 200 (NO role mismatch error!), got {s2_req}"

otp2 = d2_req.get('dev_otp')
s2_v, d2_v = post('/api/auth/login-role-email-otp-verify', {'email': TEST_EMAIL, 'role': 'receiver', 'otp_code': otp2})
role2 = d2_v.get('user', {}).get('role')
print(f"  Verify Status     : {s2_v} | DB Profile Role: '{role2}'")
assert s2_v == 200 and role2 == 'receiver', f"Expected role=receiver, got {role2}"
print("  Target Route: /receiver/dashboard  PASS\n")

# TEST 3: Login again as DONOR with same email
print(f"TEST 3: Login as DONOR with email ({TEST_EMAIL})")
s3_req, d3_req = post('/api/auth/login-role-email-otp-request', {'email': TEST_EMAIL, 'role': 'donor'})
otp3 = d3_req.get('dev_otp')
s3_v, d3_v = post('/api/auth/login-role-email-otp-verify', {'email': TEST_EMAIL, 'role': 'donor', 'otp_code': otp3})
role3 = d3_v.get('user', {}).get('role')
print(f"  Verify Status: {s3_v} | DB Profile Role: '{role3}'")
assert s3_v == 200 and role3 == 'donor', f"Expected role=donor, got {role3}"
print("  Target Route: /donor/dashboard  PASS\n")

# TEST 4: Login again as RECEIVER with same email
print(f"TEST 4: Login as RECEIVER with email ({TEST_EMAIL})")
s4_req, d4_req = post('/api/auth/login-role-email-otp-request', {'email': TEST_EMAIL, 'role': 'receiver'})
otp4 = d4_req.get('dev_otp')
s4_v, d4_v = post('/api/auth/login-role-email-otp-verify', {'email': TEST_EMAIL, 'role': 'receiver', 'otp_code': otp4})
role4 = d4_v.get('user', {}).get('role')
print(f"  Verify Status: {s4_v} | DB Profile Role: '{role4}'")
assert s4_v == 200 and role4 == 'receiver', f"Expected role=receiver, got {role4}"
print("  Target Route: /receiver/dashboard  PASS\n")

# TEST 5 & 6: Google Sign-In with same email for DONOR vs RECEIVER
print(f"TEST 7: Google Sign-In with SAME email ({TEST_EMAIL}) under RECEIVER card")
sG1, dG1 = post('/api/auth/google-login', {'email': TEST_EMAIL, 'role': 'receiver'})
roleG1 = dG1.get('user', {}).get('role')
print(f"  Google Receiver Status: {sG1} | DB Profile Role: '{roleG1}'")
assert sG1 == 200 and roleG1 == 'receiver', f"Expected role=receiver, got {roleG1}"

print(f"\nTEST 8: Google Sign-In with SAME email ({TEST_EMAIL}) under DONOR card")
sG2, dG2 = post('/api/auth/google-login', {'email': TEST_EMAIL, 'role': 'donor'})
roleG2 = dG2.get('user', {}).get('role')
print(f"  Google Donor Status   : {sG2} | DB Profile Role: '{roleG2}'")
assert sG2 == 200 and roleG2 == 'donor', f"Expected role=donor, got {roleG2}"

# TEST 10: NGO & Admin security checks
print("\nTEST 10: NGO & Admin security checks")
s_admin, d_admin = post('/api/auth/google-login', {'email': TEST_EMAIL, 'role': 'admin'})
print(f"  Unprivileged email on Admin card -> Status: {s_admin} | Message: {d_admin.get('message')}")
assert s_admin == 404, f"Expected 404, got {s_admin}"

print("\n=== ALL MULTI-ROLE SAME-EMAIL ACCEPTANCE TESTS PASSED 100%! ===")
