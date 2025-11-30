# Employee Attendance System

A comprehensive Employee Attendance System built with the MERN stack (MongoDB, Express, React, Node.js), featuring role-based dashboards, attendance tracking, and reporting.

## 📋 Table of Contents
1. [Tech Stack](#tech-stack)
2. [Setup Instructions](#setup-instructions)
3. [Backend & Database Setup](#backend--database-setup)
4. [Environment Variables](#environment-variables)
5. [How to Run](#how-to-run)
6. [Screenshots](#screenshots)
7. [Seed Data](#seed-data)

---

## 🛠 Tech Stack
*   **Frontend**: React, TypeScript, Zustand, Tailwind CSS, Recharts
*   **Backend**: Node.js, Express
*   **Database**: MongoDB (Mongoose)

---

## ⚙️ Setup Instructions

### 1. Frontend Setup
```bash
# Install frontend dependencies
npm install
```

### 2. Backend Setup
The backend code is located in the `backend/` directory.

```bash
# Navigate to backend folder
cd backend

# Install backend dependencies
npm install
```

---

## 🗄 Backend & Database Setup

To use the full functionality with MongoDB:

1.  **Install MongoDB**: Ensure MongoDB is installed and running locally, or have a MongoDB Atlas connection string ready.
2.  **Configure Environment**:
    Create a `.env` file in the `backend/` directory:
    ```
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/attendance_db
    ```
3.  **Start the Server**:
    ```bash
    cd backend
    npm start
    ```
    The server will start on port 5000 and automatically seed the database with initial users if it is empty.

4.  **Connect Frontend to Backend**:
    *By default, the deployed frontend uses `MockService` for demonstration purposes.*
    To use the real backend:
    1. Open `src/pages/Login.tsx` (and other pages).
    2. Replace `import { MockService }` with `import { ApiService } from '../services/api'`.
    3. Update calls from `MockService` to `ApiService`.

---

## 🚀 How to Run

1.  **Start Backend** (Terminal 1)
    ```bash
    cd backend
    npm start
    ```

2.  **Start Frontend** (Terminal 2)
    ```bash
    npm start
    ```
    Open `http://localhost:3000` in your browser.

---

## 🧪 Seed Data (Default Credentials)

If using the Mock Service or after fresh Backend Seeding:

| Role | Name | Username / Email | Password |
|------|------|------------------|----------|
| **Manager** | Harshitha | **Harshitha** / `harshitha@example.com` | `password` |
| **Employee** | Bhaskar | **Bhaskar** / `bhaskar@example.com` | `password` |
| **Employee** | Rathana | **Rathana** / `rathana@example.com` | `password` |
| **Employee** | Ruthvika | **Ruthvika** / `ruthvika@example.com` | `password` |
| **Employee** | Nandha | **Nandha** / `nandha@example.com` | `password` |

---

## 📸 Screenshots

### 1. Landing Page
*Role selection for Employees and Managers.*
![Landing Page](./screenshots/landing.png)

### 2. Employee Dashboard
*Real-time clock and attendance stats.*
![Employee Dashboard](./screenshots/employee_dashboard.png)

### 3. Manager Dashboard
*Overview of total employees and attendance charts.*
![Manager Dashboard](./screenshots/manager_dashboard.png)

### 4. Reports
*Detailed table with date range filters.*
![Reports](./screenshots/reports.png)
