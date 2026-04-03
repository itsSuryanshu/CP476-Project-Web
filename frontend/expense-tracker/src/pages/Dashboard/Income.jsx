import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, TrendingUp, Calendar, Download, Trash2, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
        acc[key] = { label: key, Income: 0 }
      }
      acc[key].Income += Number(item.amount || 0)
      return acc
    }, {})

  return Object.values(buckets)
}

const normalizeIncomeItem = (item) => ({
  id: item?._id || item?.id || `${item?.source || 'income'}-${item?.date || Date.now()}`,
  icon: item?.icon || '💰',
  source: item?.source || 'Untitled income',
  amount: Number(item?.amount || 0),
  date: item?.date || new Date().toISOString(),
})

const Income = () => {
  const [timePeriod, setTimePeriod] = useState('year')
  const [showModal, setShowModal] = useState(false)
  const [emoji, setEmoji] = useState('💰')
  const [incomeSource, setIncomeSource] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [incomeData, setIncomeData] = useState([])

  const commonEmojis = ['💰', '💵', '💸', '💳', '🏦', '💼', '📊', '📈', '⭐']

  const fetchIncome = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME, {
        params: { range: timePeriod },
      })
      const records = Array.isArray(response.data) ? response.data.map(normalizeIncomeItem) : []
      setIncomeData(records)
    } catch (fetchError) {
      console.error('Income fetch failed:', fetchError)
      setIncomeData([])
      setError('')
    } finally {
      setLoading(false)
    }
  }, [timePeriod])

  useEffect(() => {
    fetchIncome()
  }, [fetchIncome])

  const chartData = useMemo(() => buildChartData(incomeData), [incomeData])
  const totalIncome = useMemo(() => incomeData.reduce((sum, item) => sum + Number(item.amount || 0), 0), [incomeData])

  const resetForm = () => {
    setEmoji('💰')
    setIncomeSource('')
    setAmount('')
    setDate('')
    setError('')
  }

  const handleAddIncome = async () => {
    if (!incomeSource.trim()) { setError('Please enter an income source'); return }
    if (!amount || isNaN(amount) || Number(amount) <= 0) { setError('Please enter a valid amount'); return }
    if (!date) { setError('Please select a date'); return }

    setSubmitting(true)
    setError('')

    try {
      await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
        icon: emoji,
        source: incomeSource.trim(),
        amount: Number(amount),
        date,
      })
      resetForm()
      setShowModal(false)
      toast.success('Income added successfully')
      fetchIncome()
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to add income right now.')
      toast.error(submitError.response?.data?.message || 'Unable to add income right now.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id))
      setIncomeData((prev) => prev.filter((item) => item.id !== id))
      toast.success('Income deleted successfully')
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Unable to delete this income entry.')
      toast.error(deleteError.response?.data?.message || 'Unable to delete this income entry.')
    }
  }

  const handleDownload = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INCOME, {
        params: { range: timePeriod },
        responseType: 'blob',
      })
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', 'income_details.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
      toast.success('Income download started')
    } catch (downloadError) {
      setError(downloadError.response?.data?.message || 'Unable to download income data.')
      toast.error(downloadError.response?.data?.message || 'Unable to download income data.')
    }
  }

  return (
    <div className='min-h-screen p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-1'>Income</h1>
            <p className='text-sm text-gray-500'>Track your income sources</p>
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

            <button onClick={handleDownload} className='flex items-center gap-2 px-4 py-2 text-sm font-medium border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors'>
              <Download className='w-4 h-4' /> Download Excel
            </button>

            <button onClick={() => setShowModal(true)} className='flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'>
              <Plus className='w-4 h-4' /> Add Income
            </button>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
          <div className='flex items-center justify-between mb-2'>
            <p className='text-sm font-medium text-gray-500'>Total Income</p>
            <div className='w-11 h-11 bg-green-100 rounded-lg flex items-center justify-center'>
              <TrendingUp className='w-5 h-5 text-green-600' />
            </div>
          </div>
          <div className='text-4xl font-bold text-green-600'>{formatCurrency(totalIncome)}</div>
          <p className='text-sm text-gray-400 mt-1'>{getRangeLabel(timePeriod)}</p>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6'>
          <h3 className='font-semibold text-gray-900 mb-4'>Income Overview</h3>
          <ResponsiveContainer width='100%' height={280}>
            <BarChart data={chartData}>
              <XAxis dataKey='label' tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey='Income' fill='#10b981' radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
          <h3 className='font-semibold text-gray-900 mb-4'>Income Transactions</h3>

          {loading ? (
            <div className='text-center py-10 text-gray-400'>Loading income data...</div>
          ) : incomeData.length === 0 ? (
            <div className='text-center py-10 text-gray-400'>
              <TrendingUp className='w-10 h-10 mx-auto mb-2 opacity-40' />
              <p className='text-sm'>No income entries found for this range.</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {incomeData.map((income) => (
                <div key={income.id} className='flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl'>
                      {income.icon || '💰'}
                    </div>
                    <div>
                      <p className='font-semibold text-gray-900'>{income.source}</p>
                      <span className='text-sm text-gray-400 flex items-center gap-1'>
                        <Calendar className='w-3 h-3' /> {formatDate(income.date)}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className='text-xl font-bold text-green-600'>+{formatCurrency(income.amount)}</span>
                    <button
                      onClick={() => handleDelete(income.id)}
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
        <AddIncomeModal
          emoji={emoji}
          setEmoji={setEmoji}
          incomeSource={incomeSource}
          setIncomeSource={setIncomeSource}
          amount={amount}
          setAmount={setAmount}
          date={date}
          setDate={setDate}
          error={error}
          commonEmojis={commonEmojis}
          onAdd={handleAddIncome}
          onClose={() => { setShowModal(false); resetForm() }}
          submitting={submitting}
        />
      )}
    </div>
  )
}

export default Income

const AddIncomeModal = ({ emoji, setEmoji, incomeSource, setIncomeSource, amount, setAmount, date, setDate, error, commonEmojis, onAdd, onClose, submitting }) => (
  <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
    <div className='absolute inset-0 bg-black/50' onClick={onClose} />
    <div className='relative z-10 bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-semibold text-gray-900'>Add New Income</h2>
        <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
          <X className='w-5 h-5' />
        </button>
      </div>
      <p className='text-sm text-gray-500 mb-5'>Add a new income transaction to track your earnings.</p>

      <div className='space-y-4'>
        <div>
          <label className='text-sm font-medium text-gray-700 mb-2 block'>Choose an Emoji</label>
          <div className='flex gap-2 flex-wrap'>
            {commonEmojis.map((item) => (
              <button
                key={item}
                type='button'
                onClick={() => setEmoji(item)}
                className={`text-2xl w-11 h-11 rounded-lg border-2 transition-all hover:scale-105 ${emoji === item ? 'border-green-600 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700 mb-1.5 block'>Income Source</label>
          <input
            placeholder='e.g., Salary, Freelance, Investment'
            value={incomeSource}
            onChange={({ target }) => setIncomeSource(target.value)}
            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500'
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
              className='w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500'
            />
          </div>
        </div>

        <div>
          <label className='text-sm font-medium text-gray-700 mb-1.5 block'>Date</label>
          <input
            type='date'
            value={date}
            onChange={({ target }) => setDate(target.value)}
            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500'
          />
        </div>

        {error && <p className='text-red-500 text-xs'>{error}</p>}
      </div>

      <div className='flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100'>
        <button onClick={onClose} className='px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'>
          Cancel
        </button>
        <button onClick={onAdd} disabled={submitting} className='px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60'>
          {submitting ? 'Saving...' : 'Add Income'}
        </button>
      </div>
    </div>
  </div>
)
