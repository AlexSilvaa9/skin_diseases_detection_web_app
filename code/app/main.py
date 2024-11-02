from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
import io
import numpy as np
import cv2
from app.skin_model import load_skin_model, detect_skin_conditions

# Inicializa la aplicación FastAPI
app = FastAPI()

# Monta la carpeta de archivos estáticos
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Cargar modelo
try:
    model = load_skin_model()
except Exception as e:
    raise RuntimeError(f"Error al cargar el modelo de detección de piel: {e}")

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
        print("Leyendo contenido del archivo...")
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")
        print("Imagen cargada y convertida a RGB.")
        
        image_np = np.array(image)
        print("Imagen convertida a array de NumPy.")
        
        image_cv = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        print("Imagen convertida de RGB a BGR para OpenCV.")

        # Realizar la detección usando el modelo de piel
        results = detect_skin_conditions(image_cv, model)
        print(f"Detecciones realizadas: {results}")
        
        return JSONResponse(content={"detections": results})
    except Exception as e:
        error_message = f"Error procesando el archivo: {str(e)}"
        print(error_message)
        raise HTTPException(status_code=422, detail=error_message)
