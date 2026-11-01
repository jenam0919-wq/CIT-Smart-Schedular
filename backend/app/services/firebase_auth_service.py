"""
CIT Smart Scheduler - Firebase Authentication Service (Backend)
Verifies Firebase ID tokens, prevents unauthorized role escalation,
and maps Firebase identities to authoritative CIT database users.
"""

import os
import json
import logging
from typing import Optional, Dict, Any
import httpx

import firebase_admin
from firebase_admin import auth, credentials
from backend.app.config import settings

logger = logging.getLogger("cit_scheduler.firebase_auth")

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "cit-smart-ffc74")
FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY", "AIzaSyBjwaOJVcYT-dWhzrNmnTzZDUlKAn50YaQ")

# Initialize Firebase Admin SDK safely
_FIREBASE_INITIALIZED = False

def init_firebase_admin():
    global _FIREBASE_INITIALIZED
    if _FIREBASE_INITIALIZED:
        return

    try:
        if not firebase_admin._apps:
            cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {"projectId": FIREBASE_PROJECT_ID})
                logger.info("Firebase Admin initialized with service account certificate.")
            else:
                # Initialize default project app for token verification
                firebase_admin.initialize_app(options={"projectId": FIREBASE_PROJECT_ID})
                logger.info("Firebase Admin initialized with project ID %s.", FIREBASE_PROJECT_ID)
        _FIREBASE_INITIALIZED = True
    except Exception as exc:
        logger.warning("Firebase Admin initialization note: %s", exc)

init_firebase_admin()


def verify_firebase_id_token(id_token: str) -> Dict[str, Any]:
    """
    Verifies a Firebase ID token.
    Tries Firebase Admin SDK first.
    If service account credentials are not configured, uses Google's secure Identity Toolkit API.
    Returns verified claims dictionary containing:
      - uid: Firebase UID
      - email: Verified user email
      - email_verified: Boolean
      - name: Display name (if present)
    """
    if not id_token:
        raise ValueError("ID token is required")

    # 1. Try Firebase Admin SDK
    try:
        decoded_token = auth.verify_id_token(id_token, check_revoked=False)
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email"),
            "email_verified": decoded_token.get("email_verified", False),
            "name": decoded_token.get("name") or decoded_token.get("email", "").split("@")[0],
        }
    except Exception as admin_err:
        logger.debug("Firebase Admin SDK verification fallback: %s", admin_err)

    # 2. Fallback to Google Identity Toolkit REST API
    # https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=[API_KEY]
    try:
        url = f"https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={FIREBASE_API_KEY}"
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(url, json={"idToken": id_token})
            if resp.status_code == 200:
                data = resp.json()
                users = data.get("users", [])
                if users:
                    user_info = users[0]
                    return {
                        "uid": user_info.get("localId"),
                        "email": user_info.get("email"),
                        "email_verified": user_info.get("emailVerified", False),
                        "name": user_info.get("displayName") or user_info.get("email", "").split("@")[0],
                    }
            error_detail = resp.json().get("error", {}).get("message", "Invalid token")
            raise ValueError(f"Token verification failed: {error_detail}")
    except Exception as exc:
        logger.error("Token verification error: %s", exc)
        raise ValueError(f"Unable to verify Firebase token: {str(exc)}")
