import path from 'path';
import 'dotenv/config';


// PATH SETTINGS
const rootPath = path.normalize(path.join(path.resolve(), '/../'));

// SERVER SETTINGS
const tooLongRequest = process.env.TOO_LONG_REQUEST || 20;
const port = process.env.PORT;
const jwtKey = process.env.JWT_KEY;
const cryptKey = process.env.CRYPT_KEY;
const env = process.env.NODE_ENV || 'development';
const operationType = {
  deposit: 'deposit',
  withdraw: 'withdraw',
  transfer: 'transfer'
};

// DATABASE SETTINGS
const databaseAddress = {
  development: process.env.DEV_DB,
  production: process.env.PROD_DB || ''
};

const settings = {
  rootPath,
  tooLongRequest,
  port,
  db: databaseAddress[env],
  jwtKey,
  cryptKey,
  env,
  operationType
};

export default settings;
