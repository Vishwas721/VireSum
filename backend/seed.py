import os
import fitz  # PyMuPDF
import psycopg2
from psycopg2 import sql
from langchain_community.embeddings import OllamaEmbeddings
from dotenv import load_dotenv
import numpy as np

# Load environment variables from .env file
load_dotenv()

# --- CONFIGURATION ---
DB_URL = os.getenv("DATABASE_URL")
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
DEMO_REPORTS_PATH = os.path.join(os.path.dirname(__file__), 'demo_reports')
# Assumes Ollama is running locally
OLLAMA_BASE_URL = "http://localhost:11434" 

# --- HELPER FUNCTIONS ---

def get_ollama_embeddings(text):
    """
    Generates vector embeddings for the given text using a local Ollama instance.
    """
    print("Generating embeddings...")
    try:
        ollama_embed = OllamaEmbeddings(base_url=OLLAMA_BASE_URL, model="mxbai-embed-large")
        embeddings = ollama_embed.embed_query(text)
        print("Embeddings generated successfully.")
        return embeddings
    except Exception as e:
        print(f"Error generating embeddings: {e}")
        print("Please ensure your local Ollama instance is running and accessible.")
        return None

def extract_text_from_pdf(pdf_path):
    """
    Extracts all text from a given PDF file.
    """
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {e}")
        return None

def execute_schema(cur):
    """
    Executes the schema.sql file to set up database tables.
    """
    try:
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        with open(schema_path, 'r') as f:
            # Execute the SQL script
            cur.execute(f.read())
        print("Database schema executed successfully.")
    except Exception as e:
        print(f"Error executing schema.sql: {e}")
        raise

# --- MAIN SEEDING LOGIC ---

def seed_database():
    """
    Main function to seed the database with demo medical reports.
    """
    if not DB_URL or not ENCRYPTION_KEY:
        print("Error: DATABASE_URL and ENCRYPTION_KEY must be set in the .env file.")
        print("Please copy .env.example to .env and fill in your details.")
        return

    conn = None
    try:
        print("Connecting to the database...")
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        print("Database connection successful.")

        # Set up the schema
        execute_schema(cur)
        conn.commit()

        pdf_files = [f for f in os.listdir(DEMO_REPORTS_PATH) if f.endswith('.pdf')]

        if not pdf_files:
            print("\nWARNING: No PDF files found in the ./demo_reports/ directory.")
            print("Please add some sample PDF medical reports to proceed.")
            return

        print(f"Found {len(pdf_files)} PDF files to process.")

        for pdf_file in pdf_files:
            pdf_path = os.path.join(DEMO_REPORTS_PATH, pdf_file)
            print(f"\n--- Processing: {pdf_file} ---")

            # 1. Extract text from PDF
            report_text = extract_text_from_pdf(pdf_path)
            if not report_text:
                continue

            # For demo purposes, we'll use the filename as the patient name
            patient_name = os.path.splitext(pdf_file)[0].replace('_', ' ').title()

            # 2. Get vector embedding for the text
            report_vector = get_ollama_embeddings(report_text)
            if report_vector is None:
                print(f"Skipping {pdf_file} due to embedding generation failure.")
                continue

            # 3. Insert into 'reports' table with encrypted text
            print(f"Inserting encrypted data for '{patient_name}'...")
            insert_report_query = sql.SQL("""
                INSERT INTO reports (patient_name, report_filepath_pointer, report_text_encrypted)
                VALUES (%s, %s, pgp_sym_encrypt(%s, %s))
                RETURNING report_id;
            """)
            cur.execute(insert_report_query, (patient_name, pdf_path, report_text, ENCRYPTION_KEY))
            report_id = cur.fetchone()[0]
            print(f"Inserted into 'reports' table with new report_id: {report_id}")

            # 4. Insert into 'report_vectors' table
            print(f"Inserting vector for report_id: {report_id}...")
            insert_vector_query = sql.SQL("""
                INSERT INTO report_vectors (report_id, report_vector)
                VALUES (%s, %s);
            """)
            # Convert list to NumPy array string format for pgvector
            cur.execute(insert_vector_query, (report_id, np.array(report_vector)))
            print("Vector inserted successfully.")

        conn.commit()
        print("\n--- Seeding Complete! ---")
        print(f"Successfully processed and inserted {len(pdf_files)} reports.")

    except psycopg2.OperationalError as e:
        print(f"\nDatabase Connection Error: {e}")
        print("Please check your DATABASE_URL in the .env file and ensure PostgreSQL is running.")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
        if conn:
            conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    seed_database()
