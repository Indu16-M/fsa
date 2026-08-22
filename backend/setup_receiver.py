import sqlite3
import datetime

conn = sqlite3.connect('food_sharing.db')

RECEIVER_ACCOUNTS = [
    {"email": "receiver@sharebite.org", "username": "receiver_community"},
    {"email": "receiver_demo@gmail.com", "username": "receiver_demo"}
]

for acct in RECEIVER_ACCOUNTS:
    email = acct["email"]
    username = acct["username"]
    existing = conn.execute("SELECT id, role FROM users WHERE email=?", (email,)).fetchone()
    if existing:
        conn.execute("UPDATE users SET role='receiver', status='active' WHERE email=?", (email,))
        print(f"[OK] Updated existing user '{email}' to role=receiver")
    else:
        conn.execute(
            "INSERT INTO users (username, email, role, status, is_email_verified, password_hash, created_at) VALUES (?,?,?,?,?,?,?)",
            (username, email, 'receiver', 'active', 1, 'NOPASSWORD_OTP_ONLY', datetime.datetime.utcnow().isoformat())
        )
        print(f"[OK] Created Receiver account: '{email}'")

conn.commit()
conn.close()
print("\nReceiver accounts set up successfully!")
