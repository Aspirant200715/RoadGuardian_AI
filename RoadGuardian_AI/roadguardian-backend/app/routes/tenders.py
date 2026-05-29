import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.hazard import Hazard, ContractorBid
from app.schemas.hazard import HazardResponse
from app.schemas.tender import BidCreate, BidResponse, BidUpdateStatus

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/tenders",
    tags=["tenders"],
)

@router.get("", response_model=List[HazardResponse])
async def list_available_tenders(db: AsyncSession = Depends(get_db)):
    """List all critical hazards available for bidding."""
    try:
        # Fetch hazards that are 'pending' or 'verified' and have 'critical' urgency
        query = select(Hazard).where(
            (Hazard.urgency_level == "critical") & 
            (Hazard.status.in_(["pending", "verified"]))
        ).options(
            selectinload(Hazard.bids),
            selectinload(Hazard.user),
            selectinload(Hazard.resolved_by)
        )
        
        result = await db.execute(query)
        hazards = result.scalars().all()
        return hazards
    except Exception as e:
        logger.error(f"Error fetching tenders: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/{hazard_id}/bid", response_model=BidResponse, status_code=status.HTTP_201_CREATED)
async def submit_bid(
    hazard_id: int,
    bid: BidCreate,
    db: AsyncSession = Depends(get_db)
):
    """Submit a micro-bid for a specific hazard."""
    try:
        hazard_query = select(Hazard).where(Hazard.id == hazard_id)
        result = await db.execute(hazard_query)
        hazard = result.scalars().first()

        if not hazard:
            raise HTTPException(status_code=404, detail="Hazard not found")
        
        if hazard.status not in ["pending", "verified"]:
            raise HTTPException(status_code=400, detail="Hazard is no longer accepting bids")

        new_bid = ContractorBid(
            hazard_id=hazard_id,
            contractor_name=bid.contractor_name,
            bid_amount=bid.bid_amount,
            estimated_days=bid.estimated_days,
            status="pending"
        )
        
        db.add(new_bid)
        await db.commit()
        await db.refresh(new_bid)
        
        return new_bid
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting bid: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{hazard_id}/bids", response_model=List[BidResponse])
async def list_bids(
    hazard_id: int,
    db: AsyncSession = Depends(get_db)
):
    """List all bids for a specific hazard."""
    try:
        query = select(ContractorBid).where(ContractorBid.hazard_id == hazard_id)
        result = await db.execute(query)
        bids = result.scalars().all()
        return bids
    except Exception as e:
        logger.error(f"Error fetching bids: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/bids/{bid_id}/accept", response_model=BidResponse)
async def accept_bid(
    bid_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Accept a contractor bid and update the hazard status."""
    try:
        query = select(ContractorBid).where(ContractorBid.id == bid_id)
        result = await db.execute(query)
        bid = result.scalars().first()

        if not bid:
            raise HTTPException(status_code=404, detail="Bid not found")

        # Accept this bid
        bid.status = "accepted"
        
        # Update the associated hazard
        hazard_query = select(Hazard).where(Hazard.id == bid.hazard_id)
        h_result = await db.execute(hazard_query)
        hazard = h_result.scalars().first()
        
        if hazard:
            hazard.assigned_to = bid.contractor_name
            hazard.budget_estimate = bid.bid_amount
            # Reject all other bids for this hazard
            other_bids_query = select(ContractorBid).where(
                (ContractorBid.hazard_id == hazard.id) & 
                (ContractorBid.id != bid_id)
            )
            ob_result = await db.execute(other_bids_query)
            other_bids = ob_result.scalars().all()
            for ob in other_bids:
                ob.status = "rejected"
                
        await db.commit()
        await db.refresh(bid)
        
        return bid
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error accepting bid: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
