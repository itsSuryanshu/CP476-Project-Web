const Income = require('../models/Income')
const Expense = require('../models/Expense')
const {buildDateRangeQuery, normalizeRange} = require('../utils/dateRange')

exports.getDashboardData = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({message: 'Not authorized'})
        }

        const userId = req.user.id
        const range = normalizeRange(req.query.range)
        const dateQuery = buildDateRangeQuery(range)

        const [income, expenses] = await Promise.all([
            Income.find({userId, ...dateQuery}).sort({date: -1}),
            Expense.find({userId, ...dateQuery}).sort({date: -1}),
        ])

        const totalIncome = income.reduce((sum, item) => sum + Number(item.amount || 0), 0)
        const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)

        const recentTransactions = [
            ...income.map((item) => ({
                id: item._id,
                name: item.source,
                category: item.source,
                date: item.date,
                amount: Number(item.amount || 0),
                type: 'income',
                icon: item.icon || '💰',
            })),
            ...expenses.map((item) => ({
                id: item._id,
                name: item.description || item.category,
                category: item.category,
                date: item.date,
                amount: Number(item.amount || 0) * -1,
                type: 'expense',
                icon: item.icon || '💸',
            })),
        ]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8)

        const incomeBySource = Object.values(
            income.reduce((acc, item) => {
                const key = item.source || 'Other'
                if (!acc[key]) {
                    acc[key] = {name: key, value: 0}
                }
                acc[key].value += Number(item.amount || 0)
                return acc
            }, {})
        )

        const expensesByCategory = Object.values(
            expenses.reduce((acc, item) => {
                const key = item.category || 'Other'
                if (!acc[key]) {
                    acc[key] = {category: key, amount: 0}
                }
                acc[key].amount += Number(item.amount || 0)
                return acc
            }, {})
        )

        res.json({
            range,
            totals: {
                income: totalIncome,
                expense: totalExpense,
                balance: totalIncome - totalExpense,
            },
            recentTransactions,
            incomeBySource,
            expensesByCategory,
        })
    } catch (error) {
        res.status(500).json({message: 'Server Error'})
    }
}
