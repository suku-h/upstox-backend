export default class CommonResponse {
  message: string

  static getSuccess(): CommonResponse {
    let response: CommonResponse = {
      message: 'success'
    }

    return response
  }
}