from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000, description="User prompt text")

class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatConversationCreate(BaseModel):
    title: Optional[str] = Field("New Schedule Inquiry", max_length=150)

class ChatConversationUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)

class ChatConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    last_message: Optional[str] = None

    class Config:
        from_attributes = True

class ChatConversationDetailResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True

class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_id: Optional[str] = None

class AIChatResponse(BaseModel):
    response: str
    conversation_id: str
    message_id: str
    model_used: str
    status: str = "success"
    grounded_entities_count: Optional[Dict[str, int]] = None

