import sqlite3

conn = sqlite3.connect('food_sharing.db')
cursor = conn.cursor()

print("=== MIGRATING USERS TABLE SCHEMA TO (email, role) UNIQUE CONSTRAINT ===")

# Create new table without single UNIQUE(email) and UNIQUE(username)
cursor.execute("DROP TABLE IF EXISTS users_new;")
cursor.execute("""
CREATE TABLE users_new (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
    username VARCHAR(100) NOT NULL, 
    email VARCHAR(150) NOT NULL, 
    password_hash VARCHAR(255) NOT NULL, 
    role VARCHAR(20) NOT NULL, 
    latitude FLOAT DEFAULT 0.0, 
    longitude FLOAT DEFAULT 0.0, 
    address VARCHAR(255) DEFAULT '', 
    phone VARCHAR(20) DEFAULT '', 
    status VARCHAR(20) DEFAULT 'active', 
    is_email_verified BOOLEAN DEFAULT 0, 
    created_at DATETIME,
    CONSTRAINT _email_role_uc UNIQUE (email, role),
    CONSTRAINT _username_role_uc UNIQUE (username, role)
);
""")

# Copy data from users to users_new
cursor.execute("""
INSERT INTO users_new (id, username, email, password_hash, role, latitude, longitude, address, phone, status, is_email_verified, created_at)
SELECT id, username, email, password_hash, role, latitude, longitude, address, phone, status, is_email_verified, created_at FROM users;
""")

# Drop old table and rename users_new to users
cursor.execute("DROP TABLE users;")
cursor.execute("ALTER TABLE users_new RENAME TO users;")

conn.commit()
print("[OK] Migration complete! Table 'users' now supports (email, role) multi-profile co-existence!")

# Print current users
print("\nCurrent Users:")
for r in cursor.execute("SELECT id, email, role, status FROM users"):
    print(r)

conn.close()
