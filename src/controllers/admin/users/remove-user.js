/**
 * @author Divyesh Baraiya
 * @description Remove User Profile
 */
const httpStatus = require('http-status'),
    { UserRepo } = require('../../../database'),
    { isEmpty } = require('lodash'),
    { isValidObjectId } = require('mongoose'),
    response = require('../../../utils/response');
const { userStatus } = require('../../../common');

module.exports = async (req, res) => {
    req.logger.info('Admin > Users > Remove User');

    const { id } = req.body

    try {

        if (isEmpty(id) || !isValidObjectId(id)) {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid Id');
        }

        // DB: Find & Update
        let result = await UserRepo.findByIdAndUpdate({ _id: id }, { status: userStatus.deleted }, { new: true })

        if (!result) {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid Id')
        }
        return response(res, httpStatus.OK, 'success')
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error)
    }
}