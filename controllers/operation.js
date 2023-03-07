import chalk from 'chalk';
import { validateId } from '../utils/common-functions.js';
import * as rest from '../utils/express-helpers.js';
import Operation from '../Models/Operation.js';
import settings from '../config/settings.js';
import CError from '../utils/CError.js';
import User from '../models/User.js';
import Card from '../Models/Card.js';

const populate = [
  { path: 'user', select: 'firstName lastName' },
  { path: 'card', select: 'last4 brand expMonth expYear' },
  { path: 'recipient', select: 'firstName lastName' }
];


/** @type { import('express').RequestHandler } */
export const deposit = async (req, res) => {
  try {
    const { card, amount, description } = req.body;
    const { _id: user } = req.user;

    // Validate body
    if (!card || !card.toString().trim() || !validateId(card.toString())) throw new CError(`Missing field 'card'`);
    if (!amount || !amount.toString().trim() || isNaN(amount) || Number.parseFloat(amount) <= 0) throw new CError(`Missing or invalid field 'amount'. Must be number bigger from zero`);
    if (!description || !description.toString().trim()) throw new CError(`Missing field 'description'`);

    // Check card
    const checkCard = await Card.findOne({ _id: card, user, deletedAt: null }).lean();
    if (!checkCard) throw new CError(`This card don't exists!`, 404);

    // Create operation
    const operation = await Operation.create({ type: settings.operationType.deposit, user, card, amount, description });
    const result = (await Operation.populate(operation, populate)).toObject();

    const updateUser = await User.findOneAndUpdate({ _id: user }, { $inc: { balance: amount } }, { new: true, runValidators: true }).lean();
    result.updateBalance = updateUser.balance;

    rest.successRes(res, result);
  } catch (error) {
    rest.errorRes(req, res, error);
  }
};


/** @type { import('express').RequestHandler } */
export const withdraw = async (req, res) => {
  try {
    const { card, amount, description } = req.body;
    const { _id: user } = req.user;

    // Validate body
    if (!card || !card.toString().trim() || !validateId(card.toString())) throw new CError(`Missing field 'card'`);
    if (!amount || !amount.toString().trim() || isNaN(amount) || Number.parseFloat(amount) <= 0) throw new CError(`Missing or invalid field 'amount'. Must be number bigger from zero`);
    if (!description || !description.toString().trim()) throw new CError(`Missing field 'description'`);

    // Check card
    const checkCard = await Card.findOne({ _id: card, user, deletedAt: null }).lean();
    if (!checkCard) throw new CError(`This card don't exists!`, 404);

    // Check balance
    const myBalance = await User.findOne({ _id: user }).select('balance').lean();
    if (myBalance.balance < amount) throw new CError(`Your balance is not enough for this withdraw`, 409);

    // Create operation
    const operation = await Operation.create({ type: settings.operationType.withdraw, user, card, amount, description });
    const result = (await Operation.populate(operation, populate)).toObject();

    const updateUser = await User.findOneAndUpdate({ _id: user }, { $inc: { balance: -amount } }, { new: true, runValidators: true }).lean();
    result.updateBalance = updateUser.balance;

    rest.successRes(res, result);
  } catch (error) {
    rest.errorRes(req, res, error);
  }
};


/** @type { import('express').RequestHandler } */
export const transfer = async (req, res) => {
  try {
    const { recipient, amount, description } = req.body;
    const { _id: user } = req.user;

    // Validate body
    if (!recipient || !recipient.toString().trim() || !validateId(recipient.toString())) throw new CError(`Missing field 'recipient'`);
    if (!amount || !amount.toString().trim() || isNaN(amount) || Number.parseFloat(amount) <= 0) throw new CError(`Missing or invalid field 'amount'. Must be number bigger from zero`);
    if (!description || !description.toString().trim()) throw new CError(`Missing field 'description'`);
    if (recipient.toString().trim() === user.toString().trim()) throw new CError(`Cannot transfer to yourself`, 409);

    // Check recipient
    const checkRecipient = await User.findOne({ _id: recipient, deletedAt: null }).lean();
    if (!checkRecipient) throw new CError(`This user don't exists!`, 404);

    // Check balance
    const myBalance = await User.findOne({ _id: user }).select('balance').lean();
    if (myBalance.balance < amount) throw new CError(`Your balance is not enough for this withdraw`, 409);

    // Create operation
    const operation = await Operation.create({ type: settings.operationType.transfer, user, recipient, amount, description });
    const result = (await Operation.populate(operation, populate)).toObject();

    // Update user balance
    const updateUser = await User.findOneAndUpdate({ _id: user }, { $inc: { balance: -amount } }, { new: true, runValidators: true }).lean();
    result.updateBalance = updateUser.balance;

    // Update recipient balance
    User.findOneAndUpdate({ _id: recipient }, { $inc: { balance: amount } }, {}).catch(error => console.log(chalk.red(`ERROR UPDATE RECIPIENT BALANCE ${error.message}`)));

    rest.successRes(res, result);
  } catch (error) {
    rest.errorRes(req, res, error);
  }
};
