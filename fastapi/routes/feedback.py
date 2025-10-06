from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from database import insert_feedback, get_feedback, get_all_feedback, update_feedback, delete_feedback

# router = APIRouter(
#     prefix="/feedback",
#     tags=["Feedback"]
# )


router = APIRouter(tags=["feedback"])

# -----------------------------
# Pydantic Schemas
# -----------------------------
class FeedbackCreate(BaseModel):
    user_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None

class FeedbackUpdate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = None

# -----------------------------
# Routes
# -----------------------------

# Create feedback
@router.post("/", response_model=dict)
async def create_feedback(feedback: FeedbackCreate):
    result = await insert_feedback(feedback.user_id, feedback.rating, feedback.comment)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to insert feedback")
    return dict(result)

@router.get("/", response_model=list[dict])
async def read_all_feedback():
    result = await get_all_feedback()
    return [dict(r) for r in result]

@router.get("/{feedback_id}", response_model=dict)
async def read_feedback(feedback_id: int):
    result = await get_feedback(feedback_id)
    if not result:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return dict(result)

@router.put("/{feedback_id}", response_model=dict)
async def edit_feedback(feedback_id: int, feedback: FeedbackUpdate):
    result = await update_feedback(feedback_id, feedback.rating, feedback.comment)
    if not result:
        raise HTTPException(status_code=404, detail="Feedback not found or update failed")
    return dict(result)

@router.delete("/{feedback_id}", response_model=dict)
async def remove_feedback(feedback_id: int):
    result = await delete_feedback(feedback_id)
    if not result:
        raise HTTPException(status_code=404, detail="Feedback not found or delete failed")
    return dict(result)