"""
ShareByte Admin Provisioning Script
====================================
Use this script to securely provision a real Admin account in your database/Supabase system.

Usage:
  py -3 backend/scripts/provision_admin.py <admin_email> [full_name]

Example:
  py -3 backend/scripts/provision_admin.py indumedagam@gmail.com "Indu Admin"
"""

import sys
import os

# Add parent backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from models import User

def provision_admin(email, full_name="System Administrator"):
    email = email.strip().lower()
    if not email or '@' not in email:
        print("❌ Error: Please provide a valid admin email address.")
        sys.exit(1)

    app = create_app()
    with app.app_context():
        existing = User.query.filter_by(email=email).first()
        if existing:
            print(f"ℹ️ User with email '{email}' already exists. Updating role to 'admin' and status to 'active'...")
            existing.role = 'admin'
            existing.status = 'active'
            existing.is_email_verified = True
            db.session.commit()
            print(f"✅ SUCCESS: Account '{email}' is now provisioned as ADMIN (active).")
        else:
            print(f"➕ Creating new provisioned ADMIN account for '{email}'...")
            new_admin = User(
                username=email,
                email=email,
                role='admin',
                status='active',
                is_email_verified=True,
                address='Central Admin Center'
            )
            new_admin.set_password('AdminSecureDefault123!')
            db.session.add(new_admin)
            db.session.commit()
            print(f"✅ SUCCESS: Provisioned ADMIN account created for '{email}'.")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("❌ Error: Missing admin email argument.")
        print("Usage: py -3 backend/scripts/provision_admin.py <admin_email> [full_name]")
        sys.exit(1)
        
    admin_email = sys.argv[1]
    name = sys.argv[2] if len(sys.argv) > 2 else "System Administrator"
    provision_admin(admin_email, name)
