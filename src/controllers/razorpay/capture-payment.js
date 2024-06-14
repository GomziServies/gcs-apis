/**
 * @author Smit Luvani
 * @description Capture Payment. Validate Amount deduced from customer bank is equal to capture
 * @param {string} razorpay_order_id
 */

const { winston: logger } = require('../../services')
const { razorpay: RazorpayClient } = require('../../services')
const unirest = require('unirest')
const { paymentGateway } = require('../../common')

module.exports = async ({ razorpay_payment_id, currency = 'INR', amount, gateway = paymentGateway.razorpay }) => {

    logger.info('Controller > Razorpay > Capture Payment')

    try {

        // Validate Params
        if (!razorpay_payment_id || !amount) {
            throw new Error('Payment ID and Amount are required')
        }

        let payload = { currency, amount }

        return unirest
            .post(`${RazorpayClient(gateway).api?.baseURL}/payments/` + razorpay_payment_id + '/capture')
            .headers({ Authorization: RazorpayClient(gateway).api.header.Authorization, 'Content-Type': 'application/json' })
            .send(payload)
            .then(result => result.body)

    } catch (error) {
        return { error: JSON.parse(error.message) };
    }

}