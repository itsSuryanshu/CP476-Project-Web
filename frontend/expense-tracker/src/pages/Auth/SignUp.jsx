import React, { useContext, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Wallet, Mail, Lock, User, ArrowRight, Camera, PieChart, TrendingUp } from 'lucide-react'
import { validateEmail } from '../../utils/helper'
import { API_PATHS } from '../../utils/apiPaths'
import axiosInstance from '../../utils/axiosInstance'
import { UserContext } from '../../context/UserContext'

const SignUp = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const {updateUser} = useContext(UserContext)

  // handle sign up form submit
  const handleSignUp = async (e) => {
    e.preventDefault()

    let profileImageUrl = ""

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!password) {
      setError('Please enter the password')
      return
    }

    setError('')

    // Signup API Call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        fullName: name.trim(),
        email,
        password,
        profileImageUrl,
      })

      const {token, user} = response.data

      if (token) {
        localStorage.setItem("token", token)
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

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProfilePhoto(reader.result)
      reader.readAsDataURL(file)
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
              <FeatureCard icon={<TrendingUp className='w-6 h-6 text-white' />} title="Smart Analytics" description="Track trends and get personalized recommendations" />
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
                  <h2 className='text-2xl font-bold text-gray-900 mb-2'>Create Account</h2>
                  <p className='text-gray-600'>Start tracking your expenses today</p>
                </div>

                <form onSubmit={handleSignUp} className='space-y-5' noValidate>
                  <div className='flex justify-center'>
                    <div className='relative'>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className='w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg hover:shadow-xl transition-shadow group'
                      >
                        {profilePhoto
                          ? <img src={profilePhoto} alt="Profile" className='w-full h-full object-cover' />
                          : <User className='w-12 h-12 text-emerald-600' />
                        }
                        <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                          <Camera className='w-6 h-6 text-white' />
                        </div>
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className='hidden' />
                    </div>
                  </div>

                  <div>
                    <label className='block mb-2 text-sm font-medium text-gray-700'>Full Name</label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                      <input
                        type="text"
                        value={name}
                        onChange={({ target }) => setName(target.value)}
                        placeholder="Enter your full name"
                        className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
                      />
                    </div>
                  </div>

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
                        placeholder="Create a password"
                        className='w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all'
                      />
                    </div>
                  </div>

                  {error && <p className='text-red-500 text-sm'>⚠ {error}</p>}

                  <button
                    type="submit"
                    className='w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg flex items-center justify-center gap-2 group'
                  >
                    Sign Up
                    <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                  </button>
                </form>

                <div className='mt-6 text-center'>
                  <p className='text-gray-600 text-sm'>
                    Already have an account?{' '}
                    <Link to="/login" className='text-emerald-600 hover:text-emerald-700 font-semibold'>Login</Link>
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

export default SignUp

const FeatureCard = ({ icon, title, description }) => (
  <div className='flex items-start gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-shadow'>
    <div className='flex-shrink-0 p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg'>{icon}</div>
    <div>
      <h3 className='font-semibold text-gray-900 mb-1'>{title}</h3>
      <p className='text-sm text-gray-600'>{description}</p>
    </div>
  </div>
)
