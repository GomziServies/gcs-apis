/**
 * @author Smit Luvani
 * @description Create Bearer Token for Object
 * @module https://www.npmjs.com/package/jsonwebtoken
 */

const jwt = require('jsonwebtoken'),
    { jwt: secrets } = require('../../config/secrets.json'),
    logger = require('../winston'),
    { logging } = require('../../config/default.json')
/**
 * 
 * @param {*} object 
 * @param {*} expiredIn 
 * @param {jwt.SignOptions} otherOption 
 * @returns 
 */
module.exports.sign = (object, expiredIn, otherOption = {}) => {
    try {
        const token = object ? jwt.sign(object, secrets[process.env.NODE_ENV], { expiresIn: expiredIn || '1000d', ...otherOption }) : undefined;

        if (!token) {
            logger.error('Service [JWT]: String/Object Required to create Sign Token')
            return false
        }

        logging.jwt ? logger.info('Service [JWT]: Object Signed') : null;

        return token;
    } catch (error) {
        // logger.error('Service [JWT]: ' + error)
        return null
    }
}

/**
 * 
 * @param {*} token 
 * @param {jwt.VerifyOptions} verifyOptions
 * @returns 
 */
module.exports.verify = (token, verifyOptions) => {
    try {
        const verify = jwt.verify(token, secrets[process.env.NODE_ENV], verifyOptions)
        // logger.info((token, verify) ? 'Token Verified Successfully' : 'Token Verification Failed/Expired')
        return token ? verify : false;
    } catch (error) {
        // logger.error('Service [JWT]: ' + error)
        return false;
    }
}