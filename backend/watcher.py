import sqlite3, time, os
brain_path = 'C:/Users/medagam INDU/.gemini/antigravity-ide/brain/7d33f1aa-d202-487a-bce3-74dd87f14e7f/browser/latest_otp.txt'
os.makedirs(os.path.dirname(brain_path), exist_ok=True)
while True:
    try:
        conn = sqlite3.connect('food_sharing.db')
        row = conn.execute(\"SELECT otp_code FROM otp_codes WHERE email='crossrole1@example.com' ORDER BY created_at DESC LIMIT 1\").fetchone()
        if row:
            with open(brain_path, 'w') as f:
                f.write(str(row[0]))
        conn.close()
    except Exception as e:
        pass
    time.sleep(1)
