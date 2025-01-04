from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
from datetime import datetime
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RECORDINGS_DIR = "recordings"

@app.on_event("startup")
async def startup_event():
    os.makedirs(RECORDINGS_DIR, exist_ok=True)

@app.post("/upload-audio/")
async def upload_audio(file: UploadFile = File(...)):
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = os.path.join(RECORDINGS_DIR, f"{timestamp}_{file.filename}")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return JSONResponse(content={"message": "File uploaded successfully", "file_path": file_path})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/list-audios/")
async def list_audios():
    try:
        files = os.listdir(RECORDINGS_DIR)
        file_urls = [f"http://127.0.0.1:8000/{RECORDINGS_DIR}/{file}" for file in files]
        return JSONResponse(content={"files": file_urls})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/recordings/{filename}")
async def serve_audio(filename: str):
    file_path = os.path.join(RECORDINGS_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse(content={"error": "File not found"}, status_code=404)