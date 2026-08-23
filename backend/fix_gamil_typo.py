import os
import sys

# Inject backend directory into sys.path
sys.path.append(os.path.dirname(__file__))

from app import create_app, db
from models import User

app = create_app()
with app.app_context():
    # Fetch all users whose email ends with @gamil.com
    users = User.query.filter(User.email.like('%@gamil.com')).all()
    if not users:
        print("No users found with '@gamil.com' email typo.")
        sys.exit(0)

    print(f"Found {len(users)} users with '@gamil.com' email typo:")
    for u in users:
        old_email = u.email
        new_email = old_email.replace('@gamil.com', '@gmail.com')
        
        # Check if new email already exists to prevent unique constraint failures
        exist = User.query.filter_by(email=new_email, role=u.role).first()
        if exist:
            print(f" - [SKIP] Cannot update {old_email} -> {new_email} because it already exists.")
            continue
            
        print(f" - [UPDATE] {old_email} -> {new_email}")
        u.email = new_email
        
        # Update username if it contains the typo email suffix
        if u.username == f"{old_email}_receiver":
            u.username = f"{new_email}_receiver"
        elif u.username == f"{old_email}_donor":
            u.username = f"{new_email}_donor"
            
        # Update profiles official email addresses if set
        if u.ngo_profile and u.ngo_profile.official_email == old_email:
            u.ngo_profile.official_email = new_email
        if u.donor_profile and u.donor_profile.email == old_email:
            u.donor_profile.email = new_email

    try:
        db.session.commit()
        print("[SUCCESS] Typo correction completed successfully.")
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Failed to update emails: {str(e)}")
