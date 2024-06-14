/**
 * @author Divyesh Baraiya
 * @description Common Invoice Schema. It may be extended to order invoice, user invoice, etc.
 */

const mongoose = require('mongoose'), ObjectId = mongoose.Types.ObjectId;

const required = trim = unique = true;

const MongooseSchema = new mongoose.Schema({
    invoice_number: { type: Number, required },
    date: { type: Date, required, trim },
    fullName: { type: String, required, trim },
    email: { type: String, trim, lowercase: true },
    phoneNumber: { type: String, trim },
    invoiceAddress: { type: String, required, trim },
    productName: [{
        item_name: { type: String, required, trim },
    }],
    bank_details: {
        account_type: { type: String, trim },
        bank_name: { type: String, trim },
        account_number: { type: String, trim },
        branch_code: { type: String, trim },
    },
    payment_method: { type: String },
    totalPayment: { type: Number, required, trim },
    paidPayment: { type: Number, trim },
    invoiceNotes: { type: String, trim },
    createdById: { type: ObjectId, trim },
    updatedById: { type: ObjectId, trim },
}, {
    timestamps: true
})

module.exports = mongoose.model('invoice', MongooseSchema, 'invoice')