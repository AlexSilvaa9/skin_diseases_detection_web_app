# app/main.py

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
import io
import numpy as np
import cv2
from app.yolo_model import load_yolo_model, detect_objects_in_frame
# Inicializa la aplicación FastAPI
app = FastAPI()

# Monta la carpeta de archivos estáticos
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Cargar el modelo YOLO
net, classes, output_layers = load_yolo_model()

# Ruta principal para servir el HTML
@app.get("/")
async def get_home():
    with open("app/static/index.html") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)

# Procesar fotograma del video y devolver detecciones

@app.post("/video_frame/")
async def process_video_frame(file: UploadFile = File(...)):
    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")
        image_np = np.array(image)
        image_cv = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        results = detect_objects_in_frame(image_cv, net, classes, output_layers)
        return JSONResponse(content={"detections": results})
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Error procesando el archivo: {str(e)}")