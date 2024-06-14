/**
 * @author Smit Luvani
 * @description Get User Orders
 */

const httpStatus = require('http-status')
const response = require('../../../utils/response')
const { getPayment } = require('../../razorpay')

module.exports = async (req, res) => {
    req.logger.info('Controller > Admin > Orders > Get Payment')

    let { razorpay_id, gateway } = req.body

    if (!razorpay_id) {
        return response(res, httpStatus.BAD_REQUEST, 'razorpay_id is required')
    }

    let result = await getPayment(razorpay_id, { gateway: gateway })

    return response(res, httpStatus.OK, 'success', result)
}