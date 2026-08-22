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

email = 'indum2101.sse@saveetha.com'

print(f"=== TESTING RECEIVER LOGIN FOR {email} ===\n")

# Test OTP request
s1, d1 = post('/api/auth/login-role-email-otp-request', {'email': email, 'role': 'receiver'})
otp = d1.get('dev_otp')
print(f"OTP Request Status: {s1} | dev_otp: {otp}")
assert s1 == 200, f"Expected 200, got {s1}"

# Test OTP verify
s2, d2 = post('/api/auth/login-role-email-otp-verify', {'email': email, 'role': 'receiver', 'otp_code': otp})
role2 = d2.get('user', {}).get('role')
print(f"OTP Verify Status : {s2} | Role: {role2}")
assert s2 == 200, f"Expected 200, got {s2}"
assert role2 == 'receiver', f"Expected 'receiver', got '{role2}'"

# Test Google Sign-In
s3, d3 = post('/api/auth/google-login', {'email': email, 'role': 'receiver'})
role3 = d3.get('user', {}).get('role')
print(f"Google Login Status: {s3} | Role: {role3}")
assert s3 == 200, f"Expected 200, got {s3}"
assert role3 == 'receiver', f"Expected 'receiver', got '{role3}'"

print("\n=== ALL TESTS PASSED! RECEIVER LOGIN FOR indum2101.sse@saveetha.com IS WORKING PERFECTLY! ===")
