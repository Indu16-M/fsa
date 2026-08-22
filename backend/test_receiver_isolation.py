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

print("=== RECEIVER ISOLATION TESTS ===\n")

# Test 1: Receiver OTP Login with Receiver account (receiver@sharebite.org)
print("TEST 1: Receiver OTP Login (receiver@sharebite.org)")
s1, d1 = post('/api/auth/login-role-email-otp-request', {'email': 'receiver@sharebite.org', 'role': 'receiver'})
otp1 = d1.get('dev_otp')
print(f"  Request Status: {s1} | dev_otp: {otp1}")
assert s1 == 200, f"Expected 200, got {s1}"

s1v, d1v = post('/api/auth/login-role-email-otp-verify', {'email': 'receiver@sharebite.org', 'role': 'receiver', 'otp_code': otp1})
db_role1 = d1v.get('user', {}).get('role')
print(f"  Verify Status : {s1v} | DB Role: {db_role1}")
assert s1v == 200, f"Expected 200, got {s1v}"
assert db_role1 == 'receiver', f"Expected 'receiver', got '{db_role1}'"
print("  PASS -> Opens Receiver Dashboard (/receiver/dashboard)\n")

# Test 2: Receiver Google Sign-In with Receiver account (receiver@sharebite.org)
print("TEST 2: Receiver Google Sign-In (receiver@sharebite.org)")
s2, d2 = post('/api/auth/google-login', {'email': 'receiver@sharebite.org', 'role': 'receiver'})
db_role2 = d2.get('user', {}).get('role')
print(f"  Google Login Status: {s2} | DB Role: {db_role2}")
assert s2 == 200, f"Expected 200, got {s2}"
assert db_role2 == 'receiver', f"Expected 'receiver', got '{db_role2}'"
print("  PASS -> Opens Receiver Dashboard (/receiver/dashboard)\n")

# Test 3: Donor email (indumedagam@gmail.com) on Receiver login card -> BLOCKED
print("TEST 3: Donor email (indumedagam@gmail.com) on Receiver login card -> Role Mismatch")
s3, d3 = post('/api/auth/login-role-email-otp-request', {'email': 'indumedagam@gmail.com', 'role': 'receiver'})
msg3 = d3.get('message', '')
print(f"  Status : {s3} | Message: {msg3}")
assert s3 == 403, f"Expected 403, got {s3}"
assert 'DONOR' in msg3 and 'RECEIVER' in msg3, f"Expected role mismatch message, got: {msg3}"
print("  PASS -> Blocked from cross-login\n")

print("=== ALL RECEIVER ISOLATION TESTS PASSED ===")
