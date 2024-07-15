
const httpStatus = require('http-status')
const response = require('../../../utils/response')
const { InvoiceRepo } = require('../../../database');
const { PaginationHelper, MongoDBQueryBuilder } = require('../../../helpers');
const { DayJS } = require('../../../services');
const { regexValidateUtil } = require('../../../utils');
const { isArray, isObject, isNumber, isUndefined, pickBy } = require('lodash');
const { ObjectId } = require('mongoose').Types
const Joi = require('joi');


let _exampleProduct = [{ item_name: "Example Product", amount: 1000, totalAmount: 2000, quantity: 2 }]

module.exports.createInvoice = async (req, res) => {
    req.logger.info('Controllers > Admin > Invoice > Create Invoice');

    try {
        const { adminAuthData } = req.headers
        const { date, fullName, email, phoneNumber, invoiceAddress, items, paidPayment, invoiceNotes, invoice_number, termCondition, totalPayment, payment_method } = req.body;

        let payload = {
            createdById: adminAuthData.id,
            updatedById: adminAuthData.id,
            invoice_number: getNextInvoiceSequence()
        }

        if (DayJS(date, 'YYYY/MM/DD', true).isValid() === false) {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid date. It must be in YYYY/MM/DD format.');
        } else {
            payload.date = new Date(date)
        }

        if (invoice_number) {
            if (isNaN(invoice_number)) {
                return response(res, httpStatus.BAD_REQUEST, 'Invoice number must be a number.');
            }

            let isAnotherInvoiceExists = await InvoiceRepo.exists({ invoice_number: invoice_number })

            if (isAnotherInvoiceExists) {
                return response(res, httpStatus.BAD_REQUEST, `Invoice number ${invoice_number} already exists for invoice.`);
            }

            payload.invoice_number = Number(invoice_number)
        }

        if (!fullName) {
            return response(res, httpStatus.BAD_REQUEST, 'Name is required.');
        } else {
            payload.fullName = fullName
        }

        if (email) {
            if (regexValidateUtil.email(email) === false) {
                return response(res, httpStatus.BAD_REQUEST, 'Invalid email.');
            }

            payload.email = email
        }

        if (phoneNumber) {
            payload.phoneNumber = phoneNumber
        }
        if (invoiceAddress) {
            payload.invoiceAddress = invoiceAddress
        }

        if (items) {
            if (!isArray(items)) {
                return response(res, httpStatus.BAD_REQUEST, 'Products must be an array.', { example: _exampleProduct });
            }

            payload.productName = []

            for (let item of items) {
                let _obj = {}

                if (!item.item_name) {
                    return response(res, httpStatus.BAD_REQUEST, 'Item name is required.', { example: _exampleProduct });
                }
                if (!item.amount) {
                    return response(res, httpStatus.BAD_REQUEST, 'Item Amount is required.', { example: _exampleProduct });
                }
                if (!item.totalAmount) {
                    return response(res, httpStatus.BAD_REQUEST, 'Item Total Amount is required.', { example: _exampleProduct });
                }
                if (!item.quantity) {
                    return response(res, httpStatus.BAD_REQUEST, 'Item Quantity is required.', { example: _exampleProduct });
                }

                _obj.item_name = item.item_name
                _obj.amount = item.amount
                _obj.totalAmount = item.totalAmount
                _obj.quantity = item.quantity

                payload.productName.push(_obj)
            }
        }

        if (!payment_method) {
            return response(res, httpStatus.BAD_REQUEST, 'Payment method is required.');
        } else {
            payload.payment_method = payment_method
        }

        if (!totalPayment) {
            return response(res, httpStatus.BAD_REQUEST, 'Total amount is required.');
        } else if (!isNumber(totalPayment)) {
            return response(res, httpStatus.BAD_REQUEST, 'Total amount must be a number.');
        } else if (totalPayment <= 0) {
            return response(res, httpStatus.BAD_REQUEST, 'Total amount must be greater than 0.');
        } else {
            payload.totalPayment = Number(totalPayment)
        }

        if (isUndefined(paidPayment)) {
            return response(res, httpStatus.BAD_REQUEST, 'Paid amount is required.');
        } else if (!isNumber(paidPayment)) {
            return response(res, httpStatus.BAD_REQUEST, 'Paid amount must be a number.');
        } else if (paidPayment <= 0) {
            return response(res, httpStatus.BAD_REQUEST, 'Paid amount must be greater than 0.');
        } else if (paidPayment > totalPayment) {
            return response(res, httpStatus.BAD_REQUEST, 'Paid amount must be less than or equal to net amount.');
        } else {
            payload.paidPayment = Number(paidPayment)
        }

        if (invoiceNotes) {
            payload.invoiceNotes = String(invoiceNotes).trim()
        }
        if (termCondition) {
            payload.termCondition = String(termCondition).trim()
        }

        return InvoiceRepo
            .create(payload)
            .then(result => {
                return response(res, httpStatus.CREATED, 'Invoice created successfully.', result);
            })
            .catch(error => {
                return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
            })
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
    }
}

module.exports.getInvoice = async (req, res) => {
    req.logger.info('Controllers > Admin > Invoice > Get Invoice');

    try {
        const { id } = pickBy(req.query);

        let findQuery = {}

        if (id) {
            if (!ObjectId.isValid(req.query.id)) {
                return response(res, httpStatus.BAD_REQUEST, 'Invalid invoice id.');
            }

            findQuery._id = new ObjectId(req.query.id)
        }

        const SearchFields = ['_id', 'invoice_number', 'fullName', 'email', 'phoneNumber', 'payment_method']
        Object.assign(findQuery, MongoDBQueryBuilder.searchTextQuery(req.query.search, SearchFields))

        const pagination = PaginationHelper.getPagination(req.query);
        const SortQuery = MongoDBQueryBuilder.sortQuery(req.query.sort, req.query.sortOrder)
        const CountDocs = await InvoiceRepo.countDocuments(findQuery);
        const PaginationInfo = PaginationHelper.getPaginationInfo(CountDocs, req.query);

        // DB: Find
        return InvoiceRepo
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

module.exports.updateInvoice = async (req, res) => {
    req.logger.info('Controllers > Admin > Invoice > Update Invoice');

    try {
        const { adminAuthData } = req.headers
        const { id, date, fullName, email, phoneNumber, invoiceAddress, items, payment_method, totalPayment, paidPayment, invoiceNotes, invoice_number } = req.body;

        let getInvoice = await InvoiceRepo.findOne({ _id: id })

        if (!getInvoice) {
            return response(res, httpStatus.NOT_FOUND, 'Invoice not found.', { id });
        }

        if (invoice_number) {
            if (isNaN(invoice_number)) {
                return response(res, httpStatus.BAD_REQUEST, 'Invoice number must be a number.');
            }

            let isAnotherInvoiceExists = await InvoiceRepo.exists({ invoice_number: invoice_number, _id: { $ne: getInvoice._id } })

            if (isAnotherInvoiceExists) {
                return response(res, httpStatus.BAD_REQUEST, `Invoice number ${invoice_number} already exists for invoice.`);
            }

            getInvoice.invoice_number = invoice_number
        }


        getInvoice.updatedById = adminAuthData.id

        if (date) {

            if (DayJS(date, 'YYYY/MM/DD', true).isValid() === false) {
                return response(res, httpStatus.BAD_REQUEST, 'Invalid date. It must be in YYYY/MM/DD format.');
            } else {
                getInvoice.date = new Date(date)
            }
        }

        if (fullName) {
            getInvoice.fullName = fullName
        }

        if (email) {
            if (regexValidateUtil.email(email) === false) {
                return response(res, httpStatus.BAD_REQUEST, 'Invalid email.');
            }

            getInvoice.email = email
        }

        if (phoneNumber) {
            getInvoice.phoneNumber = phoneNumber
        }

        if (invoiceAddress) {
            getInvoice.invoiceAddress = invoiceAddress
        }

        if (items) {
            if (!isArray(items)) {
                return response(res, httpStatus.BAD_REQUEST, 'Products must be an array.', { example: _exampleProduct });
            }

            let itemsArr = getInvoice.productName || []

            for (let item of items) {
                let _obj = {}

                let index;
                if (item._id) {
                    index = itemsArr.findIndex(i => new ObjectId(i._id).equals(new ObjectId(item._id)))
                    _obj = itemsArr[index]

                    if (!_obj) _obj = {}

                    if (item.delete === true) {
                        itemsArr = itemsArr.filter(i => !new ObjectId(i._id).equals(new ObjectId(item._id)))
                        continue
                    }
                }

                if (item.delete === true) {
                    continue
                }

                if (!item.item_name) {
                    return response(res, httpStatus.BAD_REQUEST, 'Item name is required.', { example: _exampleProduct });
                }
                if (!item.amount) {
                    return response(res, httpStatus.BAD_REQUEST, 'Item Amount is required.', { example: _exampleProduct });
                }
                if (!item.totalAmount) {
                    return response(res, httpStatus.BAD_REQUEST, 'Item Total Amount is required.', { example: _exampleProduct });
                }
                if (!item.quantity) {
                    return response(res, httpStatus.BAD_REQUEST, 'Item Quantity is required.', { example: _exampleProduct });
                }

                _obj.item_name = item.item_name
                _obj.amount = item.amount
                _obj.totalAmount = item.totalAmount
                _obj.quantity = item.quantity

                if (index !== -1) {
                    itemsArr[index] = _obj
                } else {
                    itemsArr.push(_obj)
                }
            }

            if (itemsArr.length === 0) return response(res, httpStatus.BAD_REQUEST, 'At least one item is required.', { example: _exampleProduct });

            getInvoice.set('productName', itemsArr)
        }

        if (!payment_method) {
            return response(res, httpStatus.BAD_REQUEST, 'Payment method is required.');
        } else {
            getInvoice.payment_method = payment_method
        }

        let netAmount = totalPayment || getInvoice.totalPayment
        if (isUndefined(netAmount)) {
            return response(res, httpStatus.BAD_REQUEST, 'Net amount is required.');
        } else if (!isNumber(netAmount)) {
            return response(res, httpStatus.BAD_REQUEST, 'Net amount must be a number.');
        } else if (netAmount <= 0) {
            return response(res, httpStatus.BAD_REQUEST, 'Net amount must be greater than 0.');
        } else {
            getInvoice.totalPayment = Number(netAmount)
        }

        let paidAmount = paidPayment || getInvoice.paidPayment
        if (isUndefined(paidAmount)) {
            return response(res, httpStatus.BAD_REQUEST, 'Paid amount is required.');
        } else if (!isNumber(paidAmount)) {
            return response(res, httpStatus.BAD_REQUEST, 'Paid amount must be a number.');
        } else if (paidAmount <= 0) {
            return response(res, httpStatus.BAD_REQUEST, 'Paid amount must be greater than 0.');
        } else if (paidAmount > totalPayment) {
            return response(res, httpStatus.BAD_REQUEST, 'Paid amount must be less than or equal to net amount.');
        } else {
            getInvoice.paidPayment = Number(paidAmount)
        }

        if (invoiceNotes) {
            getInvoice.invoiceNotes = String(invoiceNotes).trim()
        }

        getInvoice
            .save()
            .then(result => {
                return response(res, httpStatus.OK, 'Invoice updated successfully.', result);
            })
            .catch(error => {
                return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
            })
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
    }

}

module.exports.deleteInvoice = async (req, res) => {
    req.logger.info('Controllers > Admin > Invoice > Delete Invoice');

    try {
        const { id } = req.query;

        if (!id || !ObjectId.isValid(id)) {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid invoice id.');
        }

        let getInvoice = await InvoiceRepo.findOne({ _id: id })

        if (!getInvoice) {
            return response(res, httpStatus.NOT_FOUND, 'Invoice not found.', { id });
        }

        getInvoice
            .deleteOne()
            .then(() => {
                return response(res, httpStatus.OK, 'Invoice deleted successfully.');
            })
            .catch(error => {
                return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
            })
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
    }
}

module.exports.getNextInvoiceSequence = async (req, res) => {
    req.logger.info('Controllers > Admin > Invoice > Get Next Invoice Sequence');

    try {
        let nextInvoiceNumber = await getNextInvoiceSequence()

        return response(res, httpStatus.OK, 'success', { next_invoice_number: nextInvoiceNumber });
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
    }
}

async function getNextInvoiceSequence() {
    let findNextUniqueSequence = true;
    let nextInvoiceNumber = await InvoiceRepo.countDocuments()

    do {
        nextInvoiceNumber++;

        let isInvoiceExists = await InvoiceRepo.exists({ invoice_number: nextInvoiceNumber })

        if (!isInvoiceExists) {
            findNextUniqueSequence = false
        }
    } while (findNextUniqueSequence)

    return nextInvoiceNumber;
}

module.exports.getStats = async (req, res) => {
    req.logger.info('Controllers > Admin > Invoice > Get Stats');

    try {
        const Schema = Joi.object({}).unknown(true);

        const { error } = Schema.validate(req.query);
        if (error) return response(res, httpStatus.BAD_REQUEST, error.message, error);

        let query = [
            {
                $match: req.query
            },
            {
                $group: {
                    _id: null,
                    total_invoices: { $sum: 1 },
                    total_totalPayment: { $sum: { $convert: { input: "$totalPayment", to: "double", onError: 0, onNull: 0 } } },
                    total_paidPayment: { $sum: { $convert: { input: "$paidPayment", to: "double", onError: 0, onNull: 0 } } },
                    total_due_amount: {
                        $sum: {
                            $subtract: [
                                { $convert: { input: "$totalPayment", to: "double", onError: 0, onNull: 0 } },
                                { $convert: { input: "$paidPayment", to: "double", onError: 0, onNull: 0 } }
                            ]
                        }
                    }
                }
            }
        ];

        let result = await InvoiceRepo.aggregate(query);

        return response(res, httpStatus.OK, 'success', result);
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
    }
};
