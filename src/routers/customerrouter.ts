import * as uid from 'uid-gen'
import Customer from '../pojos/customer'
import CustomerModel from '../models/customer'
import {
  checkBadRequest,
  checkNotFound,
  checkValidEmail,
  returnError
  } from '../utils/http'
import { isEmptyString, isNotNull, isNull } from '../utils/util'
import { Request, Response, Router } from 'express'
import { unauthorised } from '../utils/http'

class CustomerRouter {
  public router: Router
  private idgen

  constructor() {
    let options = { digits: "0123456789" }
    this.idgen = new uid.IDGenerator(options)
    this.router = Router()
    this.routes()
  }

  async getCustomer(req: Request, res: Response) {
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

  async createCustomer(req: Request, res: Response) {
    try {
      let email = req.body.email
      let referralId = req.body.referral_id

      checkValidEmail(email)

      let existingCustomer = await CustomerModel.findOne({ email }).select('_id')
      if (isNotNull(existingCustomer)) {
        console.log('customer already exists', email)
        throw unauthorised('Customer already exists')
      }

      if (!isEmptyString(referralId)) {
        const referrer = await CustomerModel.findOne({ customer_id: referralId }).select('_id')

        let referrerNotFoundMsg = 'referrer with id ' + referralId + ' was not found for customer, ' + email
        checkNotFound(referrer, 'Referrer', referrerNotFoundMsg)
      }

      let customer = new CustomerModel({
        customer_id: this.idgen.simple(12),
        email: email,
        referral_id: referralId
      })

      const newCustomer = await CustomerModel.create(customer)

      res.json(newCustomer)
    } catch (err) {
      returnError(err, res)
    }
  }


  routes() {
    this.router.get('/', (req, res) => this.getCustomer(req, res))
    this.router.post('/', (req, res) => this.createCustomer(req, res))
  }
}

const customerRoutes = new CustomerRouter()
customerRoutes.routes()
const customerRouter = customerRoutes.router

export default customerRouter