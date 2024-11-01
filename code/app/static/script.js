const videoElement = document.getElementById('videoElement');
const overlayCanvas = document.getElementById('overlayCanvas');
const overlayCtx = overlayCanvas.getContext('2d');
let currentStream;
let capturing = false; // Variable para controlar la captura de fotogramas

// Configura la cámara seleccionada
async function setupCamera(deviceId) {
    // Detener el stream actual si existe
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: { deviceId: deviceId ? { exact: deviceId } : undefined }
    };

    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = currentStream;
    videoElement.onloadedmetadata = () => {
        overlayCanvas.width = videoElement.videoWidth;
        overlayCanvas.height = videoElement.videoHeight;
        overlayCanvas.style.display = 'none'; // Oculta el canvas hasta que se inicie la detección
    };
}

// Obtiene la lista de cámaras disponibles
async function getCameras() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
}

// Inicializa la selección de cámara
async function initializeCameraSelection() {
    const cameras = await getCameras();
    const cameraSelect = document.getElementById('cameraSelect');

    cameras.forEach(camera => {
        const option = document.createElement('option');
        option.value = camera.deviceId;
        option.text = camera.label || `Camera ${camera.deviceId}`;
        cameraSelect.appendChild(option);
    });

    cameraSelect.addEventListener('change', (event) => {
        const selectedDeviceId = event.target.value;
        setupCamera(selectedDeviceId);
    });

    // Inicia con la primera cámara disponible
    if (cameras.length > 0) {
        setupCamera(cameras[0].deviceId);
    } else {
        showMessage("No se encontraron cámaras disponibles.");
    }
}

// Captura el fotograma actual y lo procesa
async function captureFrame() {
    if (!capturing) return; // Detiene la captura si no se ha iniciado

    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    overlayCtx.drawImage(videoElement, 0, 0, overlayCanvas.width, overlayCanvas.height);
    const frameData = overlayCanvas.toDataURL('image/jpeg');
    const blob = dataURItoBlob(frameData);
    const formData = new FormData();
    formData.append('file', blob, 'frame.jpg');

    try {
        const response = await fetch("/video_frame/", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            console.error("Error en la respuesta:", errorMessage);
            showMessage("Error al procesar el fotograma. Inténtalo de nuevo.");
            return;
        }

        const result = await response.json();
        processDetections(result.detections);
    } catch (error) {
        console.error("Error en la petición:", error);
        showMessage("Error al enviar el fotograma. Verifica tu conexión.");
    }

    setTimeout(captureFrame, 200); // Captura el siguiente fotograma
}

// Procesa las detecciones y dibuja los resultados en el canvas
function processDetections(detections) {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height); // Limpia el canvas antes de dibujar
    overlayCtx.drawImage(videoElement, 0, 0, overlayCanvas.width, overlayCanvas.height); // Dibuja el fotograma

    detections.forEach(det => {
        overlayCtx.strokeStyle = 'rgba(0, 255, 0, 0.8)'; // Color verde con transparencia
        overlayCtx.lineWidth = 2;
        const [x, y, w, h] = det.box;
        overlayCtx.strokeRect(x, y, w, h);
        overlayCtx.fillStyle = 'rgba(0, 255, 0, 0.8)'; // Texto verde con transparencia
        overlayCtx.fillText(`${det.class} (${(det.confidence * 100).toFixed(1)}%)`, x, y - 5);
    });
}

// Convierte la URI de datos en un Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

// Muestra mensajes en la interfaz
function showMessage(msg) {
    const messages = document.getElementById('messages');
    messages.textContent = msg;
}

// Función para iniciar/detener la captura
async function toggleCapture() {
    capturing = !capturing; // Cambia el estado de captura
    const button = document.getElementById('startButton');

    if (capturing) {
        button.textContent = "Stop Detection"; // Cambia el texto del botón
        overlayCanvas.style.display = 'block'; // Muestra el canvas
        captureFrame(); // Inicia la captura de fotogramas
    } else {
        button.textContent = "Start Detection"; // Cambia el texto del botón
        overlayCanvas.style.display = 'none'; // Oculta el canvas
    }
}

// Inicializa la selección de cámara al cargar
initializeCameraSelection();

// Agrega el evento al botón de inicio/detener
document.getElementById('startButton').addEventListener('click', toggleCapture);
