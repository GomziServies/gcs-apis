/**
 * @author Smit Luvani
 * @description Get User Information
 */

const httpStatus = require('http-status'),
    { UserRepo, OtpRepo } = require('../../../database'),
    { DayJS } = require('../../../services'),
    response = require('../../../utils/response'),
    { randomDigit } = require('../../../utils/random'),
    { otpViaCode } = require('../../../common')

const unirest = require('unirest');

module.exports.sendVerificationOTP = async (req, res) => {
    req.logger.info('Controller > User > Account > Resend Verification > Mobile OTP');

    let { userAuthData } = req.headers;

    // DB: Find 
    let result = await UserRepo.findOne({ _id: userAuthData.id }).lean()

    if (result.mobileVerified) {
        return response(res, httpStatus.FORBIDDEN, 'Mobile already verified')
    }

    let otpResult = await OtpRepo.findOne({ user_id: result._id, isActive: true, via: otpViaCode.mobileVerification })

    if (!otpResult) {
        let otpPayload = {
            user_id: result._id,
            otp_code: randomDigit(5),
            isActive: true,
            via: otpViaCode.mobileVerification,
            expiredAt: DayJS().add(30, 'days').toDate()
        }

        // SEND SMS API HERE
        otpResult = await OtpRepo.create(otpPayload)
    }

    const text = encodeURIComponent(`Your OTP is ${otpResult.otp_code} for FG Group. We highly recommend not share it with others. Gomzi`)
    unirest
        .post(`http://sms.mobileadz.in/api/push.json?apikey=615b7adfe352d&sender=GOMZIF&mobileno=${result.mobile}&text=${text}`)
        .then(response => {
            req.logger.info(JSON.stringify(response.body))
        }).catch(error => {
            req.logger.error(error.stack)
        })

    return response(res, httpStatus.OK, `OTP has been sent on this ${result.country_code}${result.mobile}`, undefined, 'ERR#OTP-RESEND')
}