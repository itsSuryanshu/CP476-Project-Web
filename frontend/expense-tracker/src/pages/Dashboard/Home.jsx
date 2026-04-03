import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'

const RANGE_OPTIONS = [
  { value: 'year', label: 'This Year' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4']
const BAR_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#ec4899', '#06b6d4']
const formatCurrency = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const formatDate = (value) => new Date(value).toLocaleDateString()
const getRangeLabel = (range) => RANGE_OPTIONS.find((option) => option.value === range)?.label || 'Selected Range'

const Home = () => {
  const navigate = useNavigate()
  const [timePeriod, setTimePeriod] = useState('year')
  const [dashboardData, setDashboardData] = useState({
    totals: { income: 0, expense: 0, balance: 0 },
    recentTransactions: [],
    incomeBySource: [],
    expensesByCategory: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.GET_DATA, {
        params: { range: timePeriod },
      })
      setDashboardData(response.data)
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Unable to load dashboard data right now.')
    } finally {
      setLoading(false)
    }
  }, [timePeriod])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const financialOverviewData = useMemo(() => ([
    { name: 'Income', value: dashboardData.totals.income, color: '#10b981' },
    { name: 'Expenses', value: dashboardData.totals.expense, color: '#ef4444' },
    { name: 'Balance', value: dashboardData.totals.balance, color: '#3b82f6' },
  ]), [dashboardData.totals])

  const incomeSourcesData = useMemo(() => (
    dashboardData.incomeBySource.map((item, index) => ({
      ...item,
      color: PIE_COLORS[index % PIE_COLORS.length],
    }))
  ), [dashboardData.incomeBySource])

  const expensesByCategory = useMemo(() => (
    dashboardData.expensesByCategory.map((item, index) => ({
      ...item,
      color: BAR_COLORS[index % BAR_COLORS.length],
    }))
  ), [dashboardData.expensesByCategory])

  return (
    <div className='min-h-screen p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-1'>Welcome back!</h1>
            <p className='text-sm text-gray-500'>Here&apos;s your financial overview for {getRangeLabel(timePeriod).toLowerCase()}.</p>
          </div>
          <select
            value={timePeriod}
            onChange={({ target }) => setTimePeriod(target.value)}
            className='text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-green-500'
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mb-8'>
          <StatCard title='Total Balance' value={formatCurrency(dashboardData.totals.balance)} sub={getRangeLabel(timePeriod)} icon={<Wallet className='w-5 h-5 text-blue-600' />} iconBg='bg-blue-100' valueColor='text-blue-600' />
          <StatCard title='Total Income' value={formatCurrency(dashboardData.totals.income)} sub={getRangeLabel(timePeriod)} icon={<TrendingUp className='w-5 h-5 text-green-600' />} iconBg='bg-green-100' valueColor='text-green-600' />
          <StatCard title='Total Expenses' value={formatCurrency(dashboardData.totals.expense)} sub={getRangeLabel(timePeriod)} icon={<TrendingDown className='w-5 h-5 text-red-600' />} iconBg='bg-red-100' valueColor='text-red-600' />
        </div>

        {loading ? (
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-400'>Loading dashboard data...</div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-gray-900'>Recent Transactions</h3>
                <button onClick={() => navigate('/expense')} className='flex items-center gap-1 text-sm text-green-600 hover:text-green-700'>
                  See All <ArrowRight className='w-4 h-4' />
                </button>
              </div>
              <div className='space-y-3'>
                {dashboardData.recentTransactions.length === 0 ? (
                  <p className='text-sm text-gray-400'>No transactions found for this range.</p>
                ) : dashboardData.recentTransactions.map((transaction) => (
                  <div key={`${transaction.type}-${transaction.id}`} className='flex items-center justify-between py-1'>
                    <div className='flex items-center gap-3'>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {transaction.type === 'income'
                          ? <ArrowUpRight className='w-5 h-5 text-green-600' />
                          : <ArrowDownRight className='w-5 h-5 text-red-600' />}
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>{transaction.name}</p>
                        <p className='text-xs text-gray-400'>{formatDate(transaction.date)} · {transaction.category}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='font-semibold text-gray-900 mb-4'>Financial Overview</h3>
              <ResponsiveContainer width='100%' height={220}>
                <PieChart>
                  <Pie data={financialOverviewData} cx='50%' cy='50%' innerRadius={55} outerRadius={85} paddingAngle={5} dataKey='value'>
                    {financialOverviewData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className='mt-3 space-y-2'>
                {financialOverviewData.map((item) => (
                  <div key={item.name} className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='w-2.5 h-2.5 rounded-full' style={{ backgroundColor: item.color }} />
                      <span className='text-sm text-gray-600'>{item.name}</span>
                    </div>
                    <span className='text-sm font-semibold text-gray-900'>{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <h3 className='font-semibold text-gray-900 mb-4'>Expenses Breakdown</h3>
              <ResponsiveContainer width='100%' height={220}>
                <BarChart data={expensesByCategory}>
                  <XAxis dataKey='category' tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey='amount' radius={[6, 6, 0, 0]}>
                    {expensesByCategory.map((entry) => <Cell key={entry.category} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className='mt-4 space-y-2'>
                <p className='text-sm font-semibold text-gray-800'>By Category</p>
                {expensesByCategory.length === 0 ? (
                  <p className='text-sm text-gray-400'>No expense categories found for this range.</p>
                ) : expensesByCategory.map((item) => (
                  <div key={item.category} className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='w-2.5 h-2.5 rounded-full' style={{ backgroundColor: item.color }} />
                      <span className='text-sm text-gray-600'>{item.category}</span>
                    </div>
                    <span className='text-sm font-semibold text-gray-900'>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-gray-900'>Income Sources</h3>
                <button onClick={() => navigate('/income')} className='flex items-center gap-1 text-sm text-green-600 hover:text-green-700'>
                  See All <ArrowRight className='w-4 h-4' />
                </button>
              </div>
              <ResponsiveContainer width='100%' height={220}>
                <PieChart>
                  <Pie data={incomeSourcesData} cx='50%' cy='50%' outerRadius={85} dataKey='value'>
                    {incomeSourcesData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className='mt-3 space-y-2'>
                {incomeSourcesData.length === 0 ? (
                  <p className='text-sm text-gray-400'>No income sources found for this range.</p>
                ) : incomeSourcesData.map((item) => (
                  <div key={item.name} className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='w-2.5 h-2.5 rounded-full' style={{ backgroundColor: item.color }} />
                      <span className='text-sm text-gray-600'>{item.name}</span>
                    </div>
                    <span className='text-sm font-semibold text-gray-900'>{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && <p className='text-sm text-red-500 mt-4'>{error}</p>}
      </div>
    </div>
  )
}

export default Home

const StatCard = ({ title, value, sub, icon, iconBg, valueColor }) => (
  <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
    <div className='flex items-center justify-between mb-3'>
      <p className='text-sm font-medium text-gray-500'>{title}</p>
      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>{icon}</div>
    </div>
    <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
    <p className='text-xs text-gray-400 mt-1'>{sub}</p>
  </div>
)
