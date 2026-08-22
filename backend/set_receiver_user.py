import sqlite3

conn = sqlite3.connect('food_sharing.db')
cursor = conn.cursor()

email = 'indum2101.sse@saveetha.com'

# Check existing record
user = cursor.execute("SELECT id, username, email, role, status FROM users WHERE email=?", (email,)).fetchone()
print("Before update:", user)

if user:
    cursor.execute("UPDATE users SET role='receiver', status='active' WHERE email=?", (email,))
    conn.commit()
    print(f"[OK] Updated '{email}' role to RECEIVER")

# Check updated record
updated_user = cursor.execute("SELECT id, username, email, role, status FROM users WHERE email=?", (email,)).fetchone()
print("After update:", updated_user)

conn.close()
