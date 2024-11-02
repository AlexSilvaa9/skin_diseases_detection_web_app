const videoElement = document.getElementById('videoElement');
const overlayCanvas = document.createElement('canvas');
const overlayCtx = overlayCanvas.getContext('2d');
let currentStream;
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const downloadButton = document.getElementById('downloadButton');
const closeModal = document.getElementById('closeModal');
const cameraSelect = document.getElementById('cameraSelect');
const analyzeButton = document.getElementById('analyzeButton');
const messages = document.getElementById('messages');
const gallery = document.getElementById('gallery');

document.addEventListener('DOMContentLoaded', async () => {
    await initializeCameraSelection();
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    gallery.addEventListener('click', (event) => {
        if (event.target.tagName === 'IMG') {
            const src = event.target.src;
            modalImage.src = src;
            downloadButton.href = src;
            modal.style.display = 'block';
        }
    });
});

// Inicializa el stream de medios del usuario
async function initializeMediaStream() {
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = currentStream;
    } catch (error) {
        console.error('Error al acceder a dispositivos de medios:', error);
        showMessage('No se pudo acceder a la cámara. Asegúrate de permitir el acceso.');
    }
}

// Configura la cámara seleccionada
async function setupCamera(deviceId) {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = { video: { deviceId: deviceId ? { exact: deviceId } : undefined } };
    try {
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = currentStream;

        videoElement.onloadedmetadata = () => {
            overlayCanvas.width = videoElement.videoWidth;
            overlayCanvas.height = videoElement.videoHeight;
        };
    } catch (error) {
        console.error('Error al acceder a la cámara seleccionada:', error);
        showMessage('No se pudo acceder a la cámara seleccionada. Intenta con otra.');
    }
}

// Obtiene la lista de cámaras disponibles
async function getCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
}

// Inicializa la selección de cámaras
async function initializeCameraSelection() {
    await initializeMediaStream();
    const cameras = await getCameras();
    
    // Limpiar opciones anteriores
    cameraSelect.innerHTML = '';

    cameras.forEach(camera => {
        const option = document.createElement('option');
        option.value = camera.deviceId;
        option.text = camera.label || `Camera ${camera.deviceId}`;
        
        // Evitar duplicados
        if (![...cameraSelect.options].some(opt => opt.value === camera.deviceId)) {
            cameraSelect.appendChild(option);
        }
    });

    cameraSelect.addEventListener('change', (event) => {
        setupCamera(event.target.value);
    });

    if (cameras.length > 0) {
        setupCamera(cameras[0].deviceId);
    }
}

// Captura y procesa el fotograma actual
async function analyzeFrame() {
    console.log("Iniciando captura del fotograma");
    overlayCtx.drawImage(videoElement, 0, 0, overlayCanvas.width, overlayCanvas.height);
    const frameData = overlayCanvas.toDataURL('image/jpeg');
    const blob = dataURItoBlob(frameData);
    const formData = new FormData();
    formData.append('file', blob, 'frame.jpg');

    console.log("Imagen capturada y convertida a Blob. Preparando envío...");

    try {
        const response = await fetch("/video_frame/", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error("Error en la respuesta del servidor:", errorMessage);
            showMessage("Error al procesar la imagen. Inténtalo de nuevo.");
            return;
        }

        const result = await response.json();
        console.log("Respuesta del servidor recibida con éxito:", result);
        displayResult(result.detections); 
    } catch (error) {
        console.error("Error en la petición de red:", error);
        showMessage("Error al enviar la imagen. Verifica tu conexión.");
    }
}

// Muestra la imagen procesada y el resultado en la galería
function displayResult(detections) {
    console.log("Mostrando resultado en la galería.");
    const imgDataUrl = overlayCanvas.toDataURL('image/jpeg');

    const resultContainer = document.createElement('div');
    resultContainer.style.margin = '10px';

    const img = document.createElement('img');
    img.src = imgDataUrl;
    img.style.cursor = 'pointer'; 
    img.style.maxWidth = '100%'; 

    img.addEventListener('click', () => openModal(img.src));

    resultContainer.appendChild(img);

    const detectionsList = document.createElement('ul');
    
    if (Array.isArray(detections)) {
        detections.forEach(det => {
            const listItem = document.createElement('li');
            listItem.textContent = `${det.class} (${(det.confidence * 100).toFixed(1)}%)`;
            detectionsList.appendChild(listItem);
        });
    } else {
        console.error("La respuesta no es un array:", detections);
        const errorMessage = document.createElement('li');
        errorMessage.textContent = "No se encontraron detecciones válidas.";
        detectionsList.appendChild(errorMessage);
    }

    resultContainer.appendChild(detectionsList);
    gallery.appendChild(resultContainer);
}

// Función para abrir el modal con la imagen ampliada
function openModal(src) {
    modalImage.src = src; 
    modal.style.display = "block"; 
}

// Convierte la URI en un Blob
function dataURItoBlob(dataURI) {
    console.log("Convirtiendo Data URI a Blob");
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
}

// Muestra un mensaje en la página
function showMessage(message) {
    console.log("Mensaje para el usuario:", message);
    messages.textContent = message;
}

// Inicializa la cámara al cargar la página
initializeCameraSelection();

// Añade el evento de análisis del botón
analyzeButton.addEventListener('click', analyzeFrame);
