import validator from 'validator';
import jwt from 'jsonwebtoken';
import { generateHashedPassword, generateSalt } from '../utils/encryption.js';
import { validateId, validateListBody } from '../utils/common-functions.js';
import * as rest from '../utils/express-helpers.js';
import settings from '../config/settings.js';
import CError from '../utils/CError.js';
import User from '../models/User.js';


/** @type { import('express').RequestHandler } */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.toString().trim()) throw new CError(`Missing field 'email'`, 422);
    if (!password || !password.toString().trim()) throw new CError(`Missing field 'password'`, 422);
    if (!validator.isEmail(email.toString().trim())) throw new CError(`Invalid field 'email'. Must be valid email address!`, 422);

    const user = await User.findOneAndUpdate({ email: email.trim().toLowerCase() }, { tokenDate: new Date() }, { new: true, runValidators: true });
    if (!user) throw new CError(`User with this email don't exists`, 404);
    if (!user.authenticate(password.toString().trim())) throw new CError(`Wrong password`, 401);

    const payload = { sub: user.id, tokenDate: user.tokenDate };
    const token = jwt.sign(payload, settings.jwtKey);

    res.status(200).json({ success: true, token, user: user.clean() });
  } catch (error) {
    rest.errorRes(req, res, error);
  }
};


/** @type { import('express').RequestHandler } */
export const check = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.toString().trim()) throw new CError(`Missing field 'email'`, 422);
    if (!validator.isEmail(email.toString().trim())) throw new CError(`Invalid field 'email'. Must be valid email address!`, 422);

    const result = await User.findOne({ email }).lean();

    rest.successRes(res, { emailExists: Boolean(result) });
  } catch (error) {
    rest.errorRes(req, res, error);
  }
};


/** @type { import('express').RequestHandler } */
export const register = async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    if (!email || !email.toString().trim()) throw new CError(`Missing field 'email'`, 422);
    if (!password || !password.toString().trim()) throw new CError(`Missing field 'password'`, 422);
    if (!firstName || !firstName.toString().trim()) throw new CError(`Missing field 'firstName'`, 422);
    if (!lastName || !lastName.toString().trim()) throw new CError(`Missing field 'lastName'`, 422);
    if (password.toString().length < 6) throw new CError(`Password must be min. 6 symbols`, 422);
    if (!validator.isEmail(email.toString().trim())) throw new CError(`Invalid field 'email'. Must be valid email address!`, 422);

    const checkUsers = await User.findOne({ email: email.toLowerCase().trim() }).lean();
    if (checkUsers) throw new CError(`User with email ${email} already exists!`, 409);

    const salt = generateSalt();
    const userData = {
      email: email.toLowerCase(),
      firstName,
      lastName,
      salt,
      pass: generateHashedPassword(salt, password.toString())
    };

    const newUser = await User.create(userData);
    const user = newUser.clean();

    const payload = { sub: user.id, tokenDate: user.tokenDate };
    const token = jwt.sign(payload, settings.jwtKey);

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    rest.errorRes(req, res, error);
  }
};


/** @type { import('express').RequestHandler } */
export const list = async (req, res) => {
  try {
    const { page = 1, limit = 10, pagination = true, sort = { firstName: -1 }, email, name } = req.body;
    const { _id } = req.user;

    const checkBody = validateListBody(req.body);
    if (checkBody.length) throw new CError(checkBody.join(' | '));

    const filter = { _id: { $ne: _id } };
    if (email && email.toString().trim()) filter.email = { $regex: new RegExp(email, 'gi') };

    const secondFilter = {};
    if (name && name.toString().trim()) secondFilter.fullName = { $regex: new RegExp(name, 'gi') };

    const aggregateQuery = User.aggregate([
      { $match: filter },
      { $addFields: { fullName: { $concat: ['$firstName', ' ', '$lastName'] } } },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          fullName: 1
        }
      },
      { $match: secondFilter }
    ]);

    const result = await User.aggregatePaginate(aggregateQuery, {
      page,
      limit,
      sort,
      pagination
    });

    rest.successRes(res, result);
  } catch (error) {
    rest.errorRes(req, res, error);
  }
};


/** @type { import('express').RequestHandler } */
export const single = async (req, res) => {
  try {
    const { _id } = req.params;
    const { _id: user } = req.user;

    validateId(_id);

    const select = ['email', 'firstName', 'lastName'];
    if (user.toString() === _id.toString()) select.push('balance');

    const result = await User.findOne({ _id }).select(select.join(' ')).lean();
    if (!result) throw new CError(`User with id ${_id} don't exists`, 404);

    rest.successRes(res, result);
  } catch (error) {
    rest.errorRes(req, res, error);
  }
};


/** @type { import('express').RequestHandler } */
export const logout = async (req, res) => {
  try {
    const { _id } = req.user;

    await User.findOneAndUpdate({ _id }, { tokenDate: new Date() }, {});

    rest.successRes(res, { message: 'You have been logged out!' });
  } catch (error) {
    rest.errorRes(req, res, error);
  }
};
