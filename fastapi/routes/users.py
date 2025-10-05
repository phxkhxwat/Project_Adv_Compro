from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, constr
from datetime import datetime
from database import database
import hashlib
import re

router = APIRouter(tags=["users"])

# -----------------------------
# Helpers
# -----------------------------
def hash_password(password: str) -> str:
    """Hash password using SHA256 (demo only)."""
    return hashlib.sha256(password.encode()).hexdigest()

def validate_password(password: str):
    """Password must be at least 10 chars and contain a number."""
    if len(password) < 10:
        raise HTTPException(status_code=400, detail="Password must be at least 10 characters")
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Password must contain at least one number")
    return True

# -----------------------------
# Pydantic Models
# -----------------------------
class UserCreate(BaseModel):
    email: EmailStr
    password: constr(min_length=10)

class UserOut(BaseModel):
    user_id: int
    email: EmailStr
    created_at: datetime

# -----------------------------
# Endpoints
# -----------------------------

# Register
@router.post("/register/", response_model=UserOut)
async def register(user: UserCreate):
    validate_password(user.password)
    hashed = hash_password(user.password)
    query = """
        INSERT INTO users (email, password_hash, created_at)
        VALUES (:email, :password_hash, :created_at)
        RETURNING user_id, email, created_at
    """
    values = {"email": user.email, "password_hash": hashed, "created_at": datetime.utcnow()}
    try:
        result = await database.fetch_one(query, values)
        return result
    except Exception:
        raise HTTPException(status_code=400, detail="User already exists or invalid input")

# Login
@router.post("/login/")
async def login(user: UserCreate):
    query = "SELECT user_id, email, password_hash, created_at FROM users WHERE email = :email"
    db_user = await database.fetch_one(query, {"email": user.email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if db_user["password_hash"] != hash_password(user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"message": "Login successful", "email": db_user["email"], "user_id": db_user["user_id"]}
