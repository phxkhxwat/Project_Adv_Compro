from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, constr
from datetime import datetime
from database import database , insert_address, get_address , update_address
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
# Address Models
# -----------------------------
class AddressCreate(BaseModel):
    user_id: int
    street: str
    city: str
    postal_code: str
    country: str

class AddressOut(AddressCreate):
    id: int


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

# -----------------------------
# Address Endpoints
# -----------------------------

# Add new address
@router.post("/address/", response_model=AddressOut)
async def add_address(address: AddressCreate):
    try:
        return await insert_address(
            user_id=address.user_id,
            street=address.street,
            city=address.city,
            postal_code=address.postal_code,
            country=address.country,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get addresses for a user
@router.get("/address/{user_id}", response_model=list[AddressOut])
async def get_user_address(user_id: int):
    try:
        return await get_address(user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# Update existing address
@router.put("/address/{user_id}", response_model=AddressOut)
async def update_user_address(user_id: int, address: AddressCreate):
    existing = await get_address(user_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Address not found")
    address_id = existing[0]["id"]  # take the first address
    return await update_address(
        id=address_id,
        street=address.street,
        city=address.city,
        postal_code=address.postal_code,
        country=address.country
    )
