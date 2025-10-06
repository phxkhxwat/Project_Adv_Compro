from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import users , stock, order , feedback
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
app.include_router(stock.router, prefix="/stock", tags=["stock"])
app.include_router(order.router, prefix="/order", tags=["orders"])
app.include_router(feedback.router, prefix="/feedback", tags=["feedback"])


@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()
