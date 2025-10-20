from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from .routers import reports  # Placeholder for future routers

# --- APP INITIALIZATION ---
app = FastAPI(
    title="Medical Summarizer API",
    description="API for encrypting, storing, and summarizing medical reports.",
    version="0.1.0",
)

# --- MIDDLEWARE ---
# Set up CORS (Cross-Origin Resource Sharing)
origins = [
    "http://localhost:5173",  # React/Vite frontend
    "http://localhost:3000",  # Alternative common frontend port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# --- ROUTERS ---
# Include routers from the /routers directory
# app.include_router(reports.router, prefix="/api/v1")


# --- HEALTH CHECK ENDPOINT ---
@app.get("/", tags=["Health Check"])
def read_root():
    """
    Root endpoint that provides a simple health check.
    """
    return {"status": "ok", "message": "Welcome to the Medical Summarizer API!"}
