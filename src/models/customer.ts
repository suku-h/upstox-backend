import ICustomer from '../interfaces/customer'
import { model, Schema } from 'mongoose'

let CustomerSchema: Schema = new Schema({
  customer_id: { type: String, required: true },
  email: { type: String, required: true },
  referral_id: { type: String },
  payback: { type: Number, default: 0 },
  isAmbassador: { type: Boolean, default: false },
  ambassadorDate: { type: Date }
}, {
    timestamps: {
      createdAt: 'joiningDate',
      updatedAt: 'lastUpdated'
    }
  })

export default model<ICustomer>('CustomerModel', CustomerSchema, 'customers')