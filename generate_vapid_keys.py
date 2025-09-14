# Moved from backend/generate_vapid_keys.py for single-root backend deployment
# (See original history in backend/ directory prior to cleanup.)

"""Utility script to generate VAPID keys for Web Push (P-256 / EC keys).

Usage:
  python generate_vapid_keys.py

Output keys are already Base64URL (no padding) in the format expected by Web Push
and can be directly placed in your .env file:
  VAPID_PUBLIC_KEY=...
  VAPID_PRIVATE_KEY=...
  VAPID_SUBJECT=mailto:you@example.com

Do NOT commit the real .env containing these secrets.
"""

import base64
from cryptography.hazmat.primitives.asymmetric import ec


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def generate_vapid_keypair():
    """Generate a VAPID (P-256) key pair returning (public_key_b64url, private_key_b64url).

    public key format per RFC8292: uncompressed EC point (0x04 || X || Y) then Base64URL.
    private key: 32 raw bytes Base64URL.
    """
    private_key = ec.generate_private_key(ec.SECP256R1())  # P-256
    private_int = private_key.private_numbers().private_value
    private_bytes = private_int.to_bytes(32, "big")

    public_numbers = private_key.public_key().public_numbers()
    x = public_numbers.x.to_bytes(32, "big")
    y = public_numbers.y.to_bytes(32, "big")
    uncompressed = b"\x04" + x + y

    return _b64url(uncompressed), _b64url(private_bytes)


def main():
    public_key, private_key = generate_vapid_keypair()
    print("\nVAPID PUBLIC KEY:\n" + public_key)
    print("\nVAPID PRIVATE KEY:\n" + private_key)
    print("\nExample .env additions:")
    print("VAPID_PUBLIC_KEY=" + public_key)
    print("VAPID_PRIVATE_KEY=" + private_key)
    print("VAPID_SUBJECT=mailto:you@example.com")
    print("\nAdd these to your deployment environment variables (Netlify / Heroku / etc.)")


if __name__ == "__main__":
    main()
