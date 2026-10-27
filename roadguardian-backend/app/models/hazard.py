from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False, default="")
    full_name = Column(String(100), nullable=True)
    role = Column(String(50), nullable=False, default="citizen")
    points = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    hazards = relationship("Hazard", back_populates="user", foreign_keys="Hazard.user_id", lazy="selectin")
    badges = relationship("GamificationBadge", back_populates="user", lazy="selectin")


class GamificationBadge(Base):
    __tablename__ = "gamification_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    badge_name = Column(String(100), nullable=False)
    points_awarded = Column(Integer, default=0)
    description = Column(String(255), nullable=True)
    earned_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="badges", lazy="selectin")


class Hazard(Base):
    __tablename__ = "hazards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    hazard_type = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    severity_score = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    urgency_level = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    image_url = Column(String(255), nullable=True)
    description = Column(String(1000), nullable=True)
    location_address = Column(String(255), nullable=True)
    traffic_density = Column(String(50), nullable=True)
    weather = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    assigned_to = Column(String(100), nullable=True)
    assigned_at = Column(DateTime, nullable=True)
    resolved_image_url = Column(String(255), nullable=True)
    resolution_notes = Column(String(1000), nullable=True)
    resolved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    sla_deadline = Column(DateTime, nullable=True)
    sla_breached = Column(Boolean, default=False)
    linked_department = Column(String(100), nullable=True)
    department_ticket_id = Column(String(100), nullable=True)
    budget_estimate = Column(Float, nullable=True)

    user = relationship("User", back_populates="hazards", foreign_keys=[user_id], lazy="selectin")
    resolved_by = relationship("User", foreign_keys=[resolved_by_id], lazy="selectin")
    bids = relationship("ContractorBid", back_populates="hazard", lazy="selectin")


class ContractorBid(Base):
    __tablename__ = "contractor_bids"

    id = Column(Integer, primary_key=True, index=True)
    hazard_id = Column(Integer, ForeignKey("hazards.id"), nullable=False, index=True)
    contractor_name = Column(String(100), nullable=False)
    bid_amount = Column(Float, nullable=False)
    estimated_days = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    submitted_at = Column(DateTime, default=datetime.utcnow)

    hazard = relationship("Hazard", back_populates="bids", lazy="selectin")
