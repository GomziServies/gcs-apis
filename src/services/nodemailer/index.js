/**
 * @author Smit Luvani
 * @description SMTP Mailer
 * @module https://www.npmjs.com/package/nodemailer
 * @tutorial https://nodemailer.com/about/
 * @example https://github.com/nodemailer/nodemailer/tree/master/examples
 */

const nodemailer = require('nodemailer'),
    { nodemailer: nodemailerSecret } = require('../../config/secrets.json'),
    { logging } = require('../../config/default.json'),
    logger = require('../winston')
const { email: emailRegex } = require('../../utils/regex')
const { common_environment } = require('../../common')
const blockList = ['void@razorpay.com']

// Check Secret
if (!nodemailerSecret[process.env.NODE_ENV] || !nodemailerSecret[process.env.NODE_ENV].smtp || !nodemailerSecret[process.env.NODE_ENV].email || !nodemailerSecret[process.env.NODE_ENV].password) {
    logger.error('Service [NODEMAILER]: SMTP or Email or Password not found for current environment')
}

let transporterPayload = {
    service: nodemailerSecret[process.env.NODE_ENV].smtp,
    port: nodemailerSecret[process.env.NODE_ENV].port,
    secure: nodemailerSecret[process.env.NODE_ENV].secure,
    debug: false,
    logger: true,
    auth: {
        user: nodemailerSecret[process.env.NODE_ENV].email,
        pass: nodemailerSecret[process.env.NODE_ENV].password,
    }
}

module.exports = async (fromMail = nodemailerSecret[process.env.NODE_ENV].email, toMail, subject, body, senderName, attachments) => {
    let transporter = nodemailer.createTransport(transporterPayload);
    if (!toMail || !subject || !body) {
        logger.error('Service [NODEMAILER]: Missing Required Parameter')
        return false;
    }

    if (!fromMail || !emailRegex(fromMail)) {
        logger.verbose('Service [NODEMAILER]: Invalid Email Address Provided. Value found ' + fromMail)
        return false;

    }

    if (!emailRegex(toMail)) {
        logger.verbose('Service [NODEMAILER]: Invalid Email Address Provided. Value found ' + fromMail)
        return false;

    }

    if (blockList.includes(toMail)) {
        logger.verbose('Service [NODEMAILER]: Email Address is manually blocked. Value found ' + toMail)
        return false;
    }

    if (process.env.NODE_ENV != common_environment.production) {
        subject = `[${process.env.NODE_ENV}] ${subject}`
    }

    try {

        let info = await transporter.sendMail({
            from: `${senderName || fromMail}`, // sender address
            to: toMail, // list of receivers
            subject: subject, // Subject line
            html: body, // html body
            attachments: attachments || []
        });

        logging.nodemailer ? logger.info(`Service [NODEMAILER]: Mail Sent Result => ${JSON.stringify(info)}`) : null;
        return info;
    } catch (error) {
        console.error(error)
        logger.error('Service [NODEMAILER]: ', error)
        return false;
    }
}