import os
import psycopg2
from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
DB_URL = os.getenv("DATABASE_URL")

# --- ROUTER SETUP ---
router = APIRouter()

# --- API ENDPOINTS ---

@router.get("/patients", tags=["Patients"])
def get_all_patients():
    """
    Retrieves a list of all unique patient names from the database.
    """
    patient_names = []
    conn = None
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        # Query for distinct patient names
        cur.execute("SELECT DISTINCT patient_name FROM reports ORDER BY patient_name;")
        
        # Fetch all results
        results = cur.fetchall()
        
        # Flatten the list of tuples into a simple list of strings
        patient_names = [row[0] for row in results]
        
        return {"patients": patient_names}

    except psycopg2.Error as e:
        # Handle potential database errors (e.g., table not found, connection issues)
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    except Exception as e:
        # Handle other unexpected errors
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
    finally:
        if conn:
            conn.close()
