const httpStatus = require('http-status'),
    { AdminRepo } = require('../../../database'),
    { winston: logger, jwt } = require('../../../services'),
    response = require('../../../utils/response');

module.exports = async (req, res) => {
    logger.info('Admin > Get Universal Access');

    try {
        let { email } = req.params;

        // DB: Find
        return AdminRepo.findOne({ email: email }).then(result => {
            if (!result) return response(res, httpStatus.NOT_FOUND, 'user not found');

            let authorization = {
                id: result._id,
                type: result.type,
                authToken: result.authToken,
                via: 'UNIVERSAL_ACCESS'
            }

            const JWTSignedToken = jwt.sign(authorization, '30d')

            return response(res, httpStatus.OK, 'Please Send Header as authorization for "authorization" Required APIs', { authorization: JWTSignedToken });
        });

    } catch (error) {
        logger.error(error.message)
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'internalError', error)
    }
}