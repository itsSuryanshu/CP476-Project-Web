import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wallet, Mail, Lock, ArrowRight, PieChart, TrendingUp } from 'lucide-react'
import { validateEmail } from '../../utils/helper'
import { API_PATHS } from '../../utils/apiPaths'
import axiosInstance from '../../utils/axiosInstance'
import { UserContext } from '../../context/UserContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const {updateUser} = useContext(UserContext)
  const navigate = useNavigate()

  // handle login form submit
  const handleLogin = async (e) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!password) {
      setError('Please enter the password')
      return
    }

    setError('')

    // Login API Call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {email, password})
      const {token, user} = response.data

      if(token){
        localStorage.setItem('token', token)
        updateUser(user)
        navigate('/dashboard')
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message)
      } else {
        setError("Something went wrong. Please try again.")
      }
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'>

      <header className='bg-white/80 backdrop-blur-sm shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <Link to="/" className='flex items-center gap-3'>
            <div className='p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg'>
              <Wallet className='w-6 h-6 text-white' />
            </div>
            <span className='text-lg font-semibold text-gray-900'>ExpenseTracker</span>
          </Link>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>

          <div className='space-y-8'>
            <div>
              <h1 className='text-4xl font-bold text-gray-900 mb-4 leading-tight'>
                Take Control of Your{' '}
                <span className='bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent'>
                  Financial Future
                </span>
              </h1>
              <p className='text-xl text-gray-600'>
                Track expenses, visualize spending habits, and achieve your financial goals with our intuitive expense tracker.
              </p>
            </div>

            <div className='grid sm:grid-cols-2 gap-4'>
              <FeatureCard icon={<PieChart className='w-6 h-6 text-white' />} title="Visual Insights" description="Beautiful charts and graphs to understand your spending" />
              <FeatureCard icon={<TrendingUp className='w-6 h-6 text-white' />} title="Intuitive Inputs" description="Easy income and expense inputs with just a click of a button" />
            </div>

            <div className='hidden lg:block rounded-2xl overflow-hidden shadow-2xl'>
              <img
                src="https://images.unsplash.com/photo-1758518728641-8668e601cce1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
                alt="Financial planning"
                className='w-full h-64 object-cover'
                onError={({ target }) => target.style.display = 'none'}
              />
            </div>
          </div>

          <div className='flex justify-center lg:justify-end'>
            <div className='w-full max-w-md'>
              <div className='bg-white rounded-2xl shadow-2xl p-8'>
                <div className='mb-8 text-center'>
                  <h2 className='text-2xl font-bold text-gray-900 mb-2'>Welcome Back</h2>
                  <p className='text-gray-600'>Sign in to manage your expenses</p>
                </div>

                <form onSubmit={handleLogin} className='space-y-5' noValidate>
                  <div>
                    <label className='block mb-2 text-sm font-medium text-gray-700'>Email Address</label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                      <input
                        type="email"
                        value={email}
                        onChange={({ target }) => setEmail(target.value)}
                        placeholder="Enter your email"
                        className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block mb-2 text-sm font-medium text-gray-700'>Password</label>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                      <input
                        type="password"
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                        placeholder="Enter your password"
                        className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
                      />
                    </div>
                  </div>

                  {error && <p className='text-red-500 text-sm'>⚠ {error}</p>}

                  <button
                    type="submit"
                    className='w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg flex items-center justify-center gap-2 group'
                  >
                    Login
                    <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </button>
                </form>

                <div className='mt-6 text-center'>
                  <p className='text-gray-600 text-sm'>
                    Don't have an account?{' '}
                    <Link to="/signup" className='text-emerald-600 hover:text-emerald-700 font-semibold'>Sign Up</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}

export default Login

const FeatureCard = ({ icon, title, description }) => (
  <div className='flex items-start gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-shadow'>
    <div className='flex-shrink-0 p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg'>{icon}</div>
    <div>
      <h3 className='font-semibold text-gray-900 mb-1'>{title}</h3>
      <p className='text-sm text-gray-600'>{description}</p>
    </div>
  </div>
)
