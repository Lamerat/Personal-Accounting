import validator from 'validator';


/**
 * Remove important fields from Card object
 * @param { object } card Card object from database
 * @returns { object }
 */
export const cleanCardData = (card) => {
  const removeFields = ['number', 'cvv', 'salt', '__v', 'deletedAt', 'updatedAt'];
  removeFields.forEach(field => delete card[field]);
  return card;
};


/**
 * Validate body for pagination endpoint
 * @param {{ page: number, limit: number, sort: object, pagination: boolean }} body
 * @returns { [] }
 */
export const validateListBody = (body) => {
  const errors = [];

  if (body.page !== undefined && (isNaN(body.page) || !Number.isInteger(parseInt(body.page)) || body.page < 1)) {
    errors.push(`Field 'page' must be number bigger from zero`);
  }

  if (body.limit !== undefined && (isNaN(body.limit) || !Number.isInteger(parseInt(body.limit)) || body.limit < 1)) {
    errors.push(`Field 'limit' must be number bigger from zero`);
  }

  if (typeof body.pagination !== 'undefined' && typeof body.pagination !== 'boolean') {
    errors.push(`Field 'pagination' must be boolean`);
  }

  if (body.sort !== undefined) {
    if (body.sort?.constructor !== Object || !Object.keys(body.sort).length) errors.push(`Field 'sort' must be object and must have at least one key`);
    const validSortValues = [1, -1, 'asc', 'desc'];
    if (Object.values(body.sort).some(x => !validSortValues.includes(x))) errors.push(`Object 'sort' include invalid value. Valid values is ${validSortValues.join(' | ')}`);
  }


  return errors;
};


export const validateId = (id) => {
  if (!validator.isMongoId(id)) throw new Error(`${id} is not valid ID`);
  return true;
};
