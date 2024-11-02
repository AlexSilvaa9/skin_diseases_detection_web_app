import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

# Cargar el modelo de detección de enfermedades de la piel
def load_skin_model():
    try:
        model = load_model("app/modelo_piel.h5")
        print("Modelo cargado exitosamente.")
        return model
    except Exception as e:
        print(f"Error al cargar el modelo: {e}")
        raise

# Preprocesar la imagen antes de la predicción
def preprocess_image(image):
    try:
        print("Preprocesando la imagen...")
        # Ajusta las dimensiones a (224, 224), que es lo que el modelo espera
        image_resized = cv2.resize(image, (224, 224))
        image_array = img_to_array(image_resized)
        image_array = np.expand_dims(image_array, axis=0)  # Añade una dimensión para el batch
        image_array = image_array / 255.0  # Normaliza si es necesario
        print("Imagen preprocesada correctamente.")
        return image_array
    except Exception as e:
        print(f"Error al preprocesar la imagen: {e}")
        raise

# Detectar enfermedades en la piel en el fotograma
def detect_skin_conditions(image, model):
    try:
        preprocessed_image = preprocess_image(image)
        print("Realizando predicción...")
        predictions = model.predict(preprocessed_image)[0]  # Obtén las predicciones para la imagen
        print(f"Predicciones: {predictions}")
        results = []

        # Define las clases y sus umbrales correspondientes
        classes = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]
        thresholds = {
            0: 0.08,  # akiec
            1: 0.18,  # bcc
            2: 0.19,  # bkl
            3: 0.04,  # df
            4: 0.19,  # mel
            5: 0.60,  # nv
            6: 0.05   # vasc
        }

        for i, confidence in enumerate(predictions):
            # Compara la confianza con el umbral específico de cada clase
            if confidence > thresholds[i]:
                results.append({
                    "class": classes[i],
                    "confidence": float(confidence)
                })

        print(f"Resultados de detección: {results}")
        return results
    except Exception as e:
        print(f"Error en la detección de condiciones de la piel: {e}")
        raise
