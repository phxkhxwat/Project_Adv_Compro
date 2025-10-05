from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import database
from typing import List

router = APIRouter(tags=["stock"])

# -----------------------------
# Pydantic Models
# -----------------------------
class StockCreate(BaseModel):
    name: str
    description: str
    price: float
    quantity: int

class StockOut(StockCreate):
    stock_id: int

# -----------------------------
# Endpoints
# -----------------------------

# Create stock item
@router.post("/", response_model=StockOut)
async def create_stock(stock: StockCreate):
    query = """
    INSERT INTO stock (name, description, price, quantity)
    VALUES (:name, :description, :price, :quantity)
    RETURNING stock_id, name, description, price, quantity
    """
    values = stock.dict()
    return await database.fetch_one(query=query, values=values)

# Get all stock items
@router.get("/", response_model=List[StockOut])
async def get_all_stock():
    query = "SELECT * FROM stock"
    return await database.fetch_all(query=query)

# Update stock item
@router.put("/{stock_id}", response_model=StockOut)
async def update_stock(stock_id: int, stock: StockCreate):
    query = """
    UPDATE stock
    SET name = :name, description = :description, price = :price, quantity = :quantity
    WHERE stock_id = :stock_id
    RETURNING stock_id, name, description, price, quantity
    """
    values = stock.dict()
    values["stock_id"] = stock_id
    result = await database.fetch_one(query=query, values=values)
    if not result:
        raise HTTPException(status_code=404, detail="Stock item not found")
    return result

# Delete stock item
@router.delete("/{stock_id}")
async def delete_stock(stock_id: int):
    query = "DELETE FROM stock WHERE stock_id = :stock_id RETURNING *"
    result = await database.fetch_one(query=query, values={"stock_id": stock_id})
    if not result:
        raise HTTPException(status_code=404, detail="Stock item not found")
    return {"message": "Stock item deleted successfully"}
