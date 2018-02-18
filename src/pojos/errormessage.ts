export default class ErrorMessage {
  statusCode: number
  error: Error

  constructor(statusCode: number, message: string) {
    this.statusCode = statusCode
    this.error = new Error(message)
  }
}