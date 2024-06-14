// Import Controller and Allocate Route
const adminRoutes = require('./admin.routes')
const usersRoutes = require('./users.routes')
const publicRoutes = require('./public.routes')
const RazorpayRoutes = require('./razorpay.routes')
module.exports = { adminRoutes, usersRoutes, publicRoutes, RazorpayRoutes }