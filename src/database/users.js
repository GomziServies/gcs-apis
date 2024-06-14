/**
 * @author Divyesh Baraiya
 * @description User Profile Information
 */
const mongoose = require('mongoose'),
    { userStatus } = require('../common'),
    { randomDigit } = require('../utils/random'),
    ObjectId = mongoose.Types.ObjectId

let required = true,
    trim = true,
    unique = true

const users = new mongoose.Schema({
    uid: { type: String, required, trim, unique, default: () => randomDigit() },
    first_name: { type: String, required, trim },
    last_name: { type: String, required, trim },
    email: { type: String, trim, lowercase: true },
    mobile: { type: String, trim },
    authToken: { type: Number, trim, default: () => randomDigit(6) },
    status: { type: String, required, trim, enum: Object.values(userStatus), default: userStatus.active },
    createdBy: { type: ObjectId, trim },
    updatedBy: { type: ObjectId, trim },
}, {
    timestamps: true
})

module.exports = mongoose.model('gcsUser', users, 'gcsUser')