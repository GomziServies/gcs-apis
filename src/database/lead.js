/**
 * @author Divyesh Baraiya
 * @description Lead Schema 
 */

const mongoose = require('mongoose'), ObjectId = mongoose.Types.ObjectId;

const required = trim = unique = true;

const status = {
    active: 'active',
    inactive: 'inactive',
};

const MongooseSchema = new mongoose.Schema({
    date: { type: String, trim },
    fullName: { type: String, trim },
    service: { type: String, trim },
    industryOrCompany: { type: String, trim },
    businessName: { type: String, trim },
    goalOrAnnualIncome: { type: String, trim },
    email: { type: String, trim },
    phoneNumber: { type: String, trim },
    leadAddress: { type: String, trim },
    reference: { type: String, trim },
    notes: { type: String, trim },
    leadType: { type: String, trim },
    status: { type: String, required, trim, enum: Object.values(status), default: status.active },
    createdById: { type: ObjectId, trim },
    updatedById: { type: ObjectId, trim },
}, {
    timestamps: true
})

module.exports = mongoose.model('lead', MongooseSchema, 'lead')