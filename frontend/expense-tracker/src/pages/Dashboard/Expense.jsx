import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, TrendingDown, Calendar, Download, Trash2, X } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import toast from 'react-hot-toast'

const RANGE_OPTIONS = [
  { value: 'year', label: 'This Year' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

const formatCurrency = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const formatDate = (value) => new Date(value).toLocaleDateString()
const getRangeLabel = (range) => RANGE_OPTIONS.find((option) => option.value === range)?.label || 'Selected Range'

const buildChartData = (items) => {
  const buckets = items
    .slice()
    .reverse()
    .reduce((acc, item) => {
      const key = new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      if (!acc[key]) {
        acc[key] = { label: key, Spending: 0 }
      }
      acc[key].Spending += Number(item.amount || 0)
      return acc
    }, {})

  return Object.values(buckets)
}

const normalizeExpenseItem = (item) => ({
  id: item?._id || item?.id || `${item?.category || 'expense'}-${item?.date || Date.now()}`,
  icon: item?.icon || '💸',
  category: item?.category || 'Untitled expense',
  description: item?.description || '',
  amount: Number(item?.amount || 0),
  date: item?.date || new Date().toISOString(),
})

const Expense = () => {
  const [timePeriod, setTimePeriod] = useState('year')
  const [showModal, setShowModal] = useState(false)
  const [emoji, setEmoji] = useState('🛒')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [expenseData, setExpenseData] = useState([])

  const commonEmojis = ['🛒', '🍔', '🚗', '🏠', '🎬', '👕', '🎮', '✈️', '💊']

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE, {
        params: { range: timePeriod },
      })
      const records = Array.isArray(response.data) ? response.data.map(normalizeExpenseItem) : []
      setExpenseData(records)
    } catch (fetchError) {
      console.error('Expense fetch failed:', fetchError)
      setExpenseData([])
      setError('')
    } finally {
      setLoading(false)
    }
  }, [timePeriod])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const chartData = useMemo(() => buildChartData(expenseData), [expenseData])
  const totalExpenses = useMemo(() => expenseData.reduce((sum, item) => sum + Number(item.amount || 0), 0), [expenseData])

  const resetForm = () => {
    setEmoji('🛒')
    setCategory('')
    setDescription('')
    setAmount('')
    setDate('')
    setError('')
  }

  const handleAddExpense = async () => {
    if (!category.trim()) { setError('Please enter a category'); return }
    if (!amount || isNaN(amount) || Number(amount) <= 0) { setError('Please enter a valid amount'); return }
    if (!date) { setError('Please select a date'); return }

    setSubmitting(true)
    setError('')

    try {
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        icon: emoji,
        category: category.trim(),
        description: description.trim(),
        amount: Number(amount),
        date,
      })
      resetForm()
      setShowModal(false)
      toast.success('Expense added successfully')
      fetchExpenses()
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to add expense right now.')
      toast.error(submitError.response?.data?.message || 'Unable to add expense right now.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id))
      setExpenseData((prev) => prev.filter((item) => item.id !== id))
      toast.success('Expense deleted successfully')
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Unable to delete this expense entry.')
      toast.error(deleteError.response?.data?.message || 'Unable to delete this expense entry.')
    }
  }

  const handleDownload = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE, {
        params: { range: timePeriod },
        responseType: 'blob',
      })
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', 'expense_details.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
      toast.success('Expense download started')
    } catch (downloadError) {
      setError(downloadError.response?.data?.message || 'Unable to download expense data.')
      toast.error(downloadError.response?.data?.message || 'Unable to download expense data.')
    }
  }

  return (
    <div className='min-h-screen p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-1'>Expenses</h1>
            <p className='text-sm text-gray-500'>Track your spending</p>
          </div>
          <div className='flex items-center gap-3'>
            <select
              value={timePeriod}
              onChange={({ target }) => setTimePeriod(target.value)}
              className='text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-green-500'
            >
              {RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <button onClick={handleDownload} className='flex items-center gap-2 px-4 py-2 text-sm font-medium border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors'>
              <Download className='w-4 h-4' /> Download Excel
            </button>

            <button onClick={() => setShowModal(true)} className='flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'>
              <Plus className='w-4 h-4' /> Add Expense
            </button>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm font-medium text-gray-500'>Total Expenses</p>
            <div className='w-11 h-11 bg-red-100 rounded-lg flex items-center justify-center'>
              <TrendingDown className='w-5 h-5 text-red-600' />
            </div>
          </div>
          <div className='text-4xl font-bold text-red-600'>{formatCurrency(totalExpenses)}</div>
          <p className='text-sm text-gray-400 mt-1'>{getRangeLabel(timePeriod)}</p>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
          <h3 className='font-semibold text-gray-900 mb-4'>Spending Trend</h3>
          <ResponsiveContainer width='100%' height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis dataKey='label' tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type='monotone' dataKey='Spending' stroke='#ef4444' strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <h3 className='font-semibold text-gray-900 mb-4'>Expense Transactions</h3>

          {loading ? (
            <div className='text-center py-10 text-gray-400'>Loading expense data...</div>
          ) : expenseData.length === 0 ? (
            <div className='text-center py-10 text-gray-400'>
              <TrendingDown className='w-10 h-10 mx-auto mb-2 opacity-40' />
              <p className='text-sm'>No expense entries found for this range.</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {expenseData.map((expense) => (
                <div key={expense.id} className='flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl'>
                      {expense.icon || '💸'}
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900'>{expense.description || expense.category}</p>
                      {expense.description && (
                        <p className='text-sm text-gray-500'>{expense.category}</p>
                      )}
                      <span className='text-sm text-gray-400 flex items-center gap-1'>
                        <Calendar className='w-3 h-3' /> {formatDate(expense.date)}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className='text-xl font-bold text-red-600'>-{formatCurrency(expense.amount)}</span>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className='opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className='text-sm text-red-500 mt-4'>{error}</p>}
      </div>

      {showModal && (
        <AddExpenseModal
          emoji={emoji}
          setEmoji={setEmoji}
          category={category}
          setCategory={setCategory}
          description={description}
          setDescription={setDescription}
          amount={amount}
          setAmount={setAmount}
          date={date}
          setDate={setDate}
          error={error}
          commonEmojis={commonEmojis}
          onAdd={handleAddExpense}
          onClose={() => { setShowModal(false); resetForm() }}
          submitting={submitting}
        />
      )}
    </div>
  )
}

export default Expense

const AddExpenseModal = ({ emoji, setEmoji, category, setCategory, description, setDescription, amount, setAmount, date, setDate, error, commonEmojis, onAdd, onClose, submitting }) => (
  <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
    <div className='absolute inset-0 bg-black/50' onClick={onClose} />
    <div className='relative z-10 bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold text-gray-900'>Add New Expense</h2>
        <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
          <X className='w-5 h-5' />
        </button>
      </div>
      <p className='text-sm text-gray-500 mb-5'>Add a new expense transaction to track your spending.</p>

      <div className='space-y-4'>
        <div>
          <label className='text-sm font-medium text-gray-700 mb-2 block'>Choose an Emoji</label>
          <div className='flex gap-2 flex-wrap'>
            {commonEmojis.map((item) => (
              <button
                key={item}
                type='button'
                onClick={() => setEmoji(item)}
                className={`text-2xl w-11 h-11 rounded-lg border-2 transition-all hover:scale-105 ${emoji === item ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700 mb-1.5 block'>Category</label>
          <input
            placeholder='e.g., Food, Transportation, Utilities'
            value={category}
            onChange={({ target }) => setCategory(target.value)}
            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500'
          />
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700 mb-1.5 block'>Description</label>
          <input
            placeholder='e.g., McDonalds, Uber to work, Hydro bill'
            value={description}
            onChange={({ target }) => setDescription(target.value)}
            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500'
          />
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700 mb-1.5 block'>Amount</label>
          <div className='relative'>
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm'>$</span>
            <input
              type='number'
              placeholder='0.00'
              value={amount}
              onChange={({ target }) => setAmount(target.value)}
              className='w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500'
            />
          </div>
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700 mb-1.5 block'>Date</label>
          <input
            type='date'
            value={date}
            onChange={({ target }) => setDate(target.value)}
            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500'
          />
        </div>

        {error && <p className='text-red-500 text-xs'>{error}</p>}
      </div>

      <div className='flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100'>
        <button onClick={onClose} className='px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'>
          Cancel
        </button>
        <button onClick={onAdd} disabled={submitting} className='px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60'>
          {submitting ? 'Saving...' : 'Add Expense'}
        </button>
      </div>
    </div>
  </div>
)
