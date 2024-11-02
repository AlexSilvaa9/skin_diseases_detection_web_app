#!/bin/bash

# Verifica si el entorno virtual ya existe
if [ ! -d ".venv" ]; then
    echo "Creando entorno virtual..."
    python3 -m venv .venv
fi

# Activar el entorno virtual
source .venv/bin/activate

# Instalar dependencias
echo "Instalando dependencias..."
pip install -r requirements.txt

# Generar certificado autofirmado si no existe
if [ ! -f "selfsigned.crt" ] || [ ! -f "selfsigned.key" ]; then
    echo "Generando certificado autofirmado..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout selfsigned.key -out selfsigned.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"
else
    echo "Los certificados ya existen. Omite la generación."
fi

echo "Configuración completa."
echo "Para activar el entorno virtual, usa 'source .venv/bin/activate'."
echo "Para iniciar la aplicación, ejecuta 'python app/main.py'."