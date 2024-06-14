/**
 * @author Divyesh Baraiya
 * @description Distribute All Service to Application
 * @implements [RECOMMEND] Use Particular Service instead of all service or remove unwanted service
 */

module.exports = {
    NODE_ENV: require('./NODE_ENV'), // Do not comment this, Used in many services
    winston: require('./winston'),
    logger: require('./winston'),
    mongoose: require('./mongoose'),
    jwt: require('./jwt'),
    bcryptjs: require('./bcryptjs'),
    razorpay: require('./razorpay'),
    nodemailer: require('./nodemailer'),
    DayJS: require('./dayjs'),
};
module.exports.Joi = require('./Joi');

// To Disable, Use Single Line Comment

// Service Log
// Enable/Disable Service Logging in config/default.json file