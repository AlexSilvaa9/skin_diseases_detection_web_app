
# Aplicación Web de Detección de Enfermedades en la Piel

Esta aplicación web permite detectar enfermedades en la piel a partir de imágenes. Utiliza un modelo de aprendizaje profundo entrenado para esta tarea.

## Requisitos

Asegúrate de tener instalados los siguientes elementos:

- Python 3.x
- pip (gestor de paquetes de Python)
- OpenSSL (para generar certificados autofirmados)

En caso de que no tenga instalado alguno:
```bash
sudo apt install python3 python3-pip openssl
```

## Instalación

1. **Clona el repositorio**

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DEL_REPOSITORIO>
   ```

2. **Dale permisos de ejecución al script de configuración**

   ```bash
   chmod +x setup.sh
   ```

3. **Ejecuta el script de configuración**

   Antes de ejecutar la aplicación, necesitarás configurar el entorno virtual y las dependencias:

   ```bash
   ./setup.sh
   ```

## Ejecución

Para iniciar la aplicación, ejecuta el siguiente comando:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --ssl-keyfile=selfsigned.key --ssl-certfile=selfsigned.crt
```

La aplicación estará disponible en `https://127.0.0.1:8000`. Para poder acceder a la cámara, es necesario utilizar HTTPS; para la ejecución en local, nos valdrá con autofirmar uno.

## Uso

1. Accede a la aplicación a través del navegador en la dirección indicada.
2. Sube una imagen de la piel para que sea analizada por el modelo.

## Notas

- Si utilizas HTTPS, asegúrate de tener los certificados apropiados (`selfsigned.crt` y `selfsigned.key`) en la raíz del proyecto.
- Puedes modificar el código dentro de `app/` según tus necesidades.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un "issue" o un "pull request" si deseas contribuir.
