import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import DashboardLayout from './components/layouts/DashboardLayout'
import Home from './pages/Dashboard/Home'
import Income from './pages/Dashboard/Income'
import Expense from './pages/Dashboard/Expense'
import UserProvider from './context/UserContext'

const App = () => {
  return (
    <UserProvider>
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              border: '1px solid #dcfce7',
              padding: '12px 16px',
              color: '#166534',
            },
          }}
        />
        <Router>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Home />} />
                <Route path="/income" element={<Income />} />
                <Route path="/expense" element={<Expense />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </div>
    </UserProvider>
    
    
  )
}

export default App

const Root = () => {
  const isAuthenticated = !!localStorage.getItem('token')
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
}

const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem('token')
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
