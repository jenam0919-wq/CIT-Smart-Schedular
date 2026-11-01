import uuid
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.user import TokenData
from backend.app.services.firebase_auth_service import verify_firebase_id_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Handle demo simple hashes or bcrypt
    if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
        try:
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception:
            try:
                return pwd_context.verify(plain_password, hashed_password)
            except Exception:
                return False
    return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    try:
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    except Exception:
        return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    email: Optional[str] = None
    role_from_token: Optional[str] = None

    # 1. Attempt local backend HMAC JWT verification
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        role_from_token = payload.get("role")
    except JWTError:
        # 2. Attempt Firebase ID token verification
        try:
            firebase_claims = verify_firebase_id_token(token)
            email = firebase_claims.get("email")
        except Exception:
            raise credentials_exception

    if not email:
        raise credentials_exception

    # Match user against authoritative database to prevent client role tampering
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        # If user was verified by Firebase but doesn't exist in local DB yet,
        # register with least-privileged STUDENT role (preserves security integrity)
        user = User(
            id=f"usr-{uuid.uuid4().hex[:8]}",
            email=email,
            name=email.split("@")[0].replace(".", " ").title(),
            role="STUDENT",
            hashed_password=get_password_hash(uuid.uuid4().hex),
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user

def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if email:
            return db.query(User).filter(User.email == email).first()
    except JWTError:
        try:
            firebase_claims = verify_firebase_id_token(token)
            email = firebase_claims.get("email")
            if email:
                return db.query(User).filter(User.email == email).first()
        except Exception:
            return None
    return None


def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role.upper()
        allowed = [r.upper() for r in allowed_roles]
        if user_role not in allowed and user_role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role: {current_user.role}. Required: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker
