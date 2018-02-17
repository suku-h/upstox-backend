import * as uid from 'uid-gen'
import Customer from '../models/customer'
import { checkBadRequest, checkNotFound } from '../utils/http'
import { isNull } from '../utils/util'
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

  async getCustomer(req: Request, res: Response) {
    try {
      let customer_id = req.body.customer_id
      console.log('customer_id', customer_id)

      checkBadRequest(customer_id, 'blank customer id')

      let customer = await Customer.findOne(customer_id)

      let logMessage = 'customer not found for id ' + customer_id
      checkNotFound(customer, 'Customer', logMessage)

      res.json(customer)
    } catch (err) {
      console.log('err', err)
      res.status(500).json({ error: err.toString() });
    }
  }

  createCustomer(req: Request, res: Response): void {
    let input = req.body


    let customer = new Customer({
      customer_id: this.idgen.simple(12),
      email: input.email
    });

    if (undefined !== input.referral_id && null !== input.referral_id) {
      let referralId = input.referral_id;
    } else {
      Customer.create(customer, (err, doc) => {
        if (err) {
          throw err;
        } else {
          console.log('doc', doc);
          res.json(doc);
        }
      });
    }
  }


  routes() {
    this.router.get('/', this.getCustomer)
  }
}

const customerRoutes = new CustomerRouter()
customerRoutes.routes()
const customerRouter = customerRoutes.router

export default customerRouter