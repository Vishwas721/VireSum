-- Enable pgcrypto extension for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop tables if they exist to ensure a clean slate
DROP TABLE IF EXISTS report_vectors;
DROP TABLE IF EXISTS reports;

-- Create the reports table
CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    patient_name TEXT NOT NULL,
    report_filepath_pointer TEXT,
    report_text_encrypted BYTEA
);

-- Create the report_vectors table
CREATE TABLE report_vectors (
    report_id INTEGER NOT NULL,
    report_vector VECTOR(768),
    FOREIGN KEY (report_id) REFERENCES reports(report_id)
);
