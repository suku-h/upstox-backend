import * as _ from 'lodash'
import * as uid from 'uid-gen'
import CommonResponse from '../pojos/commonresponse'
import Customer from '../pojos/customer'
import CustomerModel from '../models/customer'
import {
  badRequest,
  checkBadRequest,
  checkEmptyString,
  checkNotFound,
  checkValidEmail,
  notFound,
  returnError,
  unauthorised
  } from '../utils/http'
import {
  isEmptyString,
  isNotNull,
  isNull,
  wrap
  } from '../utils/util'
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
        referral_id: referralId
      })

      const newCustomer = await CustomerModel.create(customer)

      if (isNotNull(referrer)) {
        const payback = Customer.getPayback(customer, referrer)
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

      let payback = Customer.getPayback(customer, referrer)
      await CustomerModel.update({ _id: referrer._id }, { $inc: { payback } })

      res.json(CommonResponse.getSuccess())
    } catch (err) {
      returnError(err, res)
    }
  }

  async fetchAllChildren(req: Request, res: Response) {
    try {
      let customerId = req.query.customer_id

      checkEmptyString(customerId, 'Blank customer id')

      let customers = await CustomerModel.find({ referral_id: customerId })
      res.json(customers)
    } catch (err) {
      returnError(err, res)
    }
  }

  async addAmbassador(req: Request, res: Response) {
    try {
      let email = req.body.email

      checkValidEmail(email)

      let existingCustomer = await CustomerModel.findOne({ email }).select('_id')
      if (isNotNull(existingCustomer)) {
        console.log('customer already exists', email)
        throw unauthorised('Customer already exists')
      }

      let customer = new CustomerModel({
        customer_id: this.idgen.simple(12),
        email: email,
        isAmbassador: true,
        ambassadorDate: new Date()
      })

      const ambassador = await CustomerModel.create(customer)

      res.json(ambassador)
    } catch (err) {
      returnError(err, res)
    }
  }

  async fetchAllCustomersWithReferralCount(req: Request, res: Response) {
    try {
      const customers = await CustomerModel.find()

      let referralCountMap = new Map<string, number>()
      for (let customer of customers) {
        referralCountMap.set(customer.customer_id, 0)
        if (isNotNull(customer.referral_id)) {
          referralCountMap.set(customer.referral_id, referralCountMap.get(customer.referral_id) + 1)
        }
      }

      let referralCountArray = _.entries(referralCountMap).map(([customerId, referralCount]) => ({ customerId, referralCount }))

      referralCountArray = _.sortBy(referralCountArray, 'referralCount').reverse()

      res.json(referralCountArray)
    } catch (err) {
      returnError(err, res)
    }
  }

  async convertCustomerToAmbassador(req: Request, res: Response) {
    try {
      let customerId = req.body.customer_id

      let customer = await CustomerModel.findOne({ customer_id: customerId }).select('_id, isAmbassador')

      let logMessage = 'Customer, ' + customerId + ', was not found'
      checkNotFound(customer, 'Customer', logMessage)

      if (isNotNull(customer.isAmbassador) && customer.isAmbassador === true) {
        console.log('customer is already an ambassador', customerId)
        throw unauthorised('customer is already an ambassador')
      }

      await CustomerModel.update({ _id: customer._id }, { $set: { isAmbassador: true, ambassadorDate: new Date() } })

      res.json(CommonResponse.getSuccess())
    } catch (err) {
      returnError(err, res)
    }
  }

  async fetchAllAmbassadorChildren(req: Request, res: Response) {
    try {
      let ambassadorId = req.query.customer_id

      let ambassador = await CustomerModel.findOne({ customer_id: ambassadorId }).select('isAmbassador, ambassadorDate')

      let logMessage = 'Customer, ' + ambassadorId + ', was not found'
      checkNotFound(ambassador, 'Customer', ambassadorId)

      if (isNotNull(ambassador.isAmbassador) && ambassador.isAmbassador === false) {
        console.log('Customer is not and ambassador', ambassadorId)
        throw notFound('Ambassador was not found')
      }

      let children = await CustomerModel.find({ referral_id: ambassadorId, joiningDate: { $gte: ambassador.ambassadorDate } })
      res.json(children)
    } catch (err) {
      returnError(err, res)
    }
  }

  async fetchChildrenAtNthLevel(req: Request, res: Response) {
    try {
      let ambassadorId = req.query.customer_id
      let level = req.query.level

      if (isNotNull(level) && level < 1 || level % 1 !== 0) {
        console.log('invalid value for level', level)
        throw badRequest('Invalid value for level')
      }

      let ambassador = await CustomerModel.findOne({ customer_id: ambassadorId }).select('isAmbassador, ambassadorDate')

      let logMessage = 'Customer, ' + ambassadorId + ', was not found'
      checkNotFound(ambassador, 'Customer', ambassadorId)

      if (isNotNull(ambassador.isAmbassador) && ambassador.isAmbassador === false) {
        console.log('Customer is not and ambassador', ambassadorId)
        throw notFound('Ambassador was not found')
      }

      let childrenNLevel: Customer[] = []
      let children = await CustomerModel.find({ referral_id: ambassadorId, joiningDate: { $gte: ambassador.ambassadorDate } })
      childrenNLevel = childrenNLevel.concat(children)

      let i = 1
      while (i < level && children.length > 0) {
        let referrerIds = _.map(children, 'customer_id')

        children = await CustomerModel.find({ referral_id: { $in: referrerIds } })

        if (children.length > 0) {
          childrenNLevel = childrenNLevel.concat(children)
        }
        i++
      }
      res.json(childrenNLevel)
    } catch (err) {
      returnError(err, res)
    }
  }

  routes() {
    this.router.get('/', (req, res) => this.getCustomerById(req, res))
    this.router.post('/', (req, res) => this.addCustomer(req, res))
    this.router.put('/referral', (req, res) => this.addReferral(req, res))
    this.router.get('/children/all', (req, res) => this.fetchAllChildren(req, res))
    this.router.post('/ambassador', (req, res) => this.addAmbassador(req, res))
    this.router.get('/referral/count', (req, res) => this.fetchAllCustomersWithReferralCount(req, res))
    this.router.put('/ambassador', (req, res) => this.convertCustomerToAmbassador(req, res))
    this.router.get('/ambassador/children', (req, res) => this.fetchAllAmbassadorChildren(req, res))
    this.router.get('/ambassador/children/level', (req, res) => this.fetchChildrenAtNthLevel(req, res))
  }
}

const customerRoutes = new CustomerRouter()
customerRoutes.routes()
const customerRouter = customerRoutes.router

export default customerRouter

