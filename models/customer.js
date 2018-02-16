let mongoose = require('mongoose');
let schema = mongoose.Schema;

let customerSchema = new schema({
  customer_id: { type: String, required: true },
  email: { type: String, required: true },
  referral_id: { type: String },
  payback: { type: Number, default: 0 },
  isAmbassador: { type: Boolean, default: false },
  joiningDate: { type: Date, required: true },
  lastUpdated: { type: Date }
});

var Customer = mongoose.model('Customer', customerSchema, 'customers');

module.exports = Customer