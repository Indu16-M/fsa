import sqlite3

conn = sqlite3.connect('food_sharing.db')
cursor = conn.cursor()
print("=== USERS TABLE SCHEMA ===")
for r in cursor.execute("SELECT sql FROM sqlite_master WHERE name='users'"):
    print(r[0])

print("\n=== INDEXES ON USERS ===")
for r in cursor.execute("SELECT name, sql FROM sqlite_master WHERE tbl_name='users'"):
    print(r)

print("\n=== USERS IN DATABASE ===")
for r in cursor.execute("SELECT id, username, email, role, status FROM users"):
    print(r)

conn.close()
