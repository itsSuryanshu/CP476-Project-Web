# CP476-Project-Web
Laurier CP476 Project: Expense Tracker

## Contribution
* Frontend: Suyanshu
* Database: Assvin
* Backend: Nicholas

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
   git clone https://github.com/itsSuryanshu/CP476-Project-Web.git
   cd CP476-Project-Web
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend/expense-tracker
   npm install
   ```

4. **Set up environment variables**

   Copy the example file into a real `.env` file inside `backend/`:
   ```bash
   cd backend
   cp .env.example .env
   ```

   Your `backend/.env` should look like this:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=8000
   ```

   `CLIENT_URL` is not required for local setup. The backend currently allows requests from any origin if `CLIENT_URL` is not set. If you want to restrict CORS later, you can add:
   ```
   CLIENT_URL=http://localhost:5173
   ```

   **Option A: Use MongoDB locally**

   1. Install MongoDB Community Edition or use MongoDB Compass with a local MongoDB server.
   2. Start MongoDB on your machine.
   3. Use this value in `MONGO_URI`:
      ```
      MONGO_URI=mongodb://127.0.0.1:27017/expense-tracker
      ```
   4. The database `expense-tracker` will be created automatically when the app first writes data.

   **Option B: Use a MongoDB Atlas cluster**

   1. Create an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
   2. Create a new cluster. The free tier is enough for local development.
   3. In Atlas, create a database user with a username and password.
   4. In `Network Access`, add your current IP address, or use `0.0.0.0/0` only for temporary development access.
   5. Click `Connect` on your cluster, choose `Drivers`, and copy the connection string.
   6. Replace `<username>`, `<password>`, and `<dbname>` with your values. A typical example looks like:
      ```
      MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/expense-tracker?retryWrites=true&w=majority
      ```
   7. Save that full string in `backend/.env`.

   **How to create `JWT_SECRET`**

   `JWT_SECRET` should be a long random string that only you know. You can generate one in any of these ways:

   ```bash
   openssl rand -base64 32
   ```

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Example:
   ```
   JWT_SECRET=4c7b8f9f4f8f4e6d0b9f0d3d8e7a1c2f5b6a7d8e9f0a1b2c3d4e5f6a7b8c9d0
   ```

   After updating `.env`, make sure it contains either your local MongoDB URI or your Atlas cluster URI before starting the backend.

5. **Run the backend**
   ```bash
   cd backend
   npm run dev
   ```

6. **Run the frontend**
   ```bash
   cd frontend/expense-tracker
   npm run dev
   ```

The app will be available at `http://localhost:5173` (or whichever port Vite uses).
