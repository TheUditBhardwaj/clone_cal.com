# Clone_Cal.com

A premium, full-stack scheduling platform inspired by Cal.com. Featuring a high-fidelity dashboard, responsive booking interface, and custom orbiting animations.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL (hosted on NeonDB) |
| **ORM** | Drizzle ORM |
| **Deployment** | Railway (Backend) & Vercel (Frontend) |

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL database (NeonDB recommended)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd clone_cal.com
```

### 2. Install Dependencies
Install all dependencies for the root, frontend, and backend using the root command:
```bash
npm install
npm install --prefix frontend
npm install --prefix backend
```

### 3. Environment Variables
Create `.env` files in both `frontend` and `backend` directories.

**frontend/.env**:
```env
VITE_API_URL=https://clonecalcom-production.up.railway.app
```

**backend/.env**:
```env
DATABASE_URL=your_postgresql_connection_string
PORT=5001
FRONTEND_URL=https://clone-cal-fjdu783se-udit-bhardwajs-projects-5590f757.vercel.app
```

### 4. Database Setup
```bash
cd backend
npm run db:push   # Push schema to the database
npm run db:seed   # Seed with initial event types and data
```

### 5. Running Locally
Run both frontend and backend concurrently from the root directory:
```bash
npm run dev
```
- Frontend: `https://clonecalcom-production.up.railway.app`
- Backend: `https://clone-cal-fjdu783se-udit-bhardwajs-projects-5590f757.vercel.app`

## 🧠 Core Assumptions

1. **User Authentication**: This version assumes a single-user system for the admin dashboard (User ID: 2 is the default for seeding and operations). Multi-tenant auth is noted as a future enhancement.
2. **Timezones**: All times are handled in the local ISO string format provided by the browser, with the backend storing them as-is.
3. **Availability**: Users can set one availability range per weekday.
4. **Public Access**: Public booking URLs follow the `/book/:slug` pattern and are accessible without login.

## ✨ Features

- **High-Fidelity Dashboard** — Manage event types and availability with a premium UI.
- **Card-Based Event Management** — Modern list view for event types with individual card control.
- **Responsive Design** — Fully optimized for mobile, tablet, and desktop viewports.
- **Orbiting Circles Animation** — Custom visual experience on the landing page.
- **Booking Management** — View and cancel appointments with ease.