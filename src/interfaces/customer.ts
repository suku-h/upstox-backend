import * as mongoose from 'mongoose'

export default interface ICustomer extends mongoose.Document {
  customer_id: string
  email: string
  referral_id: string
  payback: number
  isAmbassador: Boolean
  joiningDate: Date
  lastUpdated: Date
}