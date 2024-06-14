/**
 * @author Divyesh Baraiya
 * @description Export Admin Controllers
 */

// Account Controllers
module.exports.createAccountController = require('./account/create-user')
module.exports.loginController = require('./account/login')
module.exports.getProfileController = require('./account/get-profile')
module.exports.updateProfileController = require('./account/update-profile')
module.exports.changePasswordController = require('./account/change-password')

// // Contact Inquiry Info
module.exports.getContactInquiryController = require('./contact-inquiry/get-inquiry')

// User
module.exports.getUserController = require('./users/get-user')
module.exports.updateUserController = require('./users/update-user')
module.exports.removeUserController = require('./users/remove-user')

// Orders
// module.exports.getOrdersController = require('./orders/get-order')
// module.exports.getPaymentController = require('./orders/get-order-payment')
// module.exports.updateOrderController = require('./orders/update-order')


// Invoice
module.exports.invoiceControllers = require('./invoice/invoice.controllers')

// Expense
module.exports.expenseControllers = require('./expense/expense.controllers')

// Lead
module.exports.leadControllers = require('./lead/lead.controllers')

