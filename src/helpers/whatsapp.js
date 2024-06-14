const unirest = require('unirest');
const { logger } = require('../services');

const WhatsAppToken = process.env.WhatsAppToken
const phoneNumberID = process.env.phoneNumberID

if (!WhatsAppToken || !phoneNumberID) {
    console.error(new Error('WhatsAppToken or phoneNumberID is not defined in environment variables.'))
}

const BaseURL = 'https://bot.officialwa.com/api/v1/whatsapp/send/template';

/**
 * @author Smit Luvani
 * @param {Number} to_mobile_number 
 * @param {Object} queryParams
 * @returns 
 */
async function sendMessage(to_mobile_number, queryParams) {
    if (!to_mobile_number) throw new Error('to_mobile_number is required')

    return await unirest
        .get(BaseURL)
        .query(queryParams)
        .query({
            sendToPhoneNumber: to_mobile_number,
            apiToken: WhatsAppToken,
            phoneNumberID: phoneNumberID,
        })
        .then((response) => {
            logger.info(`[WhatsAppHelper] ${response.body?.message || response.body}`)
            return response.body;
        })
        .catch((error) => {
            logger.error(error.stack)
            return error;
        });
}

module.exports.sendMessage = sendMessage;