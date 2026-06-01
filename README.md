# DevForge

The Developer's Arsenal - A collection of essential developer tools.

## Tech Stack

- **Backend:** FastAPI (Python 3.12)
- **Frontend:** HTML, CSS, JavaScript
- **Templating:** Jinja2
- **Server:** Gunicorn + Uvicorn workers
- **Containerization:** Docker & Docker Compose

## Getting Started

### Prerequisites

- Python 3.12+
- Docker (optional)

### Run Locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000` in your browser.

### Run with Docker

```bash
docker compose up --build
```

The app will be available at `http://localhost:8000`.

## Project Structure

```
devforge/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── static/
│   │   ├── css/style.css
│   │   └── js/app.js
│   └── templates/
│       └── index.html
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## API Endpoints

| Endpoint  | Method | Description          |
|-----------|--------|----------------------|
| `/`       | GET    | Main application UI  |
| `/health` | GET    | Health check endpoint|

## License

This project is open source.
