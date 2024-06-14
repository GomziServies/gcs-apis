/**
 * @author Divyesh Baraiya
 * @description Admin Profile Information
 */

const mongoose = require('mongoose'),
    { adminType } = require('../common'),
    { randomDigit } = require('../utils/random'),
    ObjectId = mongoose.Types.ObjectId

let required = true,
    trim = true,
    unique = true

const admins = new mongoose.Schema({
    full_name: { type: String, required, trim, default: adminType.master },
    email: { type: String, required, trim, lowercase: true, unique },
    mobile: { type: String, required, trim },
    password: { type: String, required },
    authToken: { type: Number, default: () => randomDigit() },
    type: { type: String, required, trim, enum: Object.values(adminType), default: adminType.admin },
    status: { type: Boolean, default: true },
    createdBy: { type: ObjectId, ref: 'admins' },
    updatedBy: { type: ObjectId, ref: 'admins' }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

module.exports = mongoose.model('admins', admins, 'admins');