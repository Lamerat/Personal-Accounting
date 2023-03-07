import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import CError from '../utils/CError.js';
import settings from '../config/settings.js';
import { errorRes } from '../utils/express-helpers.js';


/** @type { import('express').RequestHandler } */
export default async (req, res, next) => {
  try {
    const { authorization: token } = req.headers;

    if (!token) throw new CError(`Missing or invalid authorization header`);

    const decoded = jwt.verify(token.replace('Bearer ', ''), settings.jwtKey);
    const { sub, tokenDate } = decoded;

    const user = await User.findOne({ _id: sub, tokenDate });
    if (!user) throw new CError(`This user don't exists or token is expired`);

    req.user = user.clean();

    next();
  } catch (error) {
    errorRes(req, res, new CError(error.message, 401));
  }
};
