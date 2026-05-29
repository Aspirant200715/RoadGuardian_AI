import logging
import json
from fastapi import APIRouter, Depends, Form, Request, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.hazard import User
from app.services.hazard_service import HazardService
from app.utils.websocket import manager
from app.schemas.hazard import HazardResponse

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])
logger = logging.getLogger(__name__)

@router.post("/webhook")
async def twilio_webhook(
    From: str = Form(...),
    Body: str = Form(""),
    Latitude: float = Form(None),
    Longitude: float = Form(None),
    MediaUrl0: str = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Receives incoming WhatsApp messages via Twilio Webhook.
    Automatically parses the message, identifies the hazard, registers a proxy user,
    and returns a TwiML XML response.
    """
    # 1. Lookup or create proxy user
    proxy_email = f"{From.replace('+', '')}@whatsapp.roadguardian.gov"
    user_res = await db.execute(select(User).where(User.email == proxy_email))
    user = user_res.scalar_one_or_none()
    
    if not user:
        user = User(
            email=proxy_email,
            hashed_password="whatsapp_proxy",
            full_name=f"WhatsApp Citizen ({From})",
            role="citizen"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # 2. Extract hazard context
    body_lower = Body.lower()
    hazard_type = "other"
    if "pothole" in body_lower:
        hazard_type = "pothole"
    elif "water" in body_lower or "flood" in body_lower:
        hazard_type = "waterlogging"
    elif "crack" in body_lower:
        hazard_type = "crack"
    elif "sign" in body_lower:
        hazard_type = "missing_signs"
    elif "divider" in body_lower or "barrier" in body_lower:
        hazard_type = "broken_dividers"

    # Default location if not provided (demo fallback to Central Station Road, Chennai)
    lat = Latitude if Latitude is not None else 13.0827
    lng = Longitude if Longitude is not None else 80.2707

    # 3. Create hazard
    hazard_data = {
        "hazard_type": hazard_type,
        "latitude": lat,
        "longitude": lng,
        "description": f"[WhatsApp Report] {Body}",
        "confidence_score": 0.85
    }

    try:
        new_hazard = await HazardService.create_hazard(
            db=db,
            user_id=user.id,
            data=hazard_data,
            image_url=MediaUrl0  # Twilio CDN URL
        )

        # 4. Broadcast via WebSockets
        hazard_resp = HazardResponse.model_validate(new_hazard)
        await manager.broadcast({
            "type": "new_hazard",
            "data": json.loads(hazard_resp.model_dump_json())
        })
        
        department_str = new_hazard.linked_department or "Municipal Corporation"
        message_text = f"✅ Thank you! Your road hazard report has been received. Ticket ID: #{new_hazard.id}. Our AI has routed this to the {department_str}."
    except Exception as e:
        logger.error(f"WhatsApp processing error: {e}")
        message_text = "❌ Sorry, we encountered an error processing your report. Please try again later."

    # 5. Return TwiML format response
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{message_text}</Message>
</Response>"""
    return Response(content=twiml, media_type="application/xml")
