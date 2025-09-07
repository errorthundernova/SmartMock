import os
import json
from typing import List
from datetime import timedelta

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from fastapi.middleware.cors import CORSMiddleware

import google.generativeai as genai
from dotenv import load_dotenv

from . import models, schemas, security
from .database import SessionLocal, engine, Base

Base.metadata.create_all(bind=engine)
load_dotenv()
app = FastAPI()

origins = ["http://localhost:5173",
            "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None: raise credentials_exception
    return user

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user: raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(get_current_user)):
    return current_user

@app.post("/generate-with-ai")
def generate_with_ai(prompt_data: schemas.AIPrompt, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    system_prompt = "You are an expert data mocking assistant. You must generate a response that is ONLY a valid, raw JSON object based on the user's prompt, for example: {\"data\": [...]}. Do not include any explanations, markdown, or any text other than the JSON object itself."
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    try:
        response = model.generate_content(
            f"{system_prompt}\n\nUser prompt: {prompt_data.prompt}",
            generation_config={"response_mime_type": "application/json"}
        )
        response_json = json.loads(response.text)
        conversation_data = [{"role": "user", "content": prompt_data.prompt}, {"role": "assistant", "content": response_json}]
        
        title = " ".join(prompt_data.prompt.split()[:5])
        
        db_history = models.History(conversation=json.dumps(conversation_data), owner_id=current_user.id, title=title)
        db.add(db_history)
        db.commit()
        return {"response": response_json}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history", response_model=List[schemas.History])
def get_history(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.History).filter(models.History.owner_id == current_user.id, models.History.is_archived == False).all()

@app.get("/history/archived", response_model=List[schemas.History])
def get_archived_history(current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.History).filter(models.History.owner_id == current_user.id, models.History.is_archived == True).all()

@app.delete("/history/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history(history_id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    history_item = db.query(models.History).filter(models.History.id == history_id, models.History.owner_id == current_user.id).first()
    if not history_item: raise HTTPException(status_code=404, detail="History not found")
    db.delete(history_item)
    db.commit()
    return

@app.put("/history/{history_id}/rename", response_model=schemas.History)
def rename_history(history_id: int, history_update: schemas.HistoryUpdate, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    history_item = db.query(models.History).filter(models.History.id == history_id, models.History.owner_id == current_user.id).first()
    if not history_item: raise HTTPException(status_code=404, detail="History not found")
    history_item.title = history_update.title
    db.commit()
    db.refresh(history_item)
    return history_item

@app.put("/history/{history_id}/archive", response_model=schemas.History)
def archive_history(history_id: int, current_user: schemas.User = Depends(get_current_user), db: Session = Depends(get_db)):
    history_item = db.query(models.History).filter(models.History.id == history_id, models.History.owner_id == current_user.id).first()
    if not history_item: raise HTTPException(status_code=404, detail="History not found")
    history_item.is_archived = not history_item.is_archived
    db.commit()
    db.refresh(history_item)
    return history_item
