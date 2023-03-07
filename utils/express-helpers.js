/**
 * Return error result
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 * @param { Error } error
 */
export const errorRes = (req, res, error) => {
  let code = error.code || 422;
  if (code > 500 || isNaN(code)) code = 500;

  if (!req.headers.test) {
    console.log(`\x1b[31mERROR:\x1b[35m ${error.message}\x1b[0m`);
    console.log(`\x1b[31mENDPOINT:\x1b[35m ${req.baseUrl}${req.url} (${req.method})\x1b[0m`);
    console.log(error);
  }

  res.status(code).json({ success: false, message: error.message }).end();
};


/**
 * Return success result
 * @param { import('express').Response } res
 * @param { any } obj
 * @param { number } code
 */
export const successRes = (res, obj, code = 200) => {
  res.status(code).json({ success: true, payload: obj }).end();
};
