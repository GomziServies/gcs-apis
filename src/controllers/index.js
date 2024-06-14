// Export All Controller
const adminControllers = require('./admin')
const usersControllers = require('./users')
const publicControllers = require('./public')
const razorpayController = require('./razorpay')

module.exports = { adminControllers, usersControllers, publicControllers, razorpayController }