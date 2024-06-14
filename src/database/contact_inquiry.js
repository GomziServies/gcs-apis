/**
 * @author Divyesh Baraiya
 * @description User Inquiry
 */
const mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId

let required = true,
    trim = true

const contact_inquiry = new mongoose.Schema({
    name: { type: String, trim },
    email: { type: String, trim, lowercase: true, },
    mobile: { type: String, trim },
    message: { type: String, trim },
    subject: { type: String, trim },
    source: { type: String },
    read_receipt: { type: Boolean, default: false },
    feedback_respond: { type: String, trim },
    updatedBy: { type: ObjectId, trim },
    status: { type: Boolean, default: true },
    developer_notes: { type: Object }, // For Admin
    additional_note: { type: String, trim }
}, {
    timestamps: true
})

module.exports = mongoose.model('inquiry', contact_inquiry, 'inquiry')