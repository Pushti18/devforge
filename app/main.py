import time
from pathlib import Path
from typing import Optional

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="BuildBox",
    description="The Developer's Arsenal - A collection of essential developer tools",
    version="1.0.0",
)

app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/health")
async def health():
    return {"status": "ok"}


class ProxyRequest(BaseModel):
    url: str
    method: str = "GET"
    headers: Optional[dict] = None
    body: Optional[str] = None


@app.post("/api/proxy")
async def api_proxy(req: ProxyRequest):
    try:
        headers = req.headers or {}
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            start = time.perf_counter()
            response = await client.request(
                method=req.method.upper(),
                url=req.url,
                headers=headers,
                content=req.body if req.body else None,
            )
            elapsed_ms = (time.perf_counter() - start) * 1000

        resp_headers = dict(response.headers)
        try:
            resp_body = response.json()
        except Exception:
            resp_body = response.text

        return JSONResponse({
            "status": response.status_code,
            "status_text": response.reason_phrase,
            "headers": resp_headers,
            "body": resp_body,
            "time_ms": round(elapsed_ms, 2),
            "size_bytes": len(response.content),
        })
    except httpx.TimeoutException:
        return JSONResponse({"error": "Request timed out (30s limit)"}, status_code=504)
    except httpx.ConnectError as e:
        return JSONResponse({"error": f"Connection failed: {str(e)}"}, status_code=502)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
