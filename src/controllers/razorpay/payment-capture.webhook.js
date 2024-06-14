/**
 * @author Smit Luvani
 * @description It will handle payment.capture webhook from razorpay
 * This function will verify signature and validate body data. Then it will pass data to respective controller for further processing.
 * Controller is Promise based.
 */

const httpStatus = require('http-status');
const { winston: logger } = require('../../services');
const response = require('../../utils/response')
const adminControllers = require('../../controllers/admin')
const crypto = require('crypto')
const { webhookHandler } = require('../../common/razorpay-webhook')
const { getOrderByIDController, updateOrderByIDController } = require('../razorpay')
const razorpayClient = require('razorpay')
const { paymentGateway } = require('../../common')

module.exports = async (req, res) => {
    let { event, payload } = req.body
    const event_id = req.headers['x-razorpay-event-id']

    // NOTE: Keep this comment
    // Validate Signature
    // const razorpay_signature = req.headers['x-razorpay-signature']
    // try {
    //     await validateSignature({ body: req.body, signature: razorpay_signature })
    // } catch (error) {
    //     logger.error(error.stack)
    //     return response(res, httpStatus.BAD_REQUEST, error || 'Invalid Signature')
    // }

    // Validate Body Type
    if (event !== 'payment.captured') {
        return response(res, httpStatus.BAD_REQUEST, 'Invalid event type')
    }

    if (!payload || !payload.payment || !payload.payment.entity) {
        return response(res, httpStatus.BAD_REQUEST, 'Insufficient Data')
    }

    response(res, httpStatus.OK, 'Payment Capture Webhook Successful')

    let paymentData = payload.payment.entity

    let { order_id } = paymentData
    req.logger.info(`[Webhook] Order ID: ${order_id}`)

    let chosenGateway;
    switch (paymentData.notes.webhook_handler) {
        case webhookHandler.books:
        case webhookHandler.ebooks:
            chosenGateway = paymentGateway.razorpay_fgiit;
            break;
        case webhookHandler.digital_plan:
        case webhookHandler.fitness_course:
        case webhookHandler.fwg_plan:
        case webhookHandler.pt_plan:
        case webhookHandler.fg_meals:
            chosenGateway = paymentGateway.razorpay;
            break;
        default:
            return logger.error('Invalid Webhook Handler. Webhook not processed.');
    }

    let fetchOrderResult;
    try {
        fetchOrderResult = await getOrderByIDController(order_id, chosenGateway) // Order will have valid notes than payment.captured as it set while creating order
    } catch (error) {
        logger.error(error.stack)
        return
    }

    try {
        if (fetchOrderResult.notes.event_id == undefined) {
            updateOrderByIDController({
                id: order_id,
                notes: { ...fetchOrderResult.notes, webhook_event_id: event_id },
                gateway: chosenGateway
            })
        }
    } catch (error) {
        logger.error(error.stack)
        return;
    }

    // Prevent repeat Callback
    if (fetchOrderResult.notes.payment_domain == 'FG-GROUP' && fetchOrderResult.notes.webhook_event_id == event_id) {
        logger.error('Webhook already called for this order')
        return;
    }

    // Check Payment done via "FG-GROUP"
    if (!fetchOrderResult.notes || fetchOrderResult.notes.payment_via != 'FG-GROUP') {
        return response(res, httpStatus.BAD_REQUEST, 'FG-GROUP payment not found')
    }

    // Forward to Respective Controller
    let { notes } = fetchOrderResult
    req.logger.info('Handler: ' + notes.webhook_handler)

    try {
        let controllerResponse;

        switch (notes.webhook_handler) {
            case webhookHandler.fwg_plan:
                controllerResponse = await adminControllers.FWGWebhookController({ razorpay_payment_id: paymentData.id, razorpay_order_id: paymentData.order_id })
                break;
            case webhookHandler.pt_plan:
                controllerResponse = await adminControllers.FWGWebhookController({ razorpay_payment_id: paymentData.id, razorpay_order_id: paymentData.order_id })
                break;
            case webhookHandler.fitness_course:
                controllerResponse = await adminControllers.FitnessCourseWebhookController({ razorpay_payment_id: paymentData.id, razorpay_order_id: paymentData.order_id })
                break;
            case webhookHandler.books:
                controllerResponse = await adminControllers.BookWebhookController({ razorpay_payment_id: paymentData.id, razorpay_order_id: paymentData.order_id, gateway: chosenGateway })
                break;
            case webhookHandler.digital_plan:
                controllerResponse = await adminControllers.DigitalPlanWebhookController({ razorpay_payment_id: paymentData.id, razorpay_order_id: paymentData.order_id })
                break;
            case webhookHandler.fg_meals:
                controllerResponse = await adminControllers.FGMealsWebhookController({ razorpay_payment_id: paymentData.id, razorpay_order_id: paymentData.order_id, gateway: chosenGateway })
                break;
            case webhookHandler.ebooks:
                controllerResponse = await adminControllers.EBooksWebhookController({ razorpay_payment_id: paymentData.id, razorpay_order_id: paymentData.order_id, gateway: chosenGateway })
                break;

            default:
                return logger.error('[WEBHOOK-CONTROLLER]: Invalid Webhook Handler. Valid Webhook Handler is not found')
                break;
        }

        logger.info('[WEBHOOK-CONTROLLER]: ' + controllerResponse)

    } catch (error) {
        logger.error(`[WEBHOOK-CONTROLLER]: ORDER_ID: ${order_id} :: ` + error)
    }
}

// NOTE: Currently not used
const validateSignature = ({ body, signature }) => new Promise((resolve, reject) => {
    if (!body || !signature) {
        return reject('[validateSignature]: Missing required params')
    }

    try {
        // let HMac = crypto.createHmac('SHA256', secrets.webhook_capture)
        // let generatedSignature = HMac.update(JSON.stringify(body)).digest('hex');

        // Using Razorpay
        // razorpayClient.validateWebhookSignature(body, signature, secrets.webhook_capture)

        // return generatedSignature == signature ? resolve(true) : reject('[validateSignature]: Signature mismatch')
    } catch (error) {
        reject(error.message)
    }
})