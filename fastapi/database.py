from databases import Database

POSTGRES_USER = "temp"
POSTGRES_PASSWORD = "temp"
POSTGRES_DB = "drone"
POSTGRES_HOST = "db"

DATABASE_URL = f'postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}/{POSTGRES_DB}'

database = Database(DATABASE_URL)

async def connect_db():
    await database.connect()
    print("Database connected")

async def disconnect_db():
    await database.disconnect()
    print("Database disconnected")


# -----------------------------
# Users CRUD
# -----------------------------
async def insert_user(username: str, password_hash: str, email: str):
    query = """
    INSERT INTO users (username, password_hash, email)
    VALUES (:username, :password_hash, :email)
    RETURNING user_id, username, password_hash, email, created_at
    """
    values = {"username": username, "password_hash": password_hash, "email": email}
    return await database.fetch_one(query=query, values=values)

async def get_user(user_id: int):
    query = "SELECT * FROM users WHERE user_id = :user_id"
    return await database.fetch_one(query=query, values={"user_id": user_id})

async def update_user(user_id: int, username: str, password_hash: str, email: str):
    query = """
    UPDATE users 
    SET username = :username, password_hash = :password_hash, email = :email
    WHERE user_id = :user_id
    RETURNING user_id, username, password_hash, email, created_at
    """
    values = {"user_id": user_id, "username": username, "password_hash": password_hash, "email": email}
    return await database.fetch_one(query=query, values=values)

async def delete_user(user_id: int):
    query = "DELETE FROM users WHERE user_id = :user_id RETURNING *"
    return await database.fetch_one(query=query, values={"user_id": user_id})


# -----------------------------
# Address CRUD
# -----------------------------
async def insert_address(user_id: int, street: str, city: str, postal_code: str, country: str):
    query = """
    INSERT INTO address (user_id, street, city, postal_code, country)
    VALUES (:user_id, :street, :city, :postal_code, :country)
    RETURNING id, user_id, street, city, postal_code, country
    """
    values = {
        "user_id": user_id,
        "street": street,
        "city": city,
        "postal_code": postal_code,
        "country": country,
    }
    return await database.fetch_one(query=query, values=values)

async def get_address(user_id: int):
    query = "SELECT * FROM address WHERE user_id = :user_id"
    return await database.fetch_all(query=query, values={"user_id": user_id})

async def update_address(id: int, street: str, city: str, postal_code: str, country: str):
    query = """
    UPDATE address
    SET street=:street, city=:city, postal_code=:postal_code, country=:country
    WHERE id=:id
    RETURNING id, user_id, street, city, postal_code, country
    """
    values = {"id": id, "street": street, "city": city, "postal_code": postal_code, "country": country}
    return await database.fetch_one(query=query, values=values)

async def delete_address(id: int):
    query = "DELETE FROM address WHERE id=:id RETURNING *"
    return await database.fetch_one(query=query, values={"id": id})


# -----------------------------
# Stock CRUD
# -----------------------------
async def insert_stock(name: str, description: str, price: float, quantity: int):
    query = """
    INSERT INTO stock (name, description, price, quantity)
    VALUES (:name, :description, :price, :quantity)
    RETURNING stock_id, name, description, price, quantity
    """
    values = {"name": name, "description": description, "price": price, "quantity": quantity}
    return await database.fetch_one(query=query, values=values)

async def get_stock(stock_id: int):
    query = "SELECT * FROM stock WHERE stock_id = :stock_id"
    return await database.fetch_one(query=query, values={"stock_id": stock_id})

async def update_stock(stock_id: int, name: str, description: str, price: float, quantity: int):
    query = """
    UPDATE stock
    SET name=:name, description=:description, price=:price, quantity=:quantity
    WHERE stock_id=:stock_id
    RETURNING stock_id, name, description, price, quantity
    """
    values = {"stock_id": stock_id, "name": name, "description": description, "price": price, "quantity": quantity}
    return await database.fetch_one(query=query, values=values)

async def delete_stock(stock_id: int):
    query = "DELETE FROM stock WHERE stock_id=:stock_id RETURNING *"
    return await database.fetch_one(query=query, values={"stock_id": stock_id})


# -----------------------------
# Order CRUD
# -----------------------------
async def insert_order(user_id: int, address_id: int, total_price: float):
    query = """
    INSERT INTO "order" (user_id, address_id, total_price, created_at)
    VALUES (:user_id, :address_id, :total_price, NOW())
    RETURNING order_id, user_id, address_id, total_price, created_at
    """
    values = {"user_id": user_id, "address_id": address_id, "total_price": total_price}
    return await database.fetch_one(query=query, values=values)

async def get_order(order_id: int):
    query = 'SELECT * FROM "order" WHERE order_id = :order_id'
    return await database.fetch_one(query=query, values={"order_id": order_id})

async def update_order(order_id: int, total_price: float):
    query = """
    UPDATE "order"
    SET total_price=:total_price
    WHERE order_id=:order_id
    RETURNING order_id, user_id, address_id, total_price, created_at
    """
    values = {"order_id": order_id, "total_price": total_price}
    return await database.fetch_one(query=query, values=values)

async def delete_order(order_id: int):
    query = 'DELETE FROM "order" WHERE order_id=:order_id RETURNING *'
    return await database.fetch_one(query=query, values={"order_id": order_id})

# -----------------------------
# Feedback CRUD
# -----------------------------
async def insert_feedback(user_id: int, rating: int, comment: str = None):
    query = """
    INSERT INTO feedback (user_id, rating, comment)
    VALUES (:user_id, :rating, :comment)
    RETURNING feedback_id, user_id, rating, comment, created_at
    """
    values = {"user_id": user_id, "rating": rating, "comment": comment}
    row = await database.fetch_one(query=query, values=values)
    return row  # fetch_one already returns the inserted row

async def get_feedback(feedback_id: int):
    query = "SELECT * FROM feedback WHERE feedback_id = :feedback_id"
    return await database.fetch_one(query=query, values={"feedback_id": feedback_id})

async def get_all_feedback():
    query = """
    SELECT 
        f.feedback_id, 
        f.user_id, 
        f.rating, 
        f.comment, 
        f.created_at,
        u.name 
    FROM feedback f
    LEFT JOIN users u ON f.user_id = u.user_id
    ORDER BY f.created_at DESC
    """
    return await database.fetch_all(query=query)


async def update_feedback(feedback_id: int, rating: int, comment: str = None):
    query = """
    UPDATE feedback
    SET rating=:rating, comment=:comment
    WHERE feedback_id=:feedback_id
    RETURNING feedback_id, user_id, rating, comment, created_at
    """
    values = {"feedback_id": feedback_id, "rating": rating, "comment": comment}
    return await database.fetch_one(query=query, values=values)

async def delete_feedback(feedback_id: int):
    query = "DELETE FROM feedback WHERE feedback_id=:feedback_id RETURNING *"
    return await database.fetch_one(query=query, values={"feedback_id": feedback_id})
