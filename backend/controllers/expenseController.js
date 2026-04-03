const xlsx = require('xlsx')
const Expense = require('../models/Expense')
const {buildDateRangeQuery} = require('../utils/dateRange')
const {parseInputDate} = require('../utils/parseInputDate')

// add expense source
exports.addExpense = async (req, res) => {
    const userId = req.user.id

    try {
        const {icon, category, description, amount, date} = req.body

        if (!category || !amount || !date) {
            return res.status(400).json({message: 'All fields are required'})
        }

        const newExpense = new Expense({
            userId,
            icon,
            category,
            description,
            amount,
            date: parseInputDate(date)
        })

        await newExpense.save()
        res.status(200).json(newExpense)
    } catch (error) {
        res.status(500).json({message: 'Server Error'})
    }
}

// get all expense source
exports.getAllExpense = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({message: 'Not authorized'})
        }

        const userId = req.user.id
        const expense = await Expense.find({
            userId,
            ...buildDateRangeQuery(req.query.range),
        }).sort({date: -1})

        res.json(expense)
    } catch (error) {
        res.status(500).json({message: 'Server Error'})
    }
}

// delete expense source
exports.deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id)
        res.json({message: 'Expense deleted successfully'})
    } catch (error) {
        res.status(500).json({message: 'Server Error'})
    }
}

// download excel
exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id

    try {
        const expense = await Expense.find({
            userId,
            ...buildDateRangeQuery(req.query.range),
        }).sort({date: -1})

        const data = expense.map((item) => ({
            Category: item.category,
            Description: item.description,
            Amount: item.amount,
            Date: item.date
        }))

        const wb = xlsx.utils.book_new()
        const ws = xlsx.utils.json_to_sheet(data)
        xlsx.utils.book_append_sheet(wb, ws, 'Expense')
        xlsx.writeFile(wb, 'expense_details.xlsx')
        res.download('expense_details.xlsx')
    } catch (error) {
        res.status(500).json({message: 'Server Error'})
    }
}
