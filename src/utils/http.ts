import ErrorMessage from '../pojos/errormessage'
import {
  isEmptyString,
  isNotNull,
  isNull,
  isValidEmail
  } from './util'
import { Response } from 'express'
export const INVALID_REQUEST = 'Invalid Request'

export function badRequest(message: string): ErrorMessage {
  return new ErrorMessage(400, message)
}

export function notFound(message: string): ErrorMessage {
  return new ErrorMessage(404, message)
}

export function unauthorised(message: string): ErrorMessage {
  return new ErrorMessage(401, message)
}

export function checkBadRequest(obj: any, logMessage: string) {
  if (isNull(obj)) {
    console.log(logMessage)
    throw badRequest(INVALID_REQUEST)
  }
}

export function checkNotFound(obj: any, objType: string, logMessage: string) {
  if (isNull(obj)) {
    console.log(logMessage)
    throw notFound(objType + ' was not found')
  }
}

export function checkValidEmail(obj: any) {
  if (!isValidEmail(obj)) {
    console.log('Invalid email for ' + JSON.stringify(obj))
    throw badRequest(INVALID_REQUEST)
  }
}

export function checkEmptyString(obj: any, logMessage: string) {
  if (isEmptyString(obj)) {
    console.log(logMessage)
    throw badRequest(INVALID_REQUEST)
  }
}

export function returnError(err, res: Response): Response {
  let statusCode = 500
  if (isNotNull(err.statusCode)) {
    statusCode = err.statusCode
  }
  let errStr = err.toString()
  if (isNotNull(err.error)) {
    errStr = err.error.toString()
  }

  return res.status(statusCode).json(errStr)
}