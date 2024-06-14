let JoiBase = require('joi');
JoiBase = JoiBase.extend(require('@joi/date'));
const Joi = JoiBase.defaults((schema) => schema.options({
    abortEarly: false,
    errors: {
        wrap: {
            array: false
        }
    }
}));

/**
 * @return {import('joi')}
 */
module.exports = Joi;
