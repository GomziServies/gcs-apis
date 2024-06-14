
const httpStatus = require('http-status')
const response = require('../../../utils/response')
const { LeadRepo } = require('../../../database');
const { PaginationHelper, MongoDBQueryBuilder } = require('../../../helpers');
const { DayJS } = require('../../../services');
const { pickBy } = require('lodash');
const { ObjectId } = require('mongoose').Types

module.exports.createLead = async (req, res) => {
    req.logger.info('Controllers > Admin > Lead > Create lead');

    try {
        const { adminAuthData } = req.headers
        const { date, fullName, service, industryOrCompany, businessName, goalOrAnnualIncome, email, phoneNumber, leadAddress, reference, notes, leadType } = req.body;

        let payload = {
            createdById: adminAuthData.id,
            updatedById: adminAuthData.id,
        }

        if (DayJS(date, 'YYYY/MM/DD', true).isValid() === false) {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid date. It must be in YYYY/MM/DD format.');
        } else {
            payload.date = new Date(date)
        }

        if (!fullName) {
            return response(res, httpStatus.BAD_REQUEST, 'Name is required.');
        } else {
            payload.fullName = fullName
        }


        if (!service) {
            return response(res, httpStatus.BAD_REQUEST, 'Service is required.');
        } else {
            payload.service = service
        }

        if (industryOrCompany) {
            payload.industryOrCompany = String(industryOrCompany).trim()
        }

        if (businessName) {
            payload.businessName = String(businessName).trim()
        }

        if (goalOrAnnualIncome) {
            payload.goalOrAnnualIncome = String(goalOrAnnualIncome).trim()
        }

        if (leadAddress) {
            payload.leadAddress = String(leadAddress).trim()
        }

        if (reference) {
            payload.reference = String(reference).trim()
        }

        if (notes) {
            payload.notes = String(notes).trim()
        }

        if (leadType) {
            payload.leadType = String(leadType).trim()
        }

        if (email) {
            payload.email = String(email).trim()
        }

        if (phoneNumber) {
            payload.phoneNumber = String(phoneNumber).trim()
        }

        return LeadRepo
            .create(payload)
            .then(result => {
                return response(res, httpStatus.CREATED, 'Lead Added successfully.', result);
            })
            .catch(error => {
                return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
            })
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
    }
}

module.exports.getLead = async (req, res) => {
    req.logger.info('Controllers > Admin > Lead > Get Lead');

    try {
        const { id } = pickBy(req.query);

        let findQuery = {}

        if (id) {
            if (!ObjectId.isValid(id)) {
                return response(res, httpStatus.BAD_REQUEST, 'not valid Lead id.');
            }

            findQuery._id = new ObjectId(id)
        }

        const SearchFields = ['fullName', 'service', 'phoneNumber']
        Object.assign(findQuery, MongoDBQueryBuilder.searchTextQuery(req.query.search, SearchFields))

        const pagination = PaginationHelper.getPagination(req.query);
        const SortQuery = MongoDBQueryBuilder.sortQuery(req.query.sort, req.query.sortOrder)
        const CountDocs = await LeadRepo.countDocuments(findQuery);
        const PaginationInfo = PaginationHelper.getPaginationInfo(CountDocs, req.query);

        // DB: Find
        return LeadRepo
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

module.exports.updateLead = async (req, res) => {
    req.logger.info('Controllers > Admin > Lead > Update Lead');

    try {
        const { adminAuthData } = req.headers
        const { id, date, fullName, service, industryOrCompany, businessName, goalOrAnnualIncome, email, phoneNumber, leadAddress, reference, notes, leadType } = req.body;

        if (!id || !ObjectId.isValid(id)) {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid Lead id.');
        }

        let getLead = await LeadRepo.findOne({ _id: id })

        if (!getLead) {
            return response(res, httpStatus.NOT_FOUND, 'Lead not found.', { id });
        }


        getLead.updatedById = adminAuthData.id

        if (date) {

            if (DayJS(date, 'YYYY/MM/DD', true).isValid() === false) {
                return response(res, httpStatus.BAD_REQUEST, 'Invalid date. It must be in YYYY/MM/DD format.');
            } else {
                getLead.date = new Date(date)
            }
        }

        if (service) {
            getLead.service = service
        }

        if (fullName) {
            getLead.fullName = String(fullName).trim()
        }

        if (industryOrCompany) {
            getLead.industryOrCompany = String(industryOrCompany).trim()
        }

        if (businessName) {
            getLead.businessName = String(businessName).trim()
        }

        if (goalOrAnnualIncome) {
            getLead.goalOrAnnualIncome = String(goalOrAnnualIncome).trim()
        }

        if (leadAddress) {
            getLead.leadAddress = String(leadAddress).trim()
        }

        if (reference) {
            getLead.reference = String(reference).trim()
        }

        if (notes) {
            getLead.notes = String(notes).trim()
        }

        if (leadType) {
            getLead.leadType = String(leadType).trim()
        }

        if (email) {
            getLead.email = String(email).trim()
        }

        if (phoneNumber) {
            getLead.phoneNumber = String(phoneNumber).trim()
        }

        getLead
            .save()
            .then(result => {
                return response(res, httpStatus.OK, 'Lead updated successfully.', result);
            })
            .catch(error => {
                return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
            })
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
    }

}

module.exports.deleteLead = async (req, res) => {
    req.logger.info('Controllers > Admin > Lead > Delete Lead');

    try {
        const { id } = req.query;

        if (!id || !ObjectId.isValid(id)) {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid Lead id.');
        }

        let getLead = await LeadRepo.findOne({ _id: id })

        if (!getLead) {
            return response(res, httpStatus.NOT_FOUND, 'Lead not found.', { id });
        }

        getLead
            .deleteOne()
            .then(() => {
                return response(res, httpStatus.OK, 'Lead deleted successfully.');
            })
            .catch(error => {
                return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
            })
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || "Something went wrong", error);
    }
}