const res = (id, message, data = []) => {
    return {status: id, timestamp: Date.now(), message: message, data}
}

module.exports = {
    result: res
}