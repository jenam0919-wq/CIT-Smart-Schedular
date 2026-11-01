import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.chat import ChatConversation, ChatMessage
from backend.app.schemas.chat import (
    ChatConversationCreate,
    ChatConversationUpdate,
    ChatConversationResponse,
    ChatConversationDetailResponse,
    ChatMessageCreate,
    ChatMessageResponse,
    AIChatRequest,
    AIChatResponse,
)
from backend.app.utils.security import get_current_user
from backend.app.services.gemini_service import generate_gemini_response

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.get("/conversations", response_model=List[ChatConversationResponse])
def get_user_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all chat conversations belonging to the authenticated user.
    """
    convs = (
        db.query(ChatConversation)
        .filter(ChatConversation.user_id == current_user.id)
        .order_by(ChatConversation.updated_at.desc())
        .all()
    )

    results = []
    for c in convs:
        last_msg = (
            db.query(ChatMessage)
            .filter(ChatMessage.conversation_id == c.id)
            .order_by(ChatMessage.created_at.desc())
            .first()
        )
        msg_count = db.query(ChatMessage).filter(ChatMessage.conversation_id == c.id).count()

        results.append(
            ChatConversationResponse(
                id=c.id,
                user_id=c.user_id,
                title=c.title,
                created_at=c.created_at,
                updated_at=c.updated_at,
                message_count=msg_count,
                last_message=last_msg.content[:80] if last_msg else None,
            )
        )
    return results


@router.post("/conversations", response_model=ChatConversationResponse)
def create_conversation(
    conv_in: ChatConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Start a new isolated chat conversation session.
    """
    new_conv = ChatConversation(
        id=f"conv-{uuid.uuid4().hex[:10]}",
        user_id=current_user.id,
        title=conv_in.title or "New Schedule Inquiry",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(new_conv)
    db.commit()
    db.refresh(new_conv)

    return ChatConversationResponse(
        id=new_conv.id,
        user_id=new_conv.user_id,
        title=new_conv.title,
        created_at=new_conv.created_at,
        updated_at=new_conv.updated_at,
        message_count=0,
        last_message=None,
    )


@router.get("/conversations/{conversation_id}", response_model=ChatConversationDetailResponse)
def get_conversation_details(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve conversation messages history with ownership check.
    """
    conv = db.query(ChatConversation).filter(ChatConversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Enforce isolation: only owner or admin can view
    if conv.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Unauthorized access to conversation")

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conv.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return ChatConversationDetailResponse(
        id=conv.id,
        user_id=conv.user_id,
        title=conv.title,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=[
            ChatMessageResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                role=m.role,
                content=m.content,
                created_at=m.created_at,
            )
            for m in messages
        ],
    )


@router.put("/conversations/{conversation_id}", response_model=ChatConversationResponse)
def rename_conversation(
    conversation_id: str,
    update_in: ChatConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Rename conversation title with ownership verification.
    """
    conv = db.query(ChatConversation).filter(ChatConversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conv.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Unauthorized to rename conversation")

    conv.title = update_in.title.strip()
    conv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conv)

    msg_count = db.query(ChatMessage).filter(ChatMessage.conversation_id == conv.id).count()
    return ChatConversationResponse(
        id=conv.id,
        user_id=conv.user_id,
        title=conv.title,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        message_count=msg_count,
        last_message=None,
    )


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a conversation and all its messages.
    """
    conv = db.query(ChatConversation).filter(ChatConversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conv.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Unauthorized to delete conversation")

    db.delete(conv)
    db.commit()
    return {"status": "success", "message": "Conversation deleted successfully"}


@router.post("/chat", response_model=AIChatResponse)
def post_chat_message(
    chat_req: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Interactive AI query endpoint connecting user to live Google Gemini engine.
    Persists history and grounds responses in real database records.
    """
    conv_id = chat_req.conversation_id

    # If conversation_id not supplied, locate or create one
    if not conv_id:
        # Title generated from first 35 chars of prompt
        title = chat_req.message.strip()[:40]
        if len(chat_req.message.strip()) > 40:
            title += "..."

        conv = ChatConversation(
            id=f"conv-{uuid.uuid4().hex[:10]}",
            user_id=current_user.id,
            title=title,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)
        conv_id = conv.id
    else:
        conv = db.query(ChatConversation).filter(ChatConversation.id == conv_id).first()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if conv.user_id != current_user.id and current_user.role != "ADMIN":
            raise HTTPException(status_code=403, detail="Unauthorized access to conversation")

    # 1. Save user message to database
    user_msg = ChatMessage(
        id=f"msg-{uuid.uuid4().hex[:10]}",
        conversation_id=conv_id,
        role="user",
        content=chat_req.message.strip(),
        created_at=datetime.utcnow(),
    )
    db.add(user_msg)
    db.commit()

    # 2. Retrieve recent message history for contextual continuity
    history_records = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conv_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    formatted_history = [{"role": m.role, "content": m.content} for m in history_records[:-1]]

    # 3. Generate response via real Gemini service with database grounding
    ai_result = generate_gemini_response(
        db=db,
        user=current_user,
        user_prompt=chat_req.message.strip(),
        conversation_history=formatted_history,
    )

    # 4. Save assistant response to database
    assistant_msg = ChatMessage(
        id=f"msg-{uuid.uuid4().hex[:10]}",
        conversation_id=conv_id,
        role="assistant",
        content=ai_result["response"],
        created_at=datetime.utcnow(),
    )
    db.add(assistant_msg)

    # Update conversation timestamp
    conv.updated_at = datetime.utcnow()
    db.commit()

    return AIChatResponse(
        response=ai_result["response"],
        conversation_id=conv_id,
        message_id=assistant_msg.id,
        model_used=ai_result["model_used"],
        status=ai_result["status"],
        grounded_entities_count=ai_result.get("grounded_entities_count"),
    )

