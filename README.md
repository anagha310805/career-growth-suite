# Job Application Tracker

A full-stack job application tracker with a React frontend and Flask/MySQL backend. This repository now includes secure user registration, login, logout, and per-user application protection.

## Requirements

- Python 3.11+ or compatible Python 3
- Node.js 18+ and npm
- MySQL 8+

## Backend Setup

1. Create a MySQL database and user.
   - Example:
     ```sql
     CREATE DATABASE job_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
     CREATE USER 'job_user'@'localhost' IDENTIFIED BY 'secure_password';
     GRANT ALL PRIVILEGES ON job_tracker.* TO 'job_user'@'localhost';
     FLUSH PRIVILEGES;
     ```

2. Copy `.env.example` to `.env` in the project root.
3. Update the database credentials and secret key in `.env`:
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `SECRET_KEY`
   - `FRONTEND_ORIGIN`

4. Install backend dependencies:
   ```bash
   cd backend
   python -m pip install -r requirements.txt
   ```

5. Start the Flask backend:
   ```bash
   python app.py
   ```

   The backend listens on `http://localhost:5000` by default.

## Frontend Setup

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Open the application at the address shown by Vite (default `http://localhost:3000`).

## Authentication Flow

- `/login` is the first page shown to unauthenticated users.
- New users register at `/register` with email, password, and confirm password.
- Passwords are hashed using Werkzeug and never stored in plain text.
- After login, users are redirected to the existing dashboard.
- Logout clears the session and returns the user to the login page.

## Database Schema

### Users Table

- `id` INT primary key
- `email` VARCHAR(255) unique
- `password_hash` VARCHAR(255)
- `created_at` DATETIME

### Applications Table

- `id` INT primary key
- `user_id` INT foreign key → `users.id`
- `company` VARCHAR(255)
- `role` VARCHAR(255)
- `status` VARCHAR(50)
- `location` VARCHAR(255)
- `applied_date` DATE
- `salary` VARCHAR(100)
- `created_at` DATETIME

> If your existing `applications` table is already present, the backend will add a nullable `user_id` column and enforce the user foreign key.

## API Endpoints

- `POST /api/register` — register a new user
- `POST /api/login` — login and create a session cookie
- `POST /api/logout` — clear the session
- `GET /api/me` — fetch the current authenticated user
- `GET /api/applications` — list signed-in user applications
- `POST /api/applications` — create an application for the current user
- `PUT /api/applications/<id>` — update a user-owned application
- `DELETE /api/applications/<id>` — delete a user-owned application

## Security Notes

- Passwords are hashed with Werkzeug.
- Sessions use secure cookies with `SameSite=None` for local authentication.
- All protected application APIs require an authenticated session.
- A user cannot access another user's applications.
- Sensitive config is stored in `.env` and `.env` is ignored by Git.

## Testing the Authentication Flow

1. Start MySQL.
2. Start the Flask backend.
3. Start the frontend.
4. Open the frontend in the browser.
5. Register a new account.
6. Login with the new account.
7. Confirm the dashboard opens.
8. Add a job application.
9. Confirm the application appears.
10. Logout.
11. Login again.
12. Confirm the previously added application is still visible.
13. Register a second user.
14. Login as the second user.
15. Confirm the first user's applications are not visible.
16. Confirm the second user can create their own application.
17. Confirm unauthenticated requests to protected API routes return `401`.
18. Confirm direct application ID access is restricted to the owning user.
