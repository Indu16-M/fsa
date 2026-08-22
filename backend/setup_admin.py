"""
ShareByte Admin Account Seed / Setup Script
============================================
Run this script from the backend/ directory to create or reset admin accounts with a password.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import User
import datetime

ADMIN_ACCOUNTS = [
    {"email": "admin@foodshare.org", "username": "admin_user", "password": "admin123"},
    {"email": "studentperson189@gmail.com", "username": "studentperson189", "password": "admin123"}
]

def setup_admin():
    with app.app_context():
        for acct in ADMIN_ACCOUNTS:
            email = acct["email"]
            username = acct["username"]
            pwd = acct["password"]
            existing = User.query.filter_by(email=email, role='admin').first()

            if existing:
                existing.status = 'active'
                existing.is_email_verified = True
                existing.set_password(pwd)
                print(f"[OK] Admin account '{email}' updated with password.")
            else:
                admin = User(
                    username=username,
                    email=email,
                    role='admin',
                    status='active',
                    is_email_verified=True,
                    created_at=datetime.datetime.utcnow(),
                )
                admin.set_password(pwd)
                db.session.add(admin)
                print(f"[OK] Admin account '{email}' created with password.")
        
        db.session.commit()
        print("\nAll admin accounts configured successfully.")
        return True


if __name__ == "__main__":
    success = setup_admin()
    sys.exit(0 if success else 1)
