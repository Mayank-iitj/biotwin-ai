"""AI Health Coach router"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid
import json
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatSessionCreate, ChatSessionResponse, ChatMessageCreate, ChatMessageResponse
from app.routers.auth import get_current_user
from app.services.health_coach import HealthCoach

router = APIRouter()
coach = HealthCoach()


@router.post("/sessions", response_model=ChatSessionResponse)
async def create_session(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new chat session"""

    session = ChatSession(user_id=current_user.id)
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return session


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's chat sessions"""

    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
        .limit(20)
    )
    sessions = result.scalars().all()

    return sessions


@router.get("/sessions/{session_id}", response_model=List[ChatMessageResponse])
async def get_session_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get messages for a chat session"""

    # Verify session belongs to user
    session_result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == uuid.UUID(session_id),
            ChatSession.user_id == current_user.id
        )
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get messages
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == uuid.UUID(session_id))
        .order_by(ChatMessage.created_at.asc())
    )
    messages = result.scalars().all()

    return messages


@router.post("/sessions/{session_id}/messages")
async def send_message(
    session_id: str,
    message: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message to the AI Health Coach"""

    # Verify session belongs to user
    session_result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == uuid.UUID(session_id),
            ChatSession.user_id == current_user.id
        )
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Save user message
    user_message = ChatMessage(
        session_id=uuid.UUID(session_id),
        role="user",
        content=message.content
    )
    db.add(user_message)
    await db.commit()
    await db.refresh(user_message)

    # Get conversation history
    history_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == uuid.UUID(session_id))
        .order_by(ChatMessage.created_at.asc())
    )
    history = history_result.scalars().all()

    # Get user context (twin data)
    user_context = await get_user_context(current_user.id, db)

    # Stream response from coach
    async def generate():
        full_response = ""
        async for chunk in coach.stream_response(message.content, history, user_context):
            full_response += chunk
            yield f"data: {json.dumps({'content': chunk})}\n\n"

        # Save assistant message
        assistant_message = ChatMessage(
            session_id=uuid.UUID(session_id),
            role="assistant",
            content=full_response
        )
        db.add(assistant_message)
        await db.commit()

        yield f"data: {json.dumps({'done': True})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"}
    )


async def get_user_context(user_id: uuid.UUID, db: AsyncSession) -> dict:
    """Get user context for the coach"""

    # Get latest risk assessments
    from app.models.risk import RiskAssessment
    risk_result = await db.execute(
        select(RiskAssessment)
        .where(RiskAssessment.user_id == user_id)
        .order_by(RiskAssessment.assessed_at.desc())
    )
    risks = risk_result.scalars().all()

    # Get recommendations
    from app.models.recommendation import Recommendation
    rec_result = await db.execute(
        select(Recommendation)
        .where(Recommendation.user_id == user_id)
        .order_by(Recommendation.priority.desc())
        .limit(5)
    )
    recommendations = rec_result.scalars().all()

    return {
        "risk_assessments": [
            {
                "disease": r.disease,
                "score": float(r.risk_score),
                "band": r.risk_band
            }
            for r in risks[:5]
        ],
        "recommendations": [r.text for r in recommendations]
    }