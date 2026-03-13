# HRMS Lite - Human Resource Management System

A full-stack HR management application that allows an admin to manage employee records and track daily attendance.

## Tech Stack

### Backend
- **Python 3.13** with **Django 6.0** and **Django REST Framework**
- **PostgreSQL** database
- **uv** for dependency management

### Frontend
- **React 19** with **Vite**
- **React Router** for client-side routing
- **Axios** for HTTP requests
- **Lucide React** for icons

## Features

### Core
- **Employee Management** - Add, view, and delete employees (ID, name, email, department)
- **Attendance Management** - Mark, edit, and delete attendance (Present/Absent) with date tracking
- **RESTful API** with proper validation and error handling

### Bonus
- Dashboard with summary statistics (employee count, department breakdown, attendance stats)
- Filter attendance records by employee and date
- Total present days displayed per employee
- Loading, empty, and error UI states

## Project Structure

```
HRMS/
├── backend/               # Django REST API
│   ├── config/            # Django project settings
│   ├── employees/         # Employee app (model, views, serializers, urls)
│   ├── attendance/        # Attendance app (model, views, serializers, urls)
│   ├── .env               # Environment variables
│   ├── manage.py
│   └── pyproject.toml     # uv dependencies
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── components/    # Reusable UI components (Sidebar, Modal, etc.)
│   │   ├── pages/         # Page components (Dashboard, Employees, Attendance)
│   │   └── services/      # API service layer
│   ├── .env               # Frontend environment variables
│   └── package.json
└── README.md
```

## How to Run Locally

### Prerequisites
- Python 3.13+
- Node.js 18+
- PostgreSQL
- [uv](https://docs.astral.sh/uv/) (Python package manager) — used for local development

### Backend Setup

```bash
cd backend

# Create PostgreSQL database
createdb hrms_db

# Configure environment variables
# Edit .env file with your database credentials

# Install dependencies & run
uv sync
uv run python manage.py migrate
uv run python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Dependency Management: `uv` vs `pip`

| Context | Tool | Why |
|---------|------|-----|
| **Local development** | `uv` | Fast dependency resolution and virtual environment management. Use `uv sync` to install and `uv run` to execute commands. Dependencies are defined in `pyproject.toml`. |
| **Production / Deployment** (Render, etc.) | `pip` | Most hosting platforms don't support `uv` natively. A `requirements.txt` is provided for this purpose, generated from `pyproject.toml`. |

**Adding a new dependency locally:**
```bash
cd backend
uv add <package-name>                           # adds to pyproject.toml & installs
uv pip compile pyproject.toml -o requirements.txt  # re-export for deployment
```

> **Note:** Always regenerate `requirements.txt` after adding/removing dependencies so that local (`pyproject.toml`) and deployment (`requirements.txt`) stay in sync.

## API Endpoints

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/employees/             | List all employees       |
| POST   | /api/employees/             | Create a new employee    |
| GET    | /api/employees/:id/         | Get employee details     |
| DELETE | /api/employees/:id/         | Delete an employee       |
| GET    | /api/employees/summary/     | Employee summary stats   |
| GET    | /api/attendance/            | List attendance records  |
| POST   | /api/attendance/            | Mark attendance          |
| PUT    | /api/attendance/:id/        | Edit attendance status   |
| DELETE | /api/attendance/:id/        | Delete attendance record |
| GET    | /api/attendance/summary/    | Attendance summary stats |

### Query Parameters (Attendance)
- `employee` - Filter by employee ID
- `date` - Filter by exact date
- `date_from` / `date_to` - Filter by date range

## Assumptions & Limitations
- Single admin user (no authentication required per assignment spec)
- Leave management, payroll, and advanced HR features are out of scope
- Employee ID is manually entered (not auto-generated) to match the assignment spec
