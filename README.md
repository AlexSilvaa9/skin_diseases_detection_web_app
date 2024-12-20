In this project, the state of the art in deep learning for clinical applications is reviewed, along with the development of a practical example demonstrating the utility of the latest artificial intelligence technologies.

# Web Application for Skin Disease Detection

This web application detects skin diseases from images. It uses a deep learning model trained for this task.

## Requirements

Make sure you have the following installed:

- Python 3.x
- pip (Python package manager)
- OpenSSL (to generate self-signed certificates)

If any of these are not installed, use the following command:
```bash
sudo apt install python3 python3-pip openssl
```

## Installation

1. **Clone the repository**

   ```bash
   git clone <REPOSITORY_URL>
   cd <REPOSITORY_NAME/code>
   ```

2. **Grant execution permissions to the setup script**

   ```bash
   chmod +x setup.sh
   ```

3. **Run the setup script**

   Before running the application, you need to configure the virtual environment and dependencies:

   ```bash
   ./setup.sh
   ```

## Execution

To start the application, run the following command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --ssl-keyfile=selfsigned.key --ssl-certfile=selfsigned.crt
```

The application will be available at `https://127.0.0.1:8000`. To access the camera, HTTPS is required; for local execution, a self-signed certificate will suffice.

## Usage

1. Access the application through your browser at the provided URL.
2. Upload an image of the skin to be analyzed by the model.

## Notes

- If using HTTPS, make sure you have the appropriate certificates (`selfsigned.crt` and `selfsigned.key`) in the project's root directory.
- You can modify the code inside `app/` to suit your needs.

## Contributions

Contributions are welcome. Please open an "issue" or "pull request" if you would like to contribute. 

