import * as bodyParser from 'body-parser'
import * as compression from 'compression'
import * as cors from 'cors'
import * as express from 'express'
import * as helmet from 'helmet'
import * as logger from 'morgan'
import * as mongoose from 'mongoose'
import CustomerRouter from './routers/customerrouter'

const MONGO_URI = 'mongodb://127.0.0.1/upstox'


class Server {
  public app: express.Application

  constructor() {
    this.app = express()
    this.config();
    this.routes();
  }

  // we set up the project configurations
  public config() {
    // connect with mongodb
    mongoose.connect(MONGO_URI || process.env.MONGO_URI)

    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(bodyParser.json())
    this.app.use(helmet())
    this.app.use(logger('dev'))
    this.app.use(cors())
    this.app.use(compression())
  }

  public routes() {
    let router: express.Router = express.Router()

    this.app.use('/', router)
    this.app.use('/customer', CustomerRouter)
  }
}

export default new Server().app