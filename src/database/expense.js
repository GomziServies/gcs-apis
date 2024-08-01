/**
 * @author Divyesh Baraiya
 * @description Expense Data 
 */

const mongoose = require('mongoose'), ObjectId = mongoose.Types.ObjectId;

const required = trim = unique = true;

const MongooseSchema = new mongoose.Schema({
    expense_number: { type: Number, required },
    date: { type: Date, required, trim },
    expenseName: { type: String, required, trim },
    expensePaymentMethod: { type: String },
    expenseItemName: { type: String, required, trim },
    expenseNotes: { type: String, trim },
    expenseAmount: { type: Number, required, trim },
    createdById: { type: ObjectId, trim },
    updatedById: { type: ObjectId, trim },
}, {
    timestamps: true
})

module.exports = mongoose.model('expense', MongooseSchema, 'expense')