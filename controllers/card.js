import moment from 'moment';
import { cleanCardData, validateId, validateListBody } from '../utils/common-functions.js';
import { encryptCardData } from '../utils/encryption.js';
import * as rest from '../utils/express-helpers.js';
import creditCardType from 'credit-card-type';
import CError from '../utils/CError.js';
import Card from '../Models/Card.js';


/** @type { import('express').RequestHandler } */
export const addCard = async (req, res) => {
  try {
    const { number, name, expMonth, expYear, cvv, metadata = {} } = req.body;
    const { _id: user } = req.user;
    const currentYear = moment().year();
    const maxYear = moment().add(10, 'years').year();

    // Validate card number and type
    if (!number || !number.toString().trim()) throw new CError(`Missing field 'number'`);
    const cardType = creditCardType(number);
    if (cardType.length !== 1) throw new CError('This card type is not supported');

    // Validate name
    if (!name || !name.toString().trim()) throw new CError(`Missing field 'name'`);
    if (name.toString().split(' ').filter(x => x).length !== 2) throw new CError(`Field name must contain two words`);

    // Validate expire date
    if (!expMonth || !expMonth.toString().trim()) throw new CError(`Missing field 'expMonth'`);
    if (!expYear || !expYear.toString().trim()) throw new CError(`Missing field 'expYear'`);
    if (isNaN(expMonth) || parseInt(expMonth) < 1 || parseInt(expMonth) > 12) throw new CError(`Invalid field 'expMonth'. Must be number between 1 and 12`);
    if (isNaN(expYear) || parseInt(expYear) < currentYear || parseInt(expMonth) > maxYear) throw new CError(`Invalid field 'expMonth'. Must be number between ${currentYear} and ${maxYear}`);
    const currentMonth = moment(`${expYear}-${expMonth.toString().length > 1 ? expMonth : `0${expMonth}`}-01 00:00`).endOf('month').toDate();
    if (moment().isAfter(currentMonth)) throw new CError(`This card is expired`, 422);

    // Validate cvv
    if (!cvv || !cvv.toString().trim()) throw new CError(`Missing field 'cvv'`);
    if (isNaN(cvv) || cvv.toString().length !== cardType[0].code.size) throw new CError(`Invalid field 'cvv'. Must be number with ${cardType[0].code.size} digits`);

    // Validate metadata
    if (!metadata || metadata.constructor !== Object) throw new CError(`Field 'metadata' must be object`);

    // Crypt important data
    const formatNumber = number.split('').filter(x => x).map((el, index) => cardType[0].gaps.includes(index) ? ` ${el}` : el).join('');
    const cryptData = encryptCardData(formatNumber, cvv.toString().trim());

    const cardData = {
      user,
      number: cryptData.number,
      name: name.toString().split(' ').filter(x => x).join(' '),
      expMonth,
      expYear,
      cvv: cryptData.cvv,
      brand: cardType[0].niceType,
      salt: cryptData.salt,
      last4: formatNumber.slice(-4),
      metadata
    };

    const card = await Card.create(cardData);
    const result = cleanCardData(card.toObject());

    rest.successRes(res, result, 201);
  } catch (error) {
    rest.errorRes(req, res, error);
  }
};


/** @type { import('express').RequestHandler } */
export const list = async (req, res) => {
  try {
    const { page = 1, limit = 10, pagination = true } = req.body;
    const { _id: user } = req.user;

    const checkBody = validateListBody(req.body);
    if (checkBody.length) throw new CError(checkBody.join(' | '));

    const aggregateQuery = Card.aggregate([{ $match: { user, deletedAt: null } }]);
    const result = await Card.aggregatePaginate(aggregateQuery, {
      page,
      limit,
      sort: { createdAt: -1 },
      pagination
    });

    result.docs = result.docs.map(card => cleanCardData(card));

    rest.successRes(res, result);
  } catch (error) {
    rest.errorRes(req, res, error);
  }
};


/** @type { import('express').RequestHandler } */
export const removeCard = async (req, res) => {
  try {
    const { cardId: _id } = req.params;
    const { _id: user } = req.user;
    validateId(_id);

    const result = await Card.findOneAndUpdate({ _id, user, deletedAt: null }, { deletedAt: new Date() }, { new: true, runValidators: true })
      .select('deletedAt last4')
      .lean();

    if (!result) throw new CError(`This card don't exists`, 404);

    rest.successRes(res, result);
  } catch (error) {
    rest.errorRes(req, res, error);
  }
};
