from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class BidCreate(BaseModel):
    contractor_name: str
    bid_amount: float
    estimated_days: int

class BidResponse(BaseModel):
    id: int
    hazard_id: int
    contractor_name: str
    bid_amount: float
    estimated_days: int
    status: str
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BidUpdateStatus(BaseModel):
    status: str # "accepted" or "rejected"
