# PCB Testing Management System

A web-based PCB Testing Management System developed using **FastAPI**, **PostgreSQL**, **React**, and **Material UI**. The system manages PCB models, test parameters, PCB units, test results, JSON uploads, and Excel report generation.

---

## Features

- PCB Model Management
- Test Parameter Management
- PCB Unit Management
- Test Result Management
- JSON Upload API
- Excel Report Generation
- Duplicate Barcode Validation

---

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

---

## Project Structure

```
PCB-Testing-System/
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│   ├── .env.example
│   └── main.py
│
├── frontend/
│   ├── package.json
│   ├── src/
│   └── ...
│
├── .gitignore
└── README.md
```

---

# Prerequisites

- Python 3.10+
- Node.js & npm
- PostgreSQL

---

# Backend Setup

## 1. Clone the repository

```bash
git clone <repository-url>
cd PCB-Testing-System
```

## 2. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

## 3. Create a PostgreSQL database

Example:

```
pcb_testing
```

## 4. Create a `.env` file

Create a file named `.env` inside the `backend` folder.

Example:

```
DATABASE_URL=postgresql://username:password@localhost:5432/pcb_testing
```

Replace:

- username
- password
- database name

with your PostgreSQL credentials.

## 5. Start the backend

```bash
uvicorn app.main:app --reload
```

The backend will run at:

```
http://localhost:8000
```

Tables are created automatically on first run.

---

# Frontend Setup

Open another terminal.

```bash
cd frontend
npm install
npm start
```

The frontend will run at:

```
http://localhost:3000
```

---

# Backend URL Configuration

The frontend communicates with the backend using Axios.

Open the API configuration file and update the backend URL:

```javascript
const api = axios.create({
    baseURL: "http://PCB-SYSTEM:8000",
});
```

Replace **PCB-SYSTEM** with the hostname (computer name) of the machine running the backend.

Example:

```javascript
const api = axios.create({
    baseURL: "http://OFFICE-PC:8000",
});
```

After updating the URL, restart the frontend.

> **Note:** This step is required only if the backend is accessed from another computer or another application over the network.

---

# API Documentation

After starting the backend:

Swagger UI

```
http://localhost:8000/docs
```

ReDoc

```
http://localhost:8000/redoc
```

---

# JSON Upload

The backend accepts JSON data through the upload API.

Duplicate PCB barcodes are automatically rejected.

---

# Excel Report

The application supports exporting PCB test records to Excel.

---

# License

This project was developed for internship and educational purposes.