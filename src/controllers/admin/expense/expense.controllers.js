
const httpStatus = require('http-status')
const response = require('../../../utils/response')
const { ExpenseRepo } = require('../../../database');
const { PaginationHelper, MongoDBQueryBuilder } = require('../../../helpers');
const { DayJS } = require('../../../services');
const { isNumber, isUndefined, pickBy } = require('lodash');
const { ObjectId } = require('mongoose').Types
const Joi = require('joi');

module.exports.createExpense = async (req, res) => {
    req.logger.info('Controllers > Admin > Expense > Create Expense');

    try {
        const { adminAuthData } = req.headers
        const { date, expenseName, expensePaymentMethod, expenseAmount, expenseNotes, expense_number, expenseItemName } = req.body;

        let payload = {
            createdById: adminAuthData.id,
            updatedById: adminAuthData.id,
        }

        if (DayJS(date, 'YYYY/MM/DD', true).isValid() === false) {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid date. It must be in YYYY/MM/DD format.');
        } else {
            payload.date = new Date(date)
        }

        if (expense_number) {
            if (isNaN(expense_number)) {
                return response(res, httpStatus.BAD_REQUEST, 'Expense number must be a number.');
            }

            payload.expense_number = Number(expense_number)
        }

        if (expenseItemName) {
            if (isNaN(expenseItemName)) {
                return response(res, httpStatus.BAD_REQUEST, 'Expense Name required');
            }

            payload.expenseItemName = expenseItemName
        }

        if (!expenseName) {
            return response(res, httpStatus.BAD_REQUEST, 'Name is required.');
        } else {
            payload.expenseName = expenseName
        }


        if (!expensePaymentMethod) {
            return response(res, httpStatus.BAD_REQUEST, 'Payment method is required.');
        } else {
            payload.expensePaymentMethod = expensePaymentMethod
        }

        if (!expenseAmount) {
            return response(res, httpStatus.BAD_REQUEST, 'Expense amount is required.');
        } else if (!isNumber(expenseAmount)) {
            return response(res, httpStatus.BAD_REQUEST, 'Expense amount must be a number.');
        } else if (expenseAmount <= 0) {
            return response(res, httpStatus.BAD_REQUEST, 'Expense amount must be greater than 0.');
        } else {
            payload.expenseAmount = Number(expenseAmount)
        }

        if (expenseNotes) {
            payload.expenseNotes = String(expenseNotes).trim()
        }

        return ExpenseRepo
            .create(payload)
            .then(result => {
                return response(res, httpStatus.CREATED, 'Expense created successfully.', result);
            })
            .catch(error => {
                return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
            })
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
    }
}

module.exports.getExpense = async (req, res) => {
    req.logger.info('Controllers > Admin > Expense > Get Expense');

    try {
        const { id } = pickBy(req.query);

        let findQuery = {}

        if (id) {
            if (!ObjectId.isValid(req.query.id)) {
                return response(res, httpStatus.BAD_REQUEST, 'Invalid invoice id.');
            }

            findQuery._id = new ObjectId(req.query.id)
        }

        const SearchFields = ['_id', 'expense_number', 'expenseName', 'expensePaymentMethod']
        Object.assign(findQuery, MongoDBQueryBuilder.searchTextQuery(req.query.search, SearchFields))

        const pagination = PaginationHelper.getPagination(req.query);
        const SortQuery = MongoDBQueryBuilder.sortQuery(req.query.sort, req.query.sortOrder)
        const CountDocs = await ExpenseRepo.countDocuments(findQuery);
        const PaginationInfo = PaginationHelper.getPaginationInfo(CountDocs, req.query);

        // DB: Find
        return ExpenseRepo
            .find(findQuery)
            .skip(pagination.skip)
            .limit(pagination.limit)
            .sort(SortQuery)
            .lean()
            .then(result => {
                return response(res, httpStatus.OK, 'success', result, undefined, {
                    pagination: PaginationInfo,
                    search_fields: SearchFields
                });
            })
            .catch(error => response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error))
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
    }
}

