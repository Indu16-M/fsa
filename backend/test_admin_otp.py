import urllib.request, json

BASE = 'http://localhost:5000'

# Test admin OTP request
req = urllib.request.Request(
    f'{BASE}/api/auth/login-role-email-otp-request',
    data=json.dumps({'email': 'admin@foodshare.org', 'role': 'admin'}).encode(),
    headers={'Content-Type': 'application/json'}
)
try:
    with urllib.request.urlopen(req) as r:
        d = json.loads(r.read().decode())
        print('STATUS: 200')
        print('Response:', json.dumps(d, indent=2))
except urllib.error.HTTPError as e:
    body = json.loads(e.read().decode())
    print(f'STATUS: {e.code}')
    print('Error:', json.dumps(body, indent=2))
