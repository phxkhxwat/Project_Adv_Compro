from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import users , stock, order
from database import connect_db, disconnect_db

app = FastAPI()

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(stock.router, prefix="/api/stock", tags=["stock"])
app.include_router(order.router, prefix="/api/order", tags=["orders"])

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()
