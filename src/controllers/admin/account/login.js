/**
 * @author Divyesh Baraiya
 * @description Login into Admin Account and Get Authorization Token
 */
const httpStatus = require('http-status'),
    { AdminRepo } = require('../../../database'),
    { bcryptjs, jwt } = require('../../../services'),
    { isEmpty } = require('lodash'),
    response = require('../../../utils/response');

module.exports = async (req, res) => {
    req.logger.info('Controller > Admin > Account > Login');

    try {

        const { email, password } = req.body

        // Validation
        if (isEmpty(email) || isEmpty(password)) {
            return response(res, httpStatus.BAD_REQUEST, 'Email and password is required')
        }

        // DB: Find
        let result = await AdminRepo.findOne({ email, status: true }).select('+password +authToken')

        if (result) {
            // Compare Hash Password
            return bcryptjs.compare(password, result.password).then(async () => {

                let authorization = {
                    id: result._id,
                    type: result.type,
                    authToken: result.authToken,
                    via: 'LOGIN'
                }

                authorization = jwt.sign(authorization, '30d')

                return response(res, httpStatus.OK, 'Always send header as "authorization" for authorization Required APIs', { authorization });
            }).catch(() => {
                return response(res, httpStatus.BAD_REQUEST, 'Invalid Email or Password')
            })
        } else {
            return response(res, httpStatus.BAD_REQUEST, 'Invalid Email or Password')
        }

    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error)
    }
}