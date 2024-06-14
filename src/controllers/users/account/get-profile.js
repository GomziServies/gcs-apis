/**
 * @author Divyesh Baraiya
 * @description Get User Information
 */

const httpStatus = require('http-status'),
    { UserRepo } = require('../../../database'),
    response = require('../../../utils/response');

module.exports = async (req, res) => {

    req.logger.info('Controller > User > Account > Get User');

    let { userAuthData } = req.headers;

    try {
        // DB: Find 
        let result = await UserRepo.findById(userAuthData.id).select('-authToken').lean()

        let resultPayload = {
            user: result,
        }

        return response(res, httpStatus.OK, 'success', resultPayload);

    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error)
    }
}
