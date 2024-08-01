const Router = require('express').Router();
const GCSControllers = require('./gcs/controllers');

// GCS
Router.get('/gcs/invoice', GCSControllers.getInvoiceInsightsController);
Router.get('/gcs/expense', GCSControllers.getExpenseInsightsController);

module.exports = Router;