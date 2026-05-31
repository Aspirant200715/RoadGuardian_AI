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
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])
logger = logging.getLogger(__name__)

@router.get("/webhook")
async def whatsapp_webhook_health():
    """Health check endpoint for WhatsApp webhook."""
    logger.info("✅ WhatsApp webhook health check")
    return {
        "status": "ok",
        "message": "WhatsApp webhook is ready to receive messages"
    }

@router.post("/webhook")
async def twilio_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Receives incoming WhatsApp messages via Twilio Webhook.
    Automatically parses the message, identifies the hazard, registers a proxy user,
    and returns a TwiML XML response.
    """
    try:
        # Parse the form data from Twilio
        form_data = await request.form()
        logger.info(f"📱 Raw form data received: {dict(form_data)}")
        
        # Extract parameters - Twilio sends these fields
        From = form_data.get("From")
        Body = form_data.get("Body")
        Latitude = form_data.get("Latitude")
        Longitude = form_data.get("Longitude")
        MediaUrl0 = form_data.get("MediaUrl0")
        
        image_url = None
        if MediaUrl0:
            if hasattr(MediaUrl0, "filename"):
                import os, time, shutil
                orig_ext = os.path.splitext(MediaUrl0.filename)[1] or ".jpg"
                filename = f"wa_sim_{int(time.time())}{orig_ext}"
                filepath = os.path.join("uploads", filename)
                with open(filepath, "wb") as buffer:
                    shutil.copyfileobj(MediaUrl0.file, buffer)
                image_url = f"/uploads/{filename}"
            else:
                image_url = str(MediaUrl0)
        
        logger.info(f"📱 Parsed WhatsApp message - From: {From}, Body: {Body}")
        
        # Handle missing required fields
        if not From or not Body:
            logger.error(f"❌ Missing required fields: From={From}, Body={Body}")
            twiml = """<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>❌ Error: Missing required fields (From or Body)</Message>
