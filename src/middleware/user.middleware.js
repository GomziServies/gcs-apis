const httpStatus = require('http-status'),
    { UserRepo } = require('../database'),
    { jwt } = require('../services'),
    { isEmpty } = require('lodash'),
    response = require('../utils/response'),
    { userStatus } = require('../common')

module.exports = (req, res, next) => {
    req.logger.info('Middleware > User Authentication');

    try {

        const authorization = req.headers.authorization || req.cookies.authorization

        if (isEmpty(authorization)) {
            return response(res, httpStatus.UNAUTHORIZED, 'Token is required')
        }

        // Decode Token
        let tokenResult = jwt.verify(authorization);

        if (!tokenResult) {
            return response(res, httpStatus.UNAUTHORIZED, 'Invalid Token. User may not found or account is deactivated')
        }

        // Find User Using ID
        return UserRepo
            .findById(tokenResult.id)
            .then(async result => {
                if (!result) {
                    return response(res, httpStatus.UNAUTHORIZED, 'Invalid Token')
                }

                if (result.status != userStatus.active) {
                    return response(res, httpStatus.UNAUTHORIZED, 'User account has been removed. Please contact us.')
                }

                // Match Auth Token
                if (result.authToken != tokenResult.authToken) {
                    return response(res, httpStatus.UNAUTHORIZED, 'Invalid Token. Authentication Token does not match')
                }

                // Store Decoded Token in Header [req.header.userAuthData]
                req.headers.userAuthData = { ...tokenResult, uid: result.uid };

                req.logger.info(`[Middleware]: User Authentication Verified. UID: ${result._id}`);

                // Passed
                next();
            })
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, 'internalError', error)
    }
}