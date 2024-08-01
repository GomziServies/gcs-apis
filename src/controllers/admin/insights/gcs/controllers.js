const { pickBy } = require('lodash');
const GCSFunctions = require('./functions');
const response = require('../../../../utils/response');
const httpStatus = require('http-status');
const { getLoggerInstance } = require('../../../../utils');
const LoggerPrefix = 'Controllers > Insights > FG Group > Controllers';

module.exports.getInvoiceInsightsController = function (req, res) {
    const logger = getLoggerInstance(req);

    logger.info(LoggerPrefix, '(getInvoiceStatsController)')

    const params = pickBy(req.query);

    GCSFunctions.getInvoiceStats(params, logger)
        .then((result) => {
            return response(res, httpStatus.OK, 'success', result.data, undefined, result.metadata)
        })
        .catch((error) => response(res, error));
}

module.exports.getExpenseInsightsController = function (req, res) {
    const logger = getLoggerInstance(req);

    logger.info(LoggerPrefix, '(getExpenseInsightsController)')

    const params = pickBy(req.query);

    GCSFunctions.getExpenseStats(params, logger)
        .then((result) => {
            return response(res, httpStatus.OK, 'success', result.data, undefined, result.metadata)
        })
        .catch((error) => response(res, error));
}