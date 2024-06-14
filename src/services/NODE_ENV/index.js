/**
 * @author Smit Luvani
 * @description Check Running Environment for Node
 */

const logger = require('../winston'),
    { logging } = require('../../config/default.json');

// Environment
const NODE_ENV = String(process.env.NODE_ENV).trim() || 'development';

module.exports = (req, res, next) => {
    switch (NODE_ENV) {
        case 'development':
        case 'production':
            next()
            break;
        default:
            logger.error('Service [NODE_ENV]: NODE_ENV is not valid. Use \'development\' or \'production\'')
            return res.json({ message: 'Health: Sick', reason: 'Node Environment is not valid' })
    }
}