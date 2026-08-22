import sqlite3

conn = sqlite3.connect('food_sharing.db')
print("=== INDUMEDAGAM USER ===")
row = conn.execute("SELECT id, username, email, role, status FROM users WHERE email='indumedagam@gmail.com'").fetchone()
print(row)

print("\n=== ALL RECEIVER USERS ===")
receivers = conn.execute("SELECT id, username, email, role, status FROM users WHERE role='receiver'").fetchall()
for r in receivers:
    print(r)
if not receivers:
    print("(NO RECEIVER ACCOUNTS FOUND IN DB)")

print("\n=== ALL USERS ===")
users = conn.execute("SELECT id, username, email, role, status FROM users").fetchall()
for u in users:
    print(u)

conn.close()
