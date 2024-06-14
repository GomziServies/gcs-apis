/**
 * @author Smit Luvani, Jenil Narola
 * @description Create & Login Management
 */

const httpStatus = require('http-status'),
    { UserRepo, OtpRepo, UserServiceRepo } = require('../../../database'),
    { DayJS } = require('../../../services'),
    response = require('../../../utils/response'),
    { email: emailRegex, mobile: mobileRegex } = require('../../../utils/regex'),
    { userStatus, otpViaCode, common_environment } = require('../../../common'),
    { randomDigit } = require('../../../utils/random'),
    unirest = require('unirest');
const bypassAuthorizedMobile = ['9033849692'];

module.exports.createLoginUser = async (req, res) => {
    req.logger.info('Controller > User > Account > Authorization > Create Login User');

    let { mobile, email } = req.body

    try {
        mobile = mobile ? String(mobile).trim() : null
        email = email ? String(email).trim() : null
        let findUser

        if (!mobile) {
            return response(res, httpStatus.BAD_REQUEST, 'Mobile Number or email address is required')
        } else if (mobile) {

            mobile = String(mobile)
            if (!await mobileRegex(mobile)) {
                return response(res, httpStatus.BAD_REQUEST, 'Mobile Number is not a valid')
            }

            findUser = await UserRepo.findOne({ mobile, status: { $nin: [userStatus.deleted] } })
        }

        let OTP, generatedOTP;

        if (!findUser) {
            let createUserResult;
            if (mobile) {
                // Mobile Validation
                createUserResult = await createUser({ mobile })
                generatedOTP = await getOTP({ user_id: createUserResult.user_id, via: otpViaCode.mobileVerification })
            }

            if (process.env.NODE_ENV === common_environment.development || bypassAuthorizedMobile.includes(mobile)) { OTP = generatedOTP.otp_code }

            return response(res, httpStatus.OK, `OTP has been sent ${email ? 'on your email' : 'on your mobile'}`, { OTP });
        } else if (findUser.status != userStatus.active) {
            return response(res, httpStatus.BAD_REQUEST, 'User account has been deactivated.')
        } else if (findUser.lock) {
            return response(res, httpStatus.BAD_REQUEST, 'User account has been locked.')
        }

        generatedOTP = await getOTP({ user_id: findUser._id, via: email ? otpViaCode.emailVerification : otpViaCode.mobileVerification })

        if (process.env.NODE_ENV === common_environment.development || bypassAuthorizedMobile.includes(mobile)) { OTP = generatedOTP.otp_code }

        return response(res, httpStatus.OK, `OTP has been sent ${email ? 'on your email' : 'on your mobile'}`, { OTP });

        // DB: Create user
        async function createUser(data) {
            let payload = {
                ...data,
                first_name: 'GCS',
                last_name: 'USER'
            }

            let createUserResult = await UserRepo.create(payload)
            return {
                for: Object.keys(data)[0],
                user_id: createUserResult._id
            }
        }

        // DB : Check & Get OTP
        async function getOTP(data) {
            let otpResult = await OtpRepo.findOne({ user_id: data.user_id, via: data.via, isActive: true }).sort({ createdAt: -1 })

            if (otpResult) {
                sendOTP({ via: otpResult.via, otp: otpResult.otp_code })
                return otpResult
            }

            let payload = {
                user_id: data.user_id,
                otp_code: randomDigit(6),
                via: data.via,
                send_to: email || mobile,
                expiredAt: DayJS().add(30, 'days').toDate()
            }

            return OtpRepo.create(payload).then(async (result) => {
                sendOTP({ via: result.via, otp: result.otp_code })
                return result
            })
        }

        // DB: Send OTP
        async function sendOTP(data) {

            if (process.env.NODE_ENV === common_environment.development) {
                req.logger.verbose('OTP won\'t be sent in development mode');
            }

            if (data.via == otpViaCode.mobileVerification && process.env.NODE_ENV != common_environment.development) {

                // Send OTP
                const text = encodeURIComponent(`Your OTP is ${data.otp} for FG Group. We highly recommend not share it with others. Gomzi`)
                unirest
                    .post(`http://sms.mobileadz.in/api/push.json?apikey=615b7adfe352d&sender=GOMZIF&mobileno=${mobile}&text=${text}`)
                    .then(response => {
                        req.logger.info(JSON.stringify(response.body))
                    }).catch(error => {
                        req.logger.error(error.stack)
                    })

            }
        }

    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error)
    }
}

module.exports.verifyUser = async (req, res) => {
    req.logger.info('Controller > User > Account > Authorization > Verify User');

    let { mobile, email, otp } = req.body;

    try {
        let findUserQuery = {
            status: userStatus.active,
            lock: { $ne: true }
        };

        if (email) {
            findUserQuery.email = String(email).toLowerCase().trim();

            if (!await emailRegex(email, true)) {
                return response(res, httpStatus.BAD_REQUEST, 'Disposable or temporary email is not supported');
            }
        } else if (mobile) {
            findUserQuery.mobile = Number(mobile);

            if (!mobileRegex(mobile)) {
                return response(res, httpStatus.BAD_REQUEST, 'Mobile Number is not valid');
            }
        }

        if (!otp) {
            return response(res, httpStatus.BAD_REQUEST, 'OTP is required');
        }

        UserRepo.findOne(findUserQuery)
            .then(async (findUser) => {
                if (!findUser) {
                    return response(res, httpStatus.UNAUTHORIZED, 'Invalid User');
                }

                OtpRepo.findOne({
                    user_id: findUser._id,
                    via: email ? otpViaCode.emailVerification : otpViaCode.mobileVerification,
                    isActive: true,
                    otp_code: otp,
                    send_to: email || mobile
                })
                    .sort({ createdAt: -1 })
                    .then(otpResult => {
                        if (!otpResult) {
                            return response(res, httpStatus.BAD_REQUEST, 'Invalid OTP');
                        }

                        OtpRepo.findOneAndUpdate({ _id: otpResult._id }, { isActive: false }).catch();

                        // Verification Update
                        if (otpResult.via == otpViaCode.emailVerification && !findUser.emailVerified) {
                            UserRepo.findOneAndUpdate({ _id: findUser._id }, { emailVerified: true }).catch();
                        } else if (otpResult.via == otpViaCode.mobileVerification && !findUser.mobileVerified) {
                            UserRepo.findOneAndUpdate({ _id: findUser._id }, { mobileVerified: true }).catch();
                        }

                        let { uid, _id, first_name, last_name } = findUser;

                        let responsePayload = {
                            mobile: findUser.mobile,
                            email: findUser.email,
                            uid,
                            _id,
                            first_name,
                            last_name,
                            email
                        };

                        return response(res, httpStatus.OK, 'User verified successfully', responsePayload);
                    })
                    .catch(error => {
                        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error);
                    });
            })
            .catch((error) => {
                return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error);
            });

    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error);
    }
};
