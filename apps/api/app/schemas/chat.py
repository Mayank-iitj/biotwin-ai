"""Chat schemas"""
from pydantic import BaseModel
from typing import List


class ChatSessionCreate(BaseModel):
    pass


class ChatSessionResponse(BaseModel):
    id: str
    user_id: str
    created_at: str

    class Config:
        from_attributes = True


class ChatMessageCreate(BaseModel):
    content: str


class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    created_at: str

    class Config:
        from_attributes = True