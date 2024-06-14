/**
 * @author Divyesh Baraiya
 * @description Handle Contact Us form
 * @param {String} name
 * @param {String} email
 * @param {String} mobile
 * @param {String} message
 * @param {String} subject
 * @param {String} source
 */

const httpStatus = require('http-status');
const response = require('../../utils/response')
const { winston: logger } = require('../../services')
const { ContactInquiryRepo } = require('../../database')
const { ActionTopic } = require('../../common');

module.exports = async (req, res) => {
    req.logger.info('Controller > Public > Contact Us')

    const { name, email, mobile, message, subject, source, developer_notes } = req.body

    // Validate
    if (!name || !email || !mobile || !message || !subject || !source) {
        return response(res, httpStatus.BAD_REQUEST, 'name, email, mobile, message, subject, source is required')
    }

    let payload = {
        name,
        email,
        mobile,
        message,
        subject,
        source,
    }

    if (developer_notes) {
        payload.developer_notes = {}

        let { topic, date, } = developer_notes;
        date = date.toDate()
        payload.developer_notes = {
            topic,
            date,
        }
    }

    try {

        ContactInquiryRepo.create(payload).then(result => postInquiryAction(result)).catch()

        return response(res, httpStatus.OK, 'Success')

    } catch (error) {
        return response(res, httpStatus.INTERNAL_SERVER_ERROR, error.message || 'Something went wrong', error)
    }
}

/**
 * 
 * @param {object} data 
 */
const postInquiryAction = (data) => {
    logger.info('Controller > Public > Contact Us > [fn: postInquiryAction]')

    let { developer_notes } = data;

    switch (developer_notes?.topic) {
        case ActionTopic.demoLecture:
            postAction_DemoLecture(data)
            break;
        case ActionTopic.RTPSession:
            postAction_RTPSession(data)
            break;
        default:
            break;
    }
};