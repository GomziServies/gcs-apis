/**
 * @author Jenil Narola
 * @description Update User Profile
 */
const httpStatus = require('http-status'),
    { UserRepo } = require('../../../database'),
    { isEmpty, isUndefined, isBoolean } = require('lodash'),
    response = require('../../../utils/response');
const moment = require('moment')
const { ObjectId } = require('mongoose').Types;

module.exports = async (req, res) => {
    req.logger.info('Controller > Admin > Users > Update User');

    const { adminAuthData } = req.headers
    const { id, first_name, last_name, email } = req.body

    try {

        if (!id || !ObjectId.isValid(id)) {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid Id');
        }

        let payload = {
            $set: {
                updatedBy: adminAuthData.id
            }
        }

        if (isEmpty(first_name) || isEmpty(last_name)) {
            return response(res, httpStatus.BAD_REQUEST, 'First name & last name is required');
        }

        payload.$set.first_name = String(first_name)
        payload.$set.last_name = String(last_name)
        payload.$set.email = String(email)

        // DB: Find & Update
        let result = await UserRepo.findByIdAndUpdate({ _id: id }, payload, { new: true }).select('-authToken')

        if (!result) {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid Id')
        }

        return response(res, httpStatus.OK, 'success', result)
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error)
    }
}