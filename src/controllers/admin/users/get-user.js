/**
 * @author Divyesh Baraiya
 * @description Get Users
 */
const httpStatus = require('http-status')
const { UserRepo } = require('../../../database')
const { userStatus } = require('../../../common')
const response = require('../../../utils/response');
const { PaginationHelper, MongoDBQueryBuilder } = require('../../../helpers');
const { ObjectId } = require('mongoose').Types;

module.exports = async (req, res) => {
    req.logger.info('Controller > Admin > Users > Get User');

    let queryUserID = req.query.id

    req.query.maxLimit = 1000

    try {
        var findQuery = {
            status: { $ne: userStatus.deleted },
        }, serviceFilter = {
            status: true
        }

        if (queryUserID) {
            if (ObjectId.isValid(queryUserID) == false) {
                return response(res, httpStatus.BAD_REQUEST, 'Invalid id');
            }

            findQuery._id = new ObjectId(queryUserID)
            serviceFilter.user_id = new ObjectId(queryUserID)
        }

        const SearchFields = ['first_name', 'last_name', 'email', 'mobile']
        Object.assign(findQuery, MongoDBQueryBuilder.searchTextQuery(req.query.search, SearchFields))

        const pagination = PaginationHelper.getPagination(req.query, { maxLimit: req.query.maxLimit });
        const SortQuery = MongoDBQueryBuilder.sortQuery(req.query.sort, req.query.sortOrder)
        const CountDocs = await UserRepo.countDocuments(findQuery);
        const PaginationInfo = PaginationHelper.getPaginationInfo(CountDocs, req.query);

        return Promise.all([
            UserRepo.find(findQuery, { authToken: false }).skip(pagination.skip).limit(pagination.limit).sort(SortQuery).lean(),
        ]).then(([UserResult]) => {
            var result = UserResult.map(user => {
                return user
            });

            return response(res, httpStatus.OK, 'success', result, undefined, {
                pagination: PaginationInfo,
                search_fields: SearchFields
            });

        }).catch(error => response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error))
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error)
    }
}