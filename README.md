# 💸 Expense Tracker

A full-stack expense tracking web application built with the MERN stack (MongoDB, Express, React, Node.js). Track your income and expenses, visualize spending habits, and manage your personal finances in one place.

> 🚧 **This project is currently in progress.**

---

## Features

- 📝 **User Authentication** — Register and log in securely with hashed passwords
- 💰 **Income Tracking** — Add, view, and delete income entries
- 💸 **Expense Tracking** — Add, view, and delete expense entries
- 📊 **Dashboard** — Get a summary overview of your financial activity
- 📥 **Export to Excel** — Download your income and expense data as a spreadsheet
- 🖼️ **Profile Image Upload** — Personalize your account with a profile photo

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | bcryptjs, JWT |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) instance (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/expense-tracker.git
   cd expense-tracker
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   Create a `.env` file in the `backend/` folder:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=8000
   ```

5. **Run the backend**
   ```bash
   cd backend
   node server.js
   ```

6. **Run the frontend**
   ```bash
   cd frontend
   npm run dev
   ```

The app will be available at `http://localhost:5173` (or whichever port Vite uses).
