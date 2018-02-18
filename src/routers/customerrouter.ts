import * as uid from 'uid-gen'
import CommonResponse from '../pojos/commonresponse'
import Customer from '../pojos/customer'
import CustomerModel from '../models/customer'
import {
  checkBadRequest,
  checkNotFound,
  checkValidEmail,
  returnError
  } from '../utils/http'
import { checkNotFound, unauthorised } from '../utils/http'
import { isEmptyString, isNotNull, isNull } from '../utils/util'
import { Request, Response, Router } from 'express'

class CustomerRouter {
  public router: Router
  private idgen

  constructor() {
    let options = { digits: "0123456789" }
    this.idgen = new uid.IDGenerator(options)
    this.router = Router()
    this.routes()
  }

  async getCustomerById(req: Request, res: Response) {
    try {
      let customerId = req.query.customer_id

      checkBadRequest(customerId, 'blank customer id')

      let customer = await CustomerModel.findOne({ customer_id: customerId })

      let logMessage = 'customer not found for id ' + customerId
      checkNotFound(customer, 'Customer', logMessage)

      res.json(customer)
    } catch (err) {
      returnError(err, res)
    }
  }

  async addCustomer(req: Request, res: Response) {
    try {
      let email = req.body.email
      let referralId = req.body.referral_id
      let referrer

      checkValidEmail(email)

      let existingCustomer = await CustomerModel.findOne({ email }).select('_id')
      if (isNotNull(existingCustomer)) {
        console.log('customer already exists', email)
        throw unauthorised('Customer already exists')
      }

      if (!isEmptyString(referralId)) {
        referrer = await CustomerModel.findOne({ customer_id: referralId }).select('_id, isAmbassador')

        let referrerNotFoundMsg = 'referrer with id ' + referralId + ' was not found for customer, ' + email
        checkNotFound(referrer, 'Referrer', referrerNotFoundMsg)
      }

      let customer = new CustomerModel({
        customer_id: this.idgen.simple(12),
        email: email,
        referral_id: referralId,
        isAmbassador: req.body.isAmbassador
      })

      const newCustomer = await CustomerModel.create(customer)

      if (isNotNull(referrer)) {
        const payback = Customer.getPayback(referrer)
        await CustomerModel.update({ _id: referrer._id }, { $inc: { payback } })
      }

      res.json(newCustomer)
    } catch (err) {
      returnError(err, res)
    }
  }

  async addReferral(req: Request, res: Response) {
    try {
      let customerId = req.body.customer_id
      let referralId = req.body.referral_id

      let customer = await CustomerModel.findOne({ customer_id: customerId }).select('_id, referral_id')

      let logMessage = 'customer not found for id ' + customerId
      checkNotFound(customer, 'Customer', logMessage)

      if (isNotNull(customer.referral_id)) {
        console.log('customer ', customerId, ' has already been referred by ', customer.referral_id)
        throw unauthorised('Customer already has a referral')
      }

      let referrer = await CustomerModel.findOne({ customer_id: referralId }).select('_id, isAmbassador')

      logMessage = 'referrer not found for id ' + referralId
      checkNotFound(referrer, 'Referrer', logMessage)

      await CustomerModel.update({ _id: customer._id }, { $set: { referral_id: referralId } })

      let payback = Customer.getPayback(referrer)
      await CustomerModel.update({ _id: referrer._id }, { $inc: { payback } })

      res.json(CommonResponse.getSuccess())
    } catch (err) {
      returnError(err, res)
    }
  }


  routes() {
    this.router.get('/', (req, res) => this.getCustomerById(req, res))
    this.router.post('/', (req, res) => this.addCustomer(req, res))
    this.router.put('/referral', (req, res) => this.addReferral(req, res))
  }
}

const customerRoutes = new CustomerRouter()
customerRoutes.routes()
const customerRouter = customerRoutes.router

export default customerRouter