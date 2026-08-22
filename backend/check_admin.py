import sqlite3

conn = sqlite3.connect('food_sharing.db')

print("=== ALL USERS ===")
rows = conn.execute('SELECT id, username, email, role, status, is_email_verified FROM users ORDER BY role').fetchall()
for r in rows:
    print(f"  id={r[0]} | role={r[3]} | status={r[4]} | verified={r[5]} | email={r[2]}")

print("\n=== ADMIN ACCOUNTS ===")
admins = conn.execute("SELECT id, username, email, role, status, is_email_verified FROM users WHERE role='admin'").fetchall()
for r in admins:
    print(f"  id={r[0]} | username={r[1]} | email={r[2]} | role={r[3]} | status={r[4]} | verified={r[5]}")
if not admins:
    print("  *** NO ADMIN ACCOUNTS FOUND ***")

conn.close()
