# PCB Testing Management System

A web-based PCB Testing Management System for managing PCB models, test parameters, test results, and JSON uploads.

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- Uvicorn

### Frontend
- React
- Material UI
- Axios

## Project Structure

```
PCB-Testing-System/
├── backend/
└── frontend/
```

## Features

- PCB Model Management
- Test Parameter Management
- PCB Unit Management
- JSON Upload
- Test Results Management
- Excel Export
- Delete Uploaded Results

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Note

Database configuration and setup instructions will be added soon.