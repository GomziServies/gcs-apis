const { Joi, DayJS } = require("../../../../services");
const { InvoiceRepo, ExpenseRepo } = require("../../../../database");
const { pickBy } = require("lodash");
const { getLoggerInstance } = require("../../../../utils");
const LoggerPrefix = 'Controllers > Insights > FG Group > Functions';

/**
 * @author Divyesh Baraiya
 * @param {object} params
 * @param {Date} params.from_date
 * @param {Date} params.to_date
 * @param {string[]} params.email
 * @param {string[]} params.phoneNumber
 * @param {Date} params.createdAt_from
 * @param {Date} params.createdAt_to
 * @param {string[]} params.invoiceAddress
 * @param {string[]} params.item_name
 * @param {string[]} params.payment_method
 * @returns {data: object[], metadata: object}
 */
async function getInvoiceStats(params) {
    const logger = getLoggerInstance(...arguments);
    logger.info('(getInvoiceStats)');
    params = pickBy(params, v => v != '');

    const Schema = Joi.object({
        from_date: Joi.date(),
        to_date: Joi.date(),
        email: Joi.alternatives().try(Joi.string().email(), Joi.array().items(Joi.string().email())),
        phoneNumber: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
        createdAt_from: Joi.date(),
        createdAt_to: Joi.date(),
        invoiceAddress: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
        item_name: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
        payment_method: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())),
    });

    let { error, value } = Schema.validate(params, { stripUnknown: true, convert: true });
    if (error) throw error;
    else params = value;

    let findQuery = {};

    if (params.from_date || params.to_date) {
        findQuery.date = {};
        if (params.from_date) findQuery.date.$gte = params.from_date;
        if (params.to_date) findQuery.date.$lte = params.to_date;
    }

    if (params.email) {
        findQuery.email = { $in: params.email };
    }

    if (params.phoneNumber) {
        findQuery.phoneNumber = { $in: params.phoneNumber };
    }

    if (params.createdAt_from || params.createdAt_to) {
        findQuery.createdAt = {};
        if (params.createdAt_from) findQuery.createdAt.$gte = params.createdAt_from;
        if (params.createdAt_to) findQuery.createdAt.$lte = params.createdAt_to;
    }

    if (params.invoiceAddress) {
        findQuery.invoiceAddress = { $in: params.invoiceAddress };
    }

    if (params.item_name) {
        findQuery["productName.item_name"] = { $in: params.item_name };
    }

    if (params.payment_method) {
        findQuery.payment_method = { $in: params.payment_method };
    }

    let stats = {
        total_invoices: 0,
        total_amount: 0,
        total_paid_amount: 0,
        total_unpaid_amount: 0,
        since_date: null,
        to_date: null,
        since_createdAt: null,
        to_createdAt: null,
    };

    let pipeline = [
        {
            $group: {
                _id: null,
                total_invoices: { $sum: 1 },
                total_amount: { $sum: "$totalPayment" },
                total_paid_amount: { $sum: { $ifNull: ["$paidPayment", 0] } },
                since_date: { $min: "$date" },
                to_date: { $max: "$date" },
                since_createdAt: { $min: "$createdAt" },
                to_createdAt: { $max: "$createdAt" },
                total_unpaid_amount: {
                    $sum: {
                        $cond: {
                            if: { $gte: ["$totalPayment", { $ifNull: ["$paidPayment", 0] }] },
                            then: { $subtract: ["$totalPayment", { $ifNull: ["$paidPayment", 0] }] },
                            else: 0
                        }
                    }
                },
            }
        }
    ];

    if (Object.keys(findQuery).length) {
        pipeline.unshift({ $match: findQuery });
    }

    return InvoiceRepo.aggregate(pipeline).then(data => {
        if (!data || data.length === 0) {
            data = [stats];
        }

        let metadata = {
            generated_at: DayJS().toDate()
        };

        return { data, metadata };
    });
}

module.exports.getInvoiceStats = getInvoiceStats;

/**
 * @author Divyesh Baraiya
 * @param {object} params
 * @param {Date} params.from_date
 * @param {Date} params.to_date
 * @param {Date} params.createdAt_from
 * @param {Date} params.createdAt_to
 * @param {string[]} params.item_name
 * @param {string[]} params.payment_method
 * @returns {data: object[],metadata:object}
 */

async function getExpenseStats(params) {
    const logger = getLoggerInstance(...arguments);
    logger.info(LoggerPrefix, '(getExpenseStats)');

    params = pickBy(params, v => v != '');

    const Schema = Joi.object({
        from_date: Joi.date(),
        to_date: Joi.date(),
        createdAt_from: Joi.date(),
        createdAt_to: Joi.date(),
        payment_method: Joi.alternatives(Joi.string().custom(v => [v]), Joi.array().items(Joi.string())),
    })

    let { error, value } = Schema.validate(params, { stripUnknown: true, convert: true });
    if (error) throw error
    else params = value;

    let findQuery = {};

    if (params.from_date || params.to_date) {
        findQuery.date = {};
        if (params.from_date) findQuery.date.$gte = params.from_date;
        if (params.to_date) findQuery.date.$lte = params.to_date;
    }

    if (params.createdAt_from || params.createdAt_to) {
        findQuery.createdAt = {};
        if (params.createdAt_from) findQuery.createdAt.$gte = params.createdAt_from;
        if (params.createdAt_to) findQuery.createdAt.$lte = params.createdAt_to;
    }

    if (params.payment_method) {
        findQuery.payment_method = { $in: params.payment_method };
    }

    let stats = {
        total_expense: 0,
        total_amount: 0,
        since_date: null,
        to_date: null,
        since_createdAt: null,
        to_createdAt: null,
    }

    let pipeline = [
        {
            $group: {
                _id: null,
                total_expense: { $sum: 1 },
                total_amount: { $sum: "$expenseAmount" },
                since_date: { $min: "$date" },
                to_date: { $max: "$date" },
                since_createdAt: { $min: "$createdAt" },
                to_createdAt: { $max: "$createdAt" },
            }
        }
    ];

    if (Object.keys(findQuery).length) {
        pipeline.unshift({ $match: findQuery })
    }

    return ExpenseRepo.aggregate(pipeline).then(data => {
        data = data;

        if (!data) {
            data = [stats];
        }

        let metadata = {
            generated_at: DayJS().toDate()
        }

        let result = { data, metadata }

        return result
    })
}

module.exports.getExpenseStats = getExpenseStats;