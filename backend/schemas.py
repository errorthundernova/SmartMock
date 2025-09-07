# from pydantic import BaseModel
# from typing import List, Optional

# class HistoryBase(BaseModel):
#     conversation: str
#     title: str

# class HistoryCreate(HistoryBase):
#     pass

# class History(HistoryBase):
#     id: int
#     owner_id: int
#     is_archived: bool

#     class Config:
#         from_attributes = True

# class UserBase(BaseModel):
#     email: str

# class UserCreate(UserBase):
#     password: str

# class User(UserBase):
#     id: int
#     history: List[History] = []

#     class Config:
#         from_attributes = True

# class Token(BaseModel):
#     access_token: str
#     token_type: str

# class TokenData(BaseModel):
#     email: Optional[str] = None

# class AIPrompt(BaseModel):
#     prompt: str

# # --- This is the new, added class ---
# class HistoryUpdate(BaseModel):
#     title: str

from pydantic import BaseModel
from typing import List, Optional

class HistoryBase(BaseModel):
    conversation: str
    title: str

class HistoryCreate(HistoryBase):
    pass

class History(HistoryBase):
    id: int
    owner_id: int
    is_archived: bool

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    history: List[History] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class AIPrompt(BaseModel):
    prompt: str
    is_temporary: bool = False

class HistoryUpdate(BaseModel):
    title: str

# --- Password Reset Schemas ---
class EmailSchema(BaseModel):
    email: str

class PasswordResetSchema(BaseModel):
    token: str
    password: str