</Response>"""
            return Response(content=twiml, media_type="application/xml")
        
        # Convert Latitude and Longitude to float if provided
        try:
            lat = float(Latitude) if Latitude else 13.0827
            lng = float(Longitude) if Longitude else 80.2707
        except (ValueError, TypeError):
            lat = 13.0827
            lng = 80.2707
        
        # 1. Lookup or create proxy user
        clean_from = From.replace("whatsapp:", "").replace("+", "")
        proxy_email = f"{clean_from}@whatsapp.roadguardian.gov"
        user_res = await db.execute(select(User).where(User.email == proxy_email))
        user = user_res.scalar_one_or_none()
        
        if not user:
            clean_phone = From.replace("whatsapp:", "").strip()
            # If the plus was decoded to a space by form parsing, fix it
            if clean_phone.startswith(" "):
                clean_phone = "+" + clean_phone[1:]
            elif not clean_phone.startswith("+"):
                clean_phone = "+" + clean_phone
                
            user = User(
                email=proxy_email,
                hashed_password="whatsapp_proxy_no_login",
                full_name=f"WhatsApp Citizen ({clean_phone})",
                role="citizen"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        logger.info(f"✅ User created/found: {proxy_email}")
        
        # 1.5 Handle help/menu commands
        body_lower = Body.lower().strip()
        help_keywords = ["help", "options", "option", "menu", "hi", "hello", "hey", "start"]
        
        # Match if exact match, or if it's a short message containing a keyword (e.g. 'can you help')
        is_help = body_lower in help_keywords or (
            len(body_lower) < 20 and any(k in body_lower for k in help_keywords)
        )
        
        if is_help:
            welcome_msg = (
                "🤖 Welcome to RoadGuardian AI!\n\n"
                "You can report civic issues and we'll route them to the right department. "
                "Here is what you can report:\n"
                "🛣️ *Road Issues*: potholes, cracks, debris, signs\n"
                "💧 *Water*: waterlogging, open manholes\n"
                "🌲 *Forestry*: fallen trees, branches\n"
                "⚡ *Power*: broken streetlights, live wires\n"
                "🚦 *Traffic*: broken signals\n"
                "🐾 *Animal Control*: roadkill\n\n"
                "Just type what you see to submit a report!"
            )
            import html
            twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{html.escape(welcome_msg)}</Message>
</Response>"""
            return Response(content=twiml, media_type="application/xml")
        
        # 2. Extract hazard context with expanded varieties
        hazard_mapping = {
            "pothole": ["pothole", "crater", "sinkhole", "hole"],
            "waterlogging": ["water", "flood", "drain", "logging", "puddle", "overflow"],
            "crack": ["crack", "fissure", "split"],
            "missing_signs": ["sign", "board", "signal missing"],
            "broken_dividers": ["divider", "barrier", "median", "guardrail"],
            "street_light_fault": ["light", "lamp", "dark", "streetlamp"],
            "manhole_defect": ["manhole", "sewer", "gutter", "drain cover"],
            "road_debris": ["debris", "trash", "garbage", "spill", "rocks"],
            "pavement_defect": ["pavement", "sidewalk", "footpath", "walkway"],
            "fallen_tree": ["tree", "branch", "wood", "log", "bush"],
            "electrical_hazard": ["wire", "power", "electric", "cable", "spark", "transformer"],
            "animal_carcass": ["animal", "carcass", "dead", "roadkill"],
            "traffic_signal_fault": ["traffic signal", "traffic light", "red light"],
            "construction_hazard": ["construction", "work zone", "cone", "excavation"]
        }

        hazard_type = "other"
        for h_type, keywords in hazard_mapping.items():
            if any(keyword in body_lower for keyword in keywords):
                hazard_type = h_type
                break

        logger.info(f"🔍 Detected hazard type: {hazard_type}")

        # 3. Create hazard
        hazard_data = {
            "hazard_type": hazard_type,
            "latitude": lat,
            "longitude": lng,
            "description": f"[WhatsApp Report] {Body}",
            "confidence_score": 0.85
        }

        new_hazard = await HazardService.create_hazard(
            db=db,
            user_id=user.id,
            data=hazard_data,
            image_url=image_url
        )
        
        # Override status to staging
        new_hazard.status = "whatsapp_staging"
        await db.commit()
        await db.refresh(new_hazard)
        
        logger.info(f"✅ Hazard created in staging: {new_hazard.id}")

        # 4. Broadcast via WebSockets
        hazard_resp = HazardResponse.model_validate(new_hazard)
        await manager.broadcast({
            "type": "new_hazard",
            "data": json.loads(hazard_resp.model_dump_json())
        })
        
        department_str = new_hazard.linked_department or "Municipal Corporation"
        message_text = f"✅ Thank you! Your {hazard_type} report has been received. Ticket ID: #{new_hazard.id}. Our AI has routed this to the {department_str}."
        logger.info(f"✅ WhatsApp response sent successfully")
        
    except Exception as e:
        logger.error(f"❌ Error processing WhatsApp message: {e}", exc_info=True)
        message_text = f"❌ Error: {str(e)[:80]}"

    import html
    escaped_message_text = html.escape(message_text)

    # 5. Return TwiML format response
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{escaped_message_text}</Message>
</Response>"""
    return Response(content=twiml, media_type="application/xml")

@router.get("/all")
async def get_all_whatsapp_messages(db: AsyncSession = Depends(get_db)):
    from app.models.hazard import Hazard
    from sqlalchemy.orm import selectinload
    stmt = (
        select(Hazard)
        .where(Hazard.description.like("[WhatsApp Report]%"))
        .options(selectinload(Hazard.user), selectinload(Hazard.resolved_by))
        .order_by(Hazard.created_at.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/promote/{hazard_id}")
async def promote_whatsapp_message(
    hazard_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    from app.models.hazard import Hazard
    from fastapi import HTTPException
    from sqlalchemy.orm import selectinload
    
    stmt = select(Hazard).where(Hazard.id == hazard_id).options(selectinload(Hazard.user), selectinload(Hazard.resolved_by))
    res = await db.execute(stmt)
    hazard = res.scalar_one_or_none()
    
    if not hazard:
        raise HTTPException(status_code=404, detail="Hazard not found")
        
    if hazard.status == "whatsapp_staging":
        hazard.status = "pending"
        # Assign ownership of the WhatsApp message to the person who promoted it
        if current_user:
            hazard.user_id = current_user.id
            # Award 50 points for submitting/promoting the report
            current_user.points = (current_user.points or 0) + 50
            
        await db.commit()
        await db.refresh(hazard)
        
        try:
            import json
            from app.utils.websocket import manager
            hazard_resp = HazardResponse.model_validate(hazard)
            await manager.broadcast({
                "type": "new_hazard",
                "data": json.loads(hazard_resp.model_dump_json())
            })
        except Exception as e:
            logger.warning(f"Failed to broadcast promoted hazard: {e}")
            
    return hazard
