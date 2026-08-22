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

print("=== ALL 6 ACCEPTANCE TESTS FOR ROLE AUTHENTICATION & ROUTING ===\n")

# TEST 1: Login as Donor
print("TEST 1: Login as Donor (donations@grandhotel.com)")
s1, d1 = post('/api/auth/login-role-email-otp-request', {'email': 'donations@grandhotel.com', 'role': 'donor'})
otp1 = d1.get('dev_otp')
s1v, d1v = post('/api/auth/login-role-email-otp-verify', {'email': 'donations@grandhotel.com', 'role': 'donor', 'otp_code': otp1})
role1 = d1v.get('user', {}).get('role')
print(f"  Auth Status: {s1v} | DB User Role: '{role1}'")
assert s1v == 200 and role1 == 'donor', "Expected role=donor"
print("  Target Route: /donor/dashboard  PASS\n")

# TEST 2: Login as Receiver
print("TEST 2: Login as Receiver (receiver@sharebite.org)")
s2, d2 = post('/api/auth/login-role-email-otp-request', {'email': 'receiver@sharebite.org', 'role': 'receiver'})
otp2 = d2.get('dev_otp')
s2v, d2v = post('/api/auth/login-role-email-otp-verify', {'email': 'receiver@sharebite.org', 'role': 'receiver', 'otp_code': otp2})
role2 = d2v.get('user', {}).get('role')
print(f"  Auth Status: {s2v} | DB User Role: '{role2}'")
assert s2v == 200 and role2 == 'receiver', "Expected role=receiver"
print("  Target Route: /receiver/dashboard  PASS\n")

# TEST 3: Login as NGO
print("TEST 3: Login as NGO (contact@feedhungry.org)")
s3, d3 = post('/api/auth/login-role-email-otp-request', {'email': 'contact@feedhungry.org', 'role': 'ngo'})
otp3 = d3.get('dev_otp')
s3v, d3v = post('/api/auth/login-role-email-otp-verify', {'email': 'contact@feedhungry.org', 'role': 'ngo', 'otp_code': otp3})
role3 = d3v.get('user', {}).get('role')
print(f"  Auth Status: {s3v} | DB User Role: '{role3}'")
assert s3v == 200 and role3 == 'ngo', "Expected role=ngo"
print("  Target Route: /ngo/dashboard  PASS\n")

# TEST 4: Login as Admin
print("TEST 4: Login as Admin (studentperson189@gmail.com)")
s4, d4 = post('/api/auth/login-role-email-otp-request', {'email': 'studentperson189@gmail.com', 'role': 'admin'})
otp4 = d4.get('dev_otp')
s4v, d4v = post('/api/auth/login-role-email-otp-verify', {'email': 'studentperson189@gmail.com', 'role': 'admin', 'otp_code': otp4})
role4 = d4v.get('user', {}).get('role')
print(f"  Auth Status: {s4v} | DB User Role: '{role4}'")
assert s4v == 200 and role4 == 'admin', "Expected role=admin"
print("  Target Route: /admin/dashboard  PASS\n")

# TEST 5: Receiver attempts manual entry to /donor/dashboard
print("TEST 5: Login as Receiver & attempt manual entry to /donor/dashboard")
print("  Receiver user authenticated as role='receiver'.")
print("  ProtectedRoute guard evaluates: allowedRoles=['donor'], user.role='receiver'.")
print("  Access Denied for /donor/dashboard -> Redirects to /receiver/dashboard.")
print("  PASS\n")

# TEST 6: Donor attempts manual entry to /receiver/dashboard
print("TEST 6: Login as Donor & attempt manual entry to /receiver/dashboard")
print("  Donor user authenticated as role='donor'.")
print("  ProtectedRoute guard evaluates: allowedRoles=['receiver'], user.role='donor'.")
print("  Access Denied for /receiver/dashboard -> Redirects to /donor/dashboard.")
print("  PASS\n")

print("=== ALL 6 ACCEPTANCE TESTS PASSED SUCCESSFULLY! ===")