module.exports.updateExpense = async (req, res) => {
    req.logger.info('Controllers > Admin > Expense > Update Expense');

    try {
        const { adminAuthData } = req.headers
        const { id, date, expenseName, expensePaymentMethod, expenseAmount, expenseNotes, expense_number, expenseItemName } = req.body;

        if (!id || !ObjectId.isValid(id)) {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid expense id.');
        }

        let getExpense = await ExpenseRepo.findOne({ _id: id })

        if (!getExpense) {
            return response(res, httpStatus.NOT_FOUND, 'Expense not found.', { id });
        }

        if (expense_number) {
            if (isNaN(expense_number)) {
                return response(res, httpStatus.BAD_REQUEST, 'Expense number must be a number.');
            }

            let isAnotherExpenseExists = await ExpenseRepo.exists({ expense_number: expense_number, _id: { $ne: getExpense._id } })

            if (isAnotherExpenseExists) {
                return response(res, httpStatus.BAD_REQUEST, `Expense number ${expense_number} already exists for expense.`);
            }

            getExpense.expense_number = expense_number
        }


        getExpense.updatedById = adminAuthData.id

        if (date) {

            if (DayJS(date, 'YYYY/MM/DD', true).isValid() === false) {
                return response(res, httpStatus.BAD_REQUEST, 'Invalid date. It must be in YYYY/MM/DD format.');
            } else {
                getExpense.date = new Date(date)
            }
        }

        if (expenseName) {
            getExpense.expenseName = expenseName
        }

        if (expenseItemName) {
            getExpense.expenseItemName = expenseItemName
        }

        if (!expensePaymentMethod) {
            return response(res, httpStatus.BAD_REQUEST, 'Payment method is required.');
        } else {
            getExpense.expensePaymentMethod = expensePaymentMethod
        }

        let netAmount = expenseAmount || getExpense.expenseAmount
        if (isUndefined(netAmount)) {
            return response(res, httpStatus.BAD_REQUEST, 'Net amount is required.');
        } else if (!isNumber(netAmount)) {
            return response(res, httpStatus.BAD_REQUEST, 'Net amount must be a number.');
        } else if (netAmount <= 0) {
            return response(res, httpStatus.BAD_REQUEST, 'Net amount must be greater than 0.');
        } else {
            getExpense.expenseAmount = Number(netAmount)
        }

        if (expenseNotes) {
            getExpense.expenseNotes = String(expenseNotes).trim()
        }

        getExpense
            .save()
            .then(result => {
                return response(res, httpStatus.OK, 'Expense updated successfully.', result);
            })
            .catch(error => {
                return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
            })
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
    }

}

module.exports.deleteExpense = async (req, res) => {
    req.logger.info('Controllers > Admin > Expense > Delete Expense');

    try {
        const { id } = req.query;

        if (!id || !ObjectId.isValid(id)) {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid Expense id.');
        }

        let getExpense = await ExpenseRepo.findOne({ _id: id })

        if (!getExpense) {
            return response(res, httpStatus.NOT_FOUND, 'Expense not found.', { id });
        }

        getExpense
            .deleteOne()
            .then(() => {
                return response(res, httpStatus.OK, 'Expense deleted successfully.');
            })
            .catch(error => {
                return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
            })
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
    }
}

module.exports.getStats = async (req, res) => {
    req.logger.info('Controllers > Admin > Expense > Get Stats');

    try {
        let query = [
            {
                $match: req.query
            },
            {
                $group: {
                    _id: undefined,
                    expense_number: { $sum: 1 },
                    total_expenseAmount: { $sum: "$expenseAmount" },
                }
            }
        ]

        let result = await ExpenseRepo.aggregate(query)

        return response(res, httpStatus.OK, 'success', result);
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
    }
}