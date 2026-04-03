import React from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { Wallet, LayoutDashboard, TrendingUp, TrendingDown, LogOut } from 'lucide-react'

const DashboardLayout = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50'>
      <Navigation />
      <Outlet />
    </div>
  )
}

export default DashboardLayout

const Navigation = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  // handle logout
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const userInfo = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = userInfo.fullName
    ? userInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <nav className='bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40'>
      <div className='max-w-7xl mx-auto flex items-center justify-between'>

        <Link to="/dashboard" className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
          <div className='w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center'>
            <Wallet className='w-5 h-5 text-white' />
          </div>
          <span className='text-lg font-semibold text-gray-900'>Expense Tracker</span>
        </Link>

        <div className='flex items-center gap-1'>
          <NavLink to="/dashboard" active={isActive('/dashboard')} icon={<LayoutDashboard className='w-4 h-4' />} label="Dashboard" />
          <NavLink to="/income" active={isActive('/income')} icon={<TrendingUp className='w-4 h-4' />} label="Income" />
          <NavLink to="/expense" active={isActive('/expense')} icon={<TrendingDown className='w-4 h-4' />} label="Expense" />
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={handleLogout}
            className='flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors'
          >
            <LogOut className='w-4 h-4' />
            <span className='hidden sm:inline'>Logout</span>
          </button>

          <div className='w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-sm font-semibold text-green-700 border-2 border-gray-200 ml-1'>
            {initials}
          </div>
        </div>

      </div>
    </nav>
  )
}

const NavLink = ({ to, active, icon, label }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
  >
    {icon}
    <span>{label}</span>
  </Link>
)
