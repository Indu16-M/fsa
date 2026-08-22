import os
import smtplib
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def generate_otp():
    """Generates a cryptographically secure 6-digit OTP string."""
    return f"{secrets.randbelow(900000) + 100000:06d}"


def send_otp_email(to_email, otp_code, purpose="Registration"):
    """
    Sends OTP via Gmail SMTP using credentials from .env.
    Falls back to console-only logging if SMTP credentials are not configured.
    """
    smtp_server   = os.environ.get("SMTP_SERVER",       "smtp.gmail.com")
    smtp_port     = int(os.environ.get("SMTP_PORT",     587))
    smtp_user     = os.environ.get("SMTP_USERNAME",     "").strip()
    smtp_password = os.environ.get("SMTP_PASSWORD",     "").strip()
    sender_email  = os.environ.get("SMTP_SENDER_EMAIL", smtp_user).strip()

    # ── Console log always (useful for dev) ──────────────────────────────────
    print(f"[OTP LOG] {purpose} OTP for {to_email}: {otp_code}")

    # ── No SMTP credentials → dev-mode fallback ──────────────────────────────
    if not smtp_user or not smtp_password:
        print("[OTP LOG] SMTP credentials not configured. OTP printed to console only.")
        return True, "Dev mode: OTP printed to console (configure SMTP to send real emails)"

    # ── Build email ───────────────────────────────────────────────────────────
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your {purpose} OTP — ShareBite"
    msg["From"]    = f"ShareBite <{sender_email}>"
    msg["To"]      = to_email

    plain_text = (
        f"Your OTP for {purpose} is: {otp_code}\n"
        f"This code is valid for 5 minutes.\n\n"
        f"If you did not request this, please ignore this email.\n\n"
        f"— ShareBite Team"
    )

    html_text = f"""
    <html>
      <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:30px;">
        <div style="max-width:500px;margin:auto;background:#fff;border-radius:12px;
                    padding:32px;box-shadow:0 2px 12px rgba(0,0,0,.08);">
          <h2 style="color:#16a34a;margin-top:0;">🍲 ShareBite</h2>
          <p style="font-size:15px;color:#333;">
            Your <strong>{purpose}</strong> verification code is:
          </p>
          <div style="text-align:center;margin:24px 0;">
            <span style="font-size:40px;font-weight:700;letter-spacing:10px;
                         color:#16a34a;background:#f0fdf4;padding:16px 28px;
                         border-radius:8px;display:inline-block;">{otp_code}</span>
          </div>
          <p style="color:#555;font-size:13px;">
            ⏱ Valid for <strong>5 minutes</strong>. Do not share this code with anyone.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">
            If you did not request this code, you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(html_text, "html"))

    # ── Send via SMTP ─────────────────────────────────────────────────────────
    try:
        with smtplib.SMTP(smtp_server, smtp_port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(smtp_user, smtp_password)
            server.sendmail(sender_email, to_email, msg.as_string())
        print(f"[OTP LOG] Email sent successfully to {to_email}")
        return True, "Email sent successfully"
    except smtplib.SMTPAuthenticationError:
        print("[OTP LOG] SMTP Authentication failed — check SMTP_USERNAME / SMTP_PASSWORD in .env")
        return False, "SMTP authentication failed. Please check your email credentials in the server configuration."
    except smtplib.SMTPException as e:
        print(f"[OTP LOG] SMTP error: {e}")
        return False, f"Email delivery failed: {str(e)}"
    except Exception as e:
        print(f"[OTP LOG] Unexpected email error: {e}")
        return False, f"Unexpected error sending email: {str(e)}"
