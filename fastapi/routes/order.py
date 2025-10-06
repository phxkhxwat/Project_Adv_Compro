from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import database
from datetime import datetime
from typing import List
import json

router = APIRouter(tags=["orders"])

# -----------------------------
# Pydantic Models
# -----------------------------
class OrderItem(BaseModel):
    stock_id: int
    quantity: int
    price: float  # price per item

class OrderCreate(BaseModel):
    user_id: int
    address_id: int
    total_price: float
    items: List[OrderItem]

class OrderOut(OrderCreate):
    order_id: int
    created_at: datetime


# -----------------------------
# Endpoints
# -----------------------------
@router.post("/", response_model=OrderOut)
async def create_order(order: OrderCreate):
    # 1. Validate all stock items exist and have enough quantity
    for item in order.items:
        stock = await database.fetch_one(
            "SELECT quantity FROM stock WHERE stock_id = :id",
            {"id": item.stock_id},
        )
        if not stock:
            raise HTTPException(
                status_code=404, detail=f"Stock ID {item.stock_id} not found"
            )
        if stock["quantity"] < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for stock_id {item.stock_id}",
            )

    # 2. Deduct stock quantities
    for item in order.items:
        await database.execute(
            "UPDATE stock SET quantity = quantity - :qty WHERE stock_id = :id",
            {"qty": item.quantity, "id": item.stock_id},
        )

    # 3. Create order (items as JSON)
    query = """
    INSERT INTO orders (user_id, address_id, total_price, items, created_at)
    VALUES (:user_id, :address_id, :total_price, :items, :created_at)
    RETURNING order_id, user_id, address_id, total_price, items, created_at
    """

    values = {
        "user_id": order.user_id,
        "address_id": order.address_id,
        "total_price": order.total_price,
        "items": json.dumps([item.dict() for item in order.items]),
        "created_at": datetime.utcnow(),
    }

    try:
        new_order = await database.fetch_one(query=query, values=values)
        if new_order:
            new_order = dict(new_order)
            new_order["items"] = json.loads(new_order["items"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return new_order


# Get all orders for a specific user
@router.get("/user/{user_id}", response_model=List[OrderOut])
async def get_user_orders(user_id: int):
    query = "SELECT * FROM orders WHERE user_id = :user_id ORDER BY created_at DESC"
    orders = await database.fetch_all(query=query, values={"user_id": user_id})

    orders_list = []
    for order in orders:
        order_dict = dict(order)
        order_dict["items"] = json.loads(order_dict["items"])
        orders_list.append(order_dict)

    return orders_list


# Get a single order by ID
@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: int):
    query = "SELECT * FROM orders WHERE order_id = :order_id"
    order = await database.fetch_one(query=query, values={"order_id": order_id})

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order_dict = dict(order)
    order_dict["items"] = json.loads(order_dict["items"])

    return order_dict