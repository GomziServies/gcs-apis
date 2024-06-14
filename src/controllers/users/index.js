/**
 * @author Divyesh Baraiya
 * @description Export Users Controllers
 */

// Account Controllers
module.exports.verification = require('./account/verification')
module.exports.getProfileController = require('./account/get-profile')
module.exports.resendVerificationController = require('./account/resend-verification')
module.exports.updateProfileController = require('./account/update-user')
module.exports.authorizationUserController = require('./account/authorize-user')