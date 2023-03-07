import mongoose from 'mongoose';
import moment from 'moment';
import { validateId, validateListBody } from '../utils/common-functions.js';
import * as rest from '../utils/express-helpers.js';
import Operation from '../Models/Operation.js';
import settings from '../config/settings.js';
import CError from '../utils/CError.js';

const ObjectId = mongoose.Types.ObjectId;


/** @type { import('express').RequestHandler } */
export const transactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, pagination = true, sort = { createdAt: -1 } } = req.body;
    const { startDate = moment('1970-01-01').toDate(), endDate = moment().toDate() } = req.body;
    const { type, recipient, card, description, amountMax, amountMin, direction } = req.body;
    const { _id: user } = req.user;

    const checkBody = validateListBody(req.body);
    if (checkBody.length) throw new CError(checkBody.join(' | '));

    // Validate dates
    if (!moment(startDate).isValid()) throw new CError(`Invalid field 'startDate'`);
    if (!moment(endDate).isValid()) throw new CError(`Invalid field 'endDate'`);
    const start = moment.utc(startDate).startOf('day').toDate();
    const end = moment.utc(endDate).endOf('day').toDate();
    if (moment(end).isBefore(start)) throw new CError(`Date 'endDate' must be after 'startDate'`, 422);

    // Filters
    const filter = { $or: [{ user }, { recipient: user }], createdAt: { $gte: start, $lte: end } };

    if (type && Array.isArray(type) && type.length && type.every(x => Object.keys(settings.operationType).includes(x))) filter.type = { $in: type };
    if (recipient && Array.isArray(recipient) && recipient.length && recipient.every(x => validateId(x))) filter.recipient = { $in: recipient.map(x => new ObjectId(x)) };
    if (card && Array.isArray(card) && card.length && card.every(x => validateId(x))) filter.card = { $in: card.map(x => new ObjectId(x)) };
    if (description && description.toString().trim()) filter.description = { $regex: new RegExp(description, 'gi') };
    if (amountMin && !isNaN(amountMin) && Number(amountMin) > 0) filter.amount = { $gte: Number(amountMin) };
    if (amountMax && !isNaN(amountMax) && Number(amountMax) > 0) {
      if (amountMin && Number(amountMin > Number(amountMax))) throw new CError(`Field 'amountMax' must be greater from 'amountMin'`);
      filter.amount = filter.amount ? { ...filter.amount, $lte: Number(amountMax) } : { $lte: Number(amountMax) };
    }

    const secondFilter = {};
    const validDirections = ['income', 'outcome'];
    if (direction && Array.isArray(direction) && direction.length && direction.every(x => validDirections.includes(x))) secondFilter.direction = { $in: direction };

    const aggregateQuery = Operation.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
          pipeline: [{ $project: { _id: 1, firstName: 1, lastName: 1 } }]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'recipient',
          foreignField: '_id',
          as: 'recipient',
          pipeline: [{ $project: { _id: 1, firstName: 1, lastName: 1 } }]
        }
      },
      {
        $lookup: {
          from: 'cards',
          localField: 'card',
          foreignField: '_id',
          as: 'card',
          pipeline: [{ $project: { _id: 1, last4: 1, brand: 1, expMonth: 1, expYear: 1, name: 1, deletedAt: 1 } }]
        }
      },
      { $unwind: { preserveNullAndEmptyArrays: true, path: '$user' } },
      { $unwind: { preserveNullAndEmptyArrays: true, path: '$recipient' } },
      { $unwind: { preserveNullAndEmptyArrays: true, path: '$card' } },
      { $addFields: { direction: { $cond: [{ $eq: ['$type', settings.operationType.deposit] }, 'income', 'outcome'] } } },
      {
        $project: {
          _id: 1,
          user: 1,
          direction: 1,
          amount: 1,
          createdAt: 1,
          description: 1,
          type: 1,
          card: { $ifNull: ['$card', null] },
          recipient: { $ifNull: ['$recipient', null] }
        }
      },
      { $match: secondFilter }
    ]);


    const result = await Operation.aggregatePaginate(aggregateQuery, {
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
export const balance = async (req, res) => {
  try {
    const { startDate = moment('1970-01-01').toDate(), endDate = moment().toDate() } = req.body;
    const { _id: user } = req.user;

    if (!moment(startDate).isValid()) throw new CError(`Invalid field 'startDate'`);
    if (!moment(endDate).isValid()) throw new CError(`Invalid field 'endDate'`);

    const start = moment.utc(startDate).startOf('day').toDate();
    const end = moment.utc(endDate).endOf('day').toDate();
    if (moment(end).isBefore(start)) throw new CError(`Date 'endDate' must be after 'startDate'`, 422);

    const transactionsInPeriod = await Operation.find({ $or: [{ user }, { recipient: user }], createdAt: { $gte: start, $lte: end } });
    const transactionsBeforePeriod = await Operation.find({ $or: [{ user }, { recipient: user }], createdAt: { $lt: start } });

    const calculateBalance = (transactions = [], startBalance = 0) => {
      return transactions.reduce((acc, el) => {
        const { type, amount, recipient } = el;
        if (type === settings.operationType.deposit) {
          acc = acc + amount;
        } else if (type === settings.operationType.withdraw) {
          acc = acc - amount;
        } else {
          acc = recipient.toString() === user.toString() ? acc + amount : acc - amount;
        }
        return acc;
      }, startBalance);
    };

    const startBalance = calculateBalance(transactionsBeforePeriod, 0);
    const endBalance = calculateBalance(transactionsInPeriod, startBalance);

    rest.successRes(res, { startBalance, endBalance });
  } catch (error) {
    rest.errorRes(req, res, error);
  }
};
