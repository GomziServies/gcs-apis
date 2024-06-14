const httpStatus = require('http-status'),
    { AdminRepo } = require('../database'),
    { winston: logger, jwt } = require('../services'),
    { isEmpty } = require('lodash'),
    response = require('../utils/response');
const oAuthMiddleware = require('./oAuth.middleware');
const cacheTTL = 60 * 5;
const Audience = 'oAuth';

module.exports = async (req, res, next) => {
    req.logger.info('Middleware > Admin Middleware');

    try {

        const { authorization } = req.headers

        if (isEmpty(authorization)) {
            return response(res, httpStatus.UNAUTHORIZED, 'Token is required')
        }

        // Decode Token
        let tokenResult = jwt.verify(authorization)

        if (tokenResult) {
            if (tokenResult?.aud === Audience) {
                return oAuthMiddleware(req, res, next);
            }

            const cacheKey = tokenResult.id

            // Find User Using ID
            let result = await AdminRepo.findOne({ _id: tokenResult.id, status: true }).select('+authToken').lean()

            if (result) {
                // Match Auth Token
                if (result.authToken != tokenResult.authToken) {
                    return response(res, httpStatus.UNAUTHORIZED, 'Invalid Token')
                }
                // Store Decoded Token in Header [req.header.adminAuthData]
                req.headers.adminAuthData = tokenResult;
                // Passed
                return next();
            } else {
                return response(res, httpStatus.UNAUTHORIZED, 'Invalid Token')
            }
        } else {
            return response(res, httpStatus.UNAUTHORIZED, 'Invalid Token')
        }
    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, 'internalError', error)
    }
}