/**
 * @author Smit Luvani
 * @description Update Client User
 */

const httpStatus = require('http-status'),
    { UserRepo } = require('../../../database'),
    { winston: logger } = require('../../../services'),
    response = require('../../../utils/response'),
    { mobile: mobileRegex, email: emailRegex } = require('../../../utils/regex')
const moment = require('moment');
const { isUndefined } = require('lodash');

module.exports = async (req, res) => {

    req.logger.info('Controller > User > Account > Update Profile');

    let { first_name, last_name, mobile, email } = req.body
    let { userAuthData } = req.headers, updatedBy = userAuthData.id

    try {
        let payload = {
            updatedBy,
            $set: {}
        }

        let userResult = await UserRepo.findOne({ _id: userAuthData.id });

        // Email & Mobile Validation
        if (mobile && userResult.mobile != mobile) {

            if (!mobileRegex(mobile)) {
                return response(res, httpStatus.BAD_REQUEST, 'Invalid mobile number. Make sure mobile number must be 10 digit long.')
            }

            payload.mobile = String(mobile)
            payload.mobileVerified = false
        }

        if (email && userResult.email != email) {
            email = String(email).toLowerCase().trim()

            if (await emailRegex(email, true) == false) {
                return response(res, httpStatus.FORBIDDEN, 'Invalid Email address. Make sure email address is not temporary or disposable.')
            }

            payload.email = String(email)
            payload.emailVerified = false
        }

        // Optional Field
        first_name ? payload.first_name = String(first_name) : null;
        last_name ? payload.last_name = String(last_name) : null;

        // DB: Update
        UserRepo
            .findByIdAndUpdate(userAuthData.id, payload, { new: true }).select('-authToken')
            .then(result => {
                return result ? response(res, httpStatus.OK, 'success', result) : response(res, httpStatus.FORBIDDEN, 'Incorrect user ID')
            })
    } catch (error) {
        req.logger.error('error');
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error)
    }
}