import crypto from 'crypto';
import settings from '../config/settings.js';

export const generateHashedPassword = (salt, password) => crypto.createHmac('sha256', salt).update(password).digest('hex');
export const generateSalt = () => crypto.randomBytes(128).toString('base64');

/**
 * Crypt card important data
 * @param { string } number Card number
 * @param { string } cvv Card security code
 */
export const encryptCardData = (number, cvv) => {
  const iv = crypto.randomBytes(16);
  const secretKey = crypto.scryptSync(settings.cryptKey, iv, 32);
  const cipherNumber = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
  const cipherCvv = crypto.createCipheriv('aes-256-cbc', secretKey, iv);

  return {
    salt: iv.toString('base64'),
    number: Buffer.concat([cipherNumber.update(number), cipherNumber.final()]).toString('base64'),
    cvv: Buffer.concat([cipherCvv.update(cvv), cipherCvv.final()]).toString('base64')
  };
};

/**
 * Decrypt card data
 * @param { string } iv
 * @param { string } number
 * @param { string } cvv
 */
export const decryptCardData = (iv, number, cvv) => {
  const secretKey = crypto.scryptSync(settings.cryptKey, Buffer.from(iv, 'base64'), 32);
  const decipherNumber = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'base64'));
  const decipherCvv = crypto.createDecipheriv('aes-256-cbc', secretKey, Buffer.from(iv, 'base64'));

  return {
    number: Buffer.concat([decipherNumber.update(Buffer.from(number, 'base64')), decipherNumber.final()]).toString(),
    cvv: Buffer.concat([decipherCvv.update(Buffer.from(cvv, 'base64')), decipherCvv.final()]).toString()
  };
};
