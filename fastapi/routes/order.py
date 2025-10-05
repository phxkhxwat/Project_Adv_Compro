from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import database
from datetime import datetime
from typing import List

router = APIRouter(tags=["orders"])

# -----------------------------
# Pydantic Models
# -----------------------------
class OrderCreate(BaseModel):
    user_id: int
    address_id: int
    total_price: float

class OrderOut(OrderCreate):
    order_id: int
    created_at: datetime

# -----------------------------
# Endpoints
# -----------------------------

# Create order
@router.post("/", response_model=OrderOut)
async def create_order(order: OrderCreate):
    query = """
    INSERT INTO "order" (user_id, address_id, total_price, created_at)
    VALUES (:user_id, :address_id, :total_price, :created_at)
    RETURNING order_id, user_id, address_id, total_price, created_at
    """
    values = order.dict()
    values["created_at"] = datetime.utcnow()
    return await database.fetch_one(query=query, values=values)

# Get all orders for a user
@router.get("/user/{user_id}", response_model=List[OrderOut])
async def get_user_orders(user_id: int):
    query = "SELECT * FROM \"order\" WHERE user_id = :user_id"
    return await database.fetch_all(query=query, values={"user_id": user_id})

# Get single order
@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: int):
    query = "SELECT * FROM \"order\" WHERE order_id = :order_id"
    order = await database.fetch_one(query=query, values={"order_id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
