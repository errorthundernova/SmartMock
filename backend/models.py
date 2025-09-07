from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    history = relationship("History", back_populates="owner")

class History(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    conversation = Column(Text)
    is_archived = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="history")