import urllib.request, json

BASE = 'http://localhost:5000'

def google_post(email, role):
    req = urllib.request.Request(
        f'{BASE}/api/auth/google-login',
        data=json.dumps({'email': email, 'role': role}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

print("=== GOOGLE AUTHENTICATION ACCEPTANCE TESTS ===\n")

# Test 1: Admin Google Sign-In with registered Admin email
print("TEST 1: Admin Google Sign-In (studentperson189@gmail.com)")
st1, d1 = google_post('studentperson189@gmail.com', 'admin')
print(f"  Status: {st1} | Role: {d1.get('user', {}).get('role')}")
assert st1 == 200, f"Expected 200, got {st1}"
assert d1.get('user', {}).get('role') == 'admin', "Expected role=admin"
print("  PASS\n")

# Test 2: Admin Google Sign-In with admin@foodshare.org
print("TEST 2: Admin Google Sign-In (admin@foodshare.org)")
st2, d2 = google_post('admin@foodshare.org', 'admin')
print(f"  Status: {st2} | Role: {d2.get('user', {}).get('role')}")
assert st2 == 200, f"Expected 200, got {st2}"
assert d2.get('user', {}).get('role') == 'admin', "Expected role=admin"
print("  PASS\n")

# Test 3: Donor Google Sign-In (donations@grandhotel.com)
print("TEST 3: Donor Google Sign-In (donations@grandhotel.com)")
st3, d3 = google_post('donations@grandhotel.com', 'donor')
print(f"  Status: {st3} | Role: {d3.get('user', {}).get('role')}")
assert st3 == 200, f"Expected 200, got {st3}"
assert d3.get('user', {}).get('role') == 'donor', "Expected role=donor"
print("  PASS\n")

# Test 4: NGO Google Sign-In (contact@feedhungry.org)
print("TEST 4: NGO Google Sign-In (contact@feedhungry.org)")
st4, d4 = google_post('contact@feedhungry.org', 'ngo')
print(f"  Status: {st4} | Role: {d4.get('user', {}).get('role')}")
assert st4 == 200, f"Expected 200, got {st4}"
assert d4.get('user', {}).get('role') == 'ngo', "Expected role=ngo"
print("  PASS\n")

# Test 5: Donor Google account tried on Admin login (Access Denied)
print("TEST 5: Donor Google account tried on Admin login card -> Access Denied")
st5, d5 = google_post('donations@grandhotel.com', 'admin')
msg5 = d5.get('message', '')
print(f"  Status: {st5} | Message: {msg5}")
assert st5 == 403, f"Expected 403, got {st5}"
assert 'Access denied' in msg5 or 'not authorized' in msg5, f"Expected Access Denied message, got: {msg5}"
print("  PASS\n")

# Test 6: Unregistered Google account on Admin login card
print("TEST 6: Unregistered Google account on Admin login card")
st6, d6 = google_post('unregistered_admin@gmail.com', 'admin')
msg6 = d6.get('message', '')
print(f"  Status: {st6} | Message: {msg6}")
assert st6 == 404, f"Expected 404, got {st6}"
assert 'not registered as an authorized ShareByte Admin' in msg6, f"Got: {msg6}"
print("  PASS\n")

# Test 7: Unregistered Google account on Donor/NGO/Receiver login card
print("TEST 7: Unregistered Google account on Donor login card")
st7, d7 = google_post('unregistered_user@gmail.com', 'donor')
msg7 = d7.get('message', '')
print(f"  Status: {st7} | Message: {msg7}")
assert st7 == 404, f"Expected 404, got {st7}"
assert 'not registered with ShareByte' in msg7, f"Got: {msg7}"
print("  PASS\n")

print("=== ALL 7 GOOGLE AUTHENTICATION TESTS PASSED ===")
