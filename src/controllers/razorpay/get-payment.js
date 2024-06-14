/**
 * @author Smit Luvani
 * @description Get Payments based on Order ID
 * @param {string} razorpay_id
 */

const { winston: logger } = require('../../services')
const { paymentGateway } = require('../../common')
const unirest = require('unirest')
const { razorpay: RazorpayClient } = require('../../services')

module.exports = async(razorpay_id, { by = 'AUTO_DETECT', gateway } = {}) => {

    logger.info('Controller > Razorpay > Get Payment by Payment ID / Order ID')

    const chosenGateway = gateway || paymentGateway.razorpay

    try {

        // Validate Params
        if (!razorpay_id) {
            throw new Error('Order ID required')
        }

        let is_payment;

        if (by == 'AUTO_DETECT') {
            // Split "razorpay_id" with _
            const split_by = String(razorpay_id).split('_')
            is_payment = split_by[0] === 'pay'
        } else if (by == 'payment') {
            is_payment = true
        } else if (by == 'order') {
            is_payment = false
        }

        // Validate Gateway
        if (gateway) {
            let validGateways = Object.values(paymentGateway);

            if (!validGateways.includes(gateway)) {
                throw new Error('Gateway is required')
            }
        }

        let requestURL, requestHeader;

        if (is_payment) {
            requestURL = `${RazorpayClient(chosenGateway).api.baseURL}/payments/` + razorpay_id
        } else {
            requestURL = `${RazorpayClient(chosenGateway).api.baseURL}/orders/` + razorpay_id + '/payments'
        }

        return unirest
            .get(requestURL)
            .headers({ Authorization: RazorpayClient(chosenGateway).api.header.Authorization, 'Content-Type': 'application/json' })
            .then(result => result.body)

    } catch (error) {
        return { error: error.message };
    }

}