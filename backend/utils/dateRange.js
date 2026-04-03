const startOfDay = (date) => {
    const value = new Date(date)
    value.setHours(0, 0, 0, 0)
    return value
}

const addDays = (date, days) => {
    const value = new Date(date)
    value.setDate(value.getDate() + days)
    return value
}

const normalizeRange = (range) => {
    const value = typeof range === 'string' ? range.toLowerCase() : ''

    if (['day', 'week', 'month', 'year', 'all'].includes(value)) {
        return value
    }

    return 'all'
}

const getRangeBounds = (range) => {
    const now = new Date()
    const today = startOfDay(now)

    switch (normalizeRange(range)) {
        case 'day':
            return {
                startDate: today,
                endDate: addDays(today, 1),
            }
        case 'week': {
            const start = new Date(today)
            start.setDate(today.getDate() - today.getDay())
            return {
                startDate: start,
                endDate: addDays(start, 7),
            }
        }
        case 'month': {
            const start = new Date(today.getFullYear(), today.getMonth(), 1)
            return {
                startDate: start,
                endDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
            }
        }
        case 'year': {
            const start = new Date(today.getFullYear(), 0, 1)
            return {
                startDate: start,
                endDate: new Date(today.getFullYear() + 1, 0, 1),
            }
        }
        default:
            return null
    }
}

const buildDateRangeQuery = (range) => {
    const bounds = getRangeBounds(range)

    if (!bounds) {
        return {}
    }

    return {
        date: {
            $gte: bounds.startDate,
            $lt: bounds.endDate,
        }
    }
}

module.exports = {
    normalizeRange,
    buildDateRangeQuery,
}
