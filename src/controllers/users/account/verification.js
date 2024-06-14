/**
 * @author Smit Luvani
 * @description Verify OTP/Emailaa
 */

const httpStatus = require('http-status'),
    { UserRepo, OtpRepo } = require('../../../database'),
    { winston: logger, jwt } = require('../../../services'),
    { userStatus, otpViaCode } = require('../../../common'),
    { isEmpty } = require('lodash'),
    response = require('../../../utils/response');

module.exports.mobileVerification = async (req, res) => {
    req.logger.info('Controller > User > Account > Mobile Verification');

    let { otp, mobile } = req.body


    if (!otp || isEmpty(otp) || !mobile || isEmpty(mobile)) {

        return response(res, httpStatus.BAD_REQUEST, 'mobile & OTP required', undefined)
    }

    let userResult = await UserRepo.findOne({ mobile: mobile, status: userStatus.active }).select('+authToken').catch()

    if (!userResult) {
        return response(res, httpStatus.BAD_REQUEST, 'No any account registered with this mobile number');
    }

    let otpResult = await OtpRepo.findOne({ user_id: userResult._id, isActive: true, via: otpViaCode.mobileVerification }).sort({ created_at: -1 })
    if (!otpResult) {
        return response(res, httpStatus.BAD_REQUEST, 'Invalid Code');
    }

    if (otpResult.otp_code != otp) {
        return response(res, httpStatus.BAD_REQUEST, 'Invalid OTP');
    }

    OtpRepo.findByIdAndUpdate({ _id: otpResult._id }, { isActive: false, updatedBy: userResult._id }).catch()

    return UserRepo.findByIdAndUpdate({ _id: userResult._id }, { updatedBy: userResult._id, mobileVerified: true }, { new: true }).then(async result => {
        if (!result) {
            return response(res, httpStatus.FORBIDDEN, `Sorry! Your account may removed or email address changed.`)
        }

        let authorization = await jwt.sign({
            id: userResult._id,
            email: userResult.email,
            authToken: userResult.authToken,
            via: 'OTP Verification',
            createdOn: String(new Date())
        })

        // Success
        return response(res, httpStatus.OK, 'Your mobile number has been verified', { authorization })

    })
}