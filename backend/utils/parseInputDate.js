const parseInputDate = (value) => {
    if (typeof value !== 'string') {
        return new Date(value)
    }

    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)

    if (!match) {
        return new Date(value)
    }

    const [, year, month, day] = match
    return new Date(Number(year), Number(month) - 1, Number(day))
}

module.exports = {
    parseInputDate,
}
