/**
 * @author Smit Luvani
 * @description Export Mongoose Schema Module with Configuration and MongoDB Connection
 * @module https://www.npmjs.com/package/mongoose
 * @tutorial https://mongoosejs.com/docs/guide.html
 */

const mongoose = require('mongoose'),
    { mongoose: mongoose_srv } = require('../../config/secrets'),
    logger = require('../winston'),
    { logging } = require('../../config/default.json')

if (!mongoose_srv[process.env.NODE_ENV].srv) {
    logger.error('Secrets [Mongoose]: srv not found')
}

try {
    mongoose.connect(mongoose_srv[process.env.NODE_ENV].srv, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
        .then((c) => { logger.info('Service [Mongoose]: Connected ' + `[${c?.connection?.db?.databaseName || '##DB_CONNECTION_FAILED##'}]`); })
        .catch((error) => {
            logger.error('Service [Mongoose]: ', error);
        })
} catch (error) {
    logger.error('Service [Mongoose]: ' + error)
}