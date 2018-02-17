import { isNull } from './util'
export const INVALID_REQUEST = 'Invalid Request'

export function badRequest(message: String): Error {
  return new Error('[400] ' + message)
}

export function notFound(message: String): Error {
  return new Error('[404] ' + message)
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