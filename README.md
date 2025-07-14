# SmartBookAI

SmartBookAI is a multi-tenant event activity booking platform with a modern Next.js frontend, Node.js/Express backend, and a Python Flask ML API. It supports event management, activity bookings, teammate management, payment proof uploads, admin dashboards, and AI-powered recommendations.

## Features

### User Features
- **Event Discovery:** Browse and join events using unique links or QR codes.
- **Activity Booking:** Book activities for yourself or as a team, with support for teammate details.
- **Personalized Recommendations:** Get AI-powered activity suggestions based on your interests and history.
- **Booking Management:** View and manage your bookings, see payment status, and cancel if needed.
- **Payment Proof Upload:** Upload payment screenshots for manual or automated verification.
- **Profile Page:** View your profile, booking history, and personalized recommendations.

### Admin Features
- **Admin Signup/Login:** Register as an event admin and manage your event.
- **Event Creation:** Create events with custom branding, logo, and color themes.
- **Activity Management:** Add, edit, and delete activities with slots, categories, fees, and UPI IDs.
- **Set Booking Limits:** Configure max bookings per user and max teammates per booking.
- **Booking Dashboard:** View all bookings for each activity, approve/reject payments, and export data as CSV.
- **Analytics:** Track event performance, bookings, and payments in real time.
- **QR Code Generation:** Generate and download QR codes for event registration links.

### Technical Features
- **Multi-Tenant Architecture:** Each event is isolated with its own activities and bookings.
- **Modern UI/UX:** Responsive, mobile-friendly design with animated backgrounds and clean layouts.
- **Next.js App Router:** Uses the latest Next.js features for fast, SEO-friendly pages.
- **API Integration:** Connects to a Node.js/Express backend and a Python Flask ML API for recommendations.
- **CORS & Security:** Secure CORS configuration for local and production deployments.
- **Environment Variables:** Easily configure API URLs and secrets for different environments.

## Tech Stack
- **Frontend:** Next.js (React, TypeScript, App Router)
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **ML API:** Python, Flask, scikit-learn, pandas
- **Deployment:** Vercel (frontend), Render (backend), (optionally) Railway/Heroku for ML API

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/aditya-devm02/smartbookai.git
cd smartbookai
```

### 2. Install Dependencies
- **Frontend:**
  ```bash
  cd frontend
  npm install
  ```
- **Backend:**
  ```bash
  cd ../backend
  npm install
  ```
- **ML API:**
  ```bash
  cd ../ml-api
  pip install -r requirements.txt
  ```

### 3. Environment Variables
- **Frontend:** Create `.env.local` in `frontend/`:
  ```env
  NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
  ```
- **Backend:** Create `.env` in `backend/`:
  ```env
  MONGO_URI=your-mongodb-uri
  JWT_SECRET=your-secret
  ```
- **ML API:** Set any required variables in `ml-api/.env`.

### 4. Running Locally
- **Frontend:**
  ```bash
  cd frontend
  npm run dev
  ```
- **Backend:**
  ```bash
  cd backend
  npm run dev
  ```
- **ML API:**
  ```bash
  cd ml-api
  python app.py
  ```

### 5. Deployment
- **Frontend:** Deploy `frontend/` to Vercel. Set the root directory to `frontend` and output directory to blank or `.next`.
- **Backend:** Deploy `backend/` to Render or similar. Ensure CORS allows both localhost and your Vercel domain.
- **ML API:** Deploy `ml-api/` to your preferred Python host.
