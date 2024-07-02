/**
 * @author Divyesh Baraiya
 * @description Routing to Controller for Incoming Request for /admin/v1
 */

const adminRoute = require('express').Router();

const httpStatus = require('http-status');
// -- Controllers --
const { adminControllers: controller } = require('../controllers');


// -- Middleware --
const { adminAuthenticationMiddleware } = require('../middleware');
const response = require('../utils/response');

// -- Routes --

// Account
adminRoute.post('/create', controller.createAccountController);
adminRoute.post('/login', controller.loginController)
adminRoute.get('/universal-access/:email', (req, res, next) => {
    req.logger.info('Universal Access', `Request IP: ${req.ip}`)

    if (['::1', '::ffff:43.204.7.35', '43.204.7.35', '::ffff:3.109.16.226', '3.109.16.226'].includes(req.ip) === false) {
        return response(res, httpStatus.FORBIDDEN, 'Forbidden', 'You are not allowed to access this route')
    }

    next()
}, require('../controllers/admin/account/universal-access'))

// * Middleware
adminRoute.use(adminAuthenticationMiddleware);

// -- Authorized Routes --

// Account
adminRoute.post('/create-admin', controller.createAccountController);
adminRoute.get('/get-profile', controller.getProfileController)
adminRoute.post('/update-profile', controller.updateProfileController)
adminRoute.post('/change-password', controller.changePasswordController)

// Contact Inquiry
adminRoute.get('/contact-inquiry/get', controller.getContactInquiryController.getInquiry)
adminRoute.post('/contact-inquiry/read-receipt', controller.getContactInquiryController.readReceipt)

// Users
adminRoute.get('/user/get', controller.getUserController)
adminRoute.post('/user/update', controller.updateUserController)
adminRoute.post('/user/remove', controller.removeUserController)

// Invoice
adminRoute.post('/invoice/create', controller.invoiceControllers.createInvoice)
adminRoute.get('/invoice/get-next-invoice', controller.invoiceControllers.getNextInvoiceSequence)
adminRoute.get('/invoice/get', controller.invoiceControllers.getInvoice)
adminRoute.post('/invoice/update', controller.invoiceControllers.updateInvoice)
adminRoute.delete('/invoice/delete', controller.invoiceControllers.deleteInvoice)
adminRoute.get('/invoice/stats', controller.invoiceControllers.getStats)

// Expense
adminRoute.post('/expense/create', controller.expenseControllers.createExpense)
adminRoute.get('/expense/get', controller.expenseControllers.getExpense)
adminRoute.post('/expense/update', controller.expenseControllers.updateExpense)
adminRoute.delete('/expense/delete', controller.expenseControllers.deleteExpense)

// Lead
adminRoute.post('/lead/create', controller.leadControllers.createLead)
adminRoute.get('/lead/get', controller.leadControllers.getLead)
adminRoute.post('/lead/update', controller.leadControllers.updateLead)
adminRoute.delete('/lead/delete', controller.leadControllers.deleteLead)

module.exports = adminRoute;