"""Utility script to generate VAPID keys for Web Push.

Usage:
  python generate_vapid_keys.py

Copy the printed PUBLIC and PRIVATE keys into your .env file:
  VAPID_PUBLIC_KEY=...
  VAPID_PRIVATE_KEY=...
  VAPID_SUBJECT=mailto:you@example.com

Never commit the real keys to git. The committed .env.example is only a template.
"""

try:
    from py_vapid import Vapid
except ImportError:
    print("py_vapid not installed. Install dependencies first: pip install -r requirements.txt")
    raise SystemExit(1)

def main():
    v = Vapid()
    v.generate_keys()
    print("\nVAPID PUBLIC KEY:\n" + v.public_key.decode())
    print("\nVAPID PRIVATE KEY:\n" + v.private_key.decode())
    print("\nExample .env additions:\nVAPID_PUBLIC_KEY=" + v.public_key.decode())
    print("VAPID_PRIVATE_KEY=" + v.private_key.decode())
    print("VAPID_SUBJECT=mailto:you@example.com")
    print("\nAdd these to your deployment environment variables (Netlify / Render / Railway / etc.)")

if __name__ == "__main__":
    main()
