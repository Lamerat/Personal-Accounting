class CodeError extends Error {
  constructor (code = 422, ...params) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CodeError);
    }
    this.code = code;
    this.info = params[0];
    this.date = new Date();
  }
}

export default class CError {
  /**
   * @param { string } message Error message
   * @param { number } code Error HTTP code
   */
  constructor (message, code = 422) {
    return new CodeError(code, message);
  }
}
