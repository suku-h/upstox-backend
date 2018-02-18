export default class Customer {
  customer_id: string
  email: string
  referral_id: string
  payback: number
  isAmbassador: Boolean
  joiningDate: Date
  lastUpdated: Date

  static getPayback(referrer: Customer): number {
    const joiningFees = 100
    let payback = 0.3 * joiningFees
    if (referrer.isAmbassador) {
      payback += 0.1 * joiningFees
    }
    return payback
  }
}