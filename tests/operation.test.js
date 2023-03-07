/* eslint-disable no-undef */
import { customAlphabet } from 'nanoid';
import supertest from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import 'dotenv/config';
import expressConfig from '../config/express.js';
import routes from '../routes/index.js';

const app = express();
expressConfig(app);
routes(app);

const mongoURI = process.env.DEV_DB || '';

const testHeader = { test: true };

const user = {
  email: `${customAlphabet('1234567890abcdef', 10)(10)}@armenia.com`,
  password: 123456,
  firstName: 'Test',
  lastName: 'User'
};

const userSecond = {
  email: `${customAlphabet('1234567890abcdef', 10)(10)}@armenia.com`,
  password: 123456,
  firstName: 'Test',
  lastName: 'User'
};

beforeAll(async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(`${mongoURI}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.models.User.findOneAndDelete({ _id: user._id });
  await mongoose.models.User.findOneAndDelete({ _id: userSecond._id });
  await mongoose.models.Card.deleteMany({ user: user._id });
  await mongoose.models.Operation.deleteMany({ user: user._id });
  await mongoose.connection.close();
});

describe('OPERATION AND REPORTS ENDPOINTS TEST', () => {
  const operation = {
    card: null,
    amount: 100,
    description: 'no description',
    recipient: null
  };

  test('Prepare users and card', async () => {
    const res = await supertest(app).post('/user/register').send(user).set(testHeader);
    expect(res.statusCode).toBe(201);
    user._id = res.body.user._id;
    testHeader.Authorization = `Bearer ${res.body.token}`;

    const resTwo = await supertest(app).post('/user/register').send(userSecond).set(testHeader);
    expect(resTwo.statusCode).toBe(201);
    userSecond._id = resTwo.body.user._id;
    operation.recipient = resTwo.body.user._id;

    const card = {
      number: '4444 333 32222 8874',
      name: 'Zlatna Pamporova',
      expMonth: 3,
      expYear: 2023,
      cvv: 132,
      metadata: {}
    };

    const userCard = await supertest(app).post('/card/add').send(card).set(testHeader);
    expect(userCard.statusCode).toBe(201);
    operation.card = userCard.body.payload._id;
  });

  describe('POST /operation/deposit', () => {
    const address = '/operation/deposit';

    test('Missing card', async () => {
      const res = await supertest(app).post(address).send({ ...operation, card: null }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid card id', async () => {
      const res = await supertest(app).post(address).send({ ...operation, card: 21212 }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Missing user card', async () => {
      const res = await supertest(app).post(address).send({ ...operation, card: '6805aeb91fcf6b5545d28edd' }).set(testHeader);
      expect(res.statusCode).toBe(404);
    });

    test('Missing amount', async () => {
      const res = await supertest(app).post(address).send({ ...operation, amount: 0 }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid amount', async () => {
      const res = await supertest(app).post(address).send({ ...operation, amount: 'none' }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Missing description', async () => {
      const res = await supertest(app).post(address).send({ ...operation, description: null }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Success request', async () => {
      const res = await supertest(app).post(address).send(operation).set(testHeader);
      expect(res.statusCode).toBe(200);
      expect(res.body.payload).toHaveProperty('updateBalance');
      expect(res.body.payload.updateBalance).toBe(100);
    });
  });

  describe('POST /operation/withdraw', () => {
    const address = '/operation/withdraw';

    test('Missing card', async () => {
      const res = await supertest(app).post(address).send({ ...operation, card: null }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid card id', async () => {
      const res = await supertest(app).post(address).send({ ...operation, card: 21212 }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Missing user card', async () => {
      const res = await supertest(app).post(address).send({ ...operation, card: '6805aeb91fcf6b5545d28edd' }).set(testHeader);
      expect(res.statusCode).toBe(404);
    });

    test('Missing amount', async () => {
      const res = await supertest(app).post(address).send({ ...operation, amount: 0 }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid amount', async () => {
      const res = await supertest(app).post(address).send({ ...operation, amount: 'none' }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Missing description', async () => {
      const res = await supertest(app).post(address).send({ ...operation, description: null }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Insufficient availability', async () => {
      const res = await supertest(app).post(address).send({ ...operation, amount: 110 }).set(testHeader);
      expect(res.statusCode).toBe(409);
    });

    test('Success request', async () => {
      const res = await supertest(app).post(address).send({ ...operation, amount: 10 }).set(testHeader);
      expect(res.statusCode).toBe(200);
      expect(res.body.payload).toHaveProperty('updateBalance');
      expect(res.body.payload.updateBalance).toBe(90);
    });
  });

  describe('POST /operation/transfer', () => {
    const address = '/operation/transfer';

    test('Missing recipient', async () => {
      const res = await supertest(app).post(address).send({ ...operation, recipient: null }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid recipient id', async () => {
      const res = await supertest(app).post(address).send({ ...operation, recipient: 21212 }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test(`Can't find recipient`, async () => {
      const res = await supertest(app).post(address).send({ ...operation, recipient: '6805aeb91fcf6b5545d28edd' }).set(testHeader);
      expect(res.statusCode).toBe(404);
    });

    test('Missing amount', async () => {
      const res = await supertest(app).post(address).send({ ...operation, amount: 0 }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid amount', async () => {
      const res = await supertest(app).post(address).send({ ...operation, amount: 'none' }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Missing description', async () => {
      const res = await supertest(app).post(address).send({ ...operation, description: null }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Insufficient availability', async () => {
      const res = await supertest(app).post(address).send({ ...operation, amount: 100 }).set(testHeader);
      expect(res.statusCode).toBe(409);
    });

    test('Success request', async () => {
      const res = await supertest(app).post(address).send({ ...operation, amount: 10 }).set(testHeader);
      expect(res.statusCode).toBe(200);
      expect(res.body.payload).toHaveProperty('updateBalance');
      expect(res.body.payload.updateBalance).toBe(80);
    });

    test('Update recipient balance', async () => {
      const res = await mongoose.models.User.findOne({ _id: userSecond._id }).lean();
      expect(res.balance).toBe(10);
    });
  });

  describe('POST /report/transactions', () => {
    const address = '/report/transactions';
    const body = {
      page: 1,
      limit: 10,
      pagination: true
    };

    test('Use default parameters', async () => {
      const res = await supertest(app).post(address).send().set(testHeader);
      expect(res.statusCode).toBe(200);
    });

    test('Invalid page', async () => {
      const res = await supertest(app).post(address).send({ ...body, page: 0 }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid limit', async () => {
      const res = await supertest(app).post(address).send({ ...body, limit: -2 }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid pagination', async () => {
      const res = await supertest(app).post(address).send({ ...body, pagination: null }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid sort', async () => {
      const res = await supertest(app).post(address).send({ ...body, sort: { createdAt: 2 } }).set(testHeader);
      const resTwo = await supertest(app).post(address).send({ ...body, sort: 1 }).set(testHeader);
      expect(res.statusCode).toBe(422);
      expect(resTwo.statusCode).toBe(422);
    });

    test('Invalid dates', async () => {
      const startDate = await supertest(app).post(address).send({ ...body, startDate: '3212-14-21' }).set(testHeader);
      const endDate = await supertest(app).post(address).send({ ...body, endDate: '3212-14-21' }).set(testHeader);
      const wrongPeriod = await supertest(app).post(address).send({ ...body, startDate: '2022-03-01', endDate: '2022-02-01' }).set(testHeader);
      expect(startDate.statusCode).toBe(422);
      expect(endDate.statusCode).toBe(422);
      expect(wrongPeriod.statusCode).toBe(422);
    });

    test('Invalid amount diapason', async () => {
      const res = await supertest(app).post(address).send({ ...body, amountMin: 100, amountMax: 90 }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Success result without filters', async () => {
      const res = await supertest(app).post(address).send(body).set(testHeader);
      expect(res.statusCode).toBe(200);
      expect(res.body.payload).toHaveProperty('docs');
      expect(res.body.payload).toHaveProperty('totalDocs');
      expect(res.body.payload).toHaveProperty('limit');
      expect(res.body.payload).toHaveProperty('page');
      expect(res.body.payload).toHaveProperty('totalPages');
      expect(res.body.payload.docs).toEqual(expect.any(Array));
      expect(res.body.payload.totalDocs).toBe(3);
    });

    test('Success result with type filter', async () => {
      const res = await supertest(app).post(address).send({ ...body, type: ['deposit', 'transfer'] }).set(testHeader);
      expect(res.statusCode).toBe(200);
      expect(res.body.payload).toHaveProperty('docs');
      expect(res.body.payload).toHaveProperty('totalDocs');
      expect(res.body.payload).toHaveProperty('limit');
      expect(res.body.payload).toHaveProperty('page');
      expect(res.body.payload).toHaveProperty('totalPages');
      expect(res.body.payload.docs).toEqual(expect.any(Array));
      expect(res.body.payload.totalDocs).toBe(2);
    });

    test('Success result with direction filter', async () => {
      const res = await supertest(app).post(address).send({ ...body, direction: ['income'] }).set(testHeader);
      expect(res.statusCode).toBe(200);
      expect(res.body.payload).toHaveProperty('docs');
      expect(res.body.payload).toHaveProperty('totalDocs');
      expect(res.body.payload).toHaveProperty('limit');
      expect(res.body.payload).toHaveProperty('page');
      expect(res.body.payload).toHaveProperty('totalPages');
      expect(res.body.payload.docs).toEqual(expect.any(Array));
      expect(res.body.payload.totalDocs).toBe(1);
    });
  });

  describe('POST /report/balance', () => {
    const address = '/report/balance';

    test('Invalid dates', async () => {
      const startDate = await supertest(app).post(address).send({ startDate: '3212-14-21' }).set(testHeader);
      const endDate = await supertest(app).post(address).send({ endDate: '3212-14-21' }).set(testHeader);
      const wrongPeriod = await supertest(app).post(address).send({ startDate: '2022-03-01', endDate: '2022-02-01' }).set(testHeader);
      expect(startDate.statusCode).toBe(422);
      expect(endDate.statusCode).toBe(422);
      expect(wrongPeriod.statusCode).toBe(422);
    });

    test('Success result', async () => {
      const res = await supertest(app).post(address).set(testHeader);
      expect(res.statusCode).toBe(200);
      expect(res.body.payload).toHaveProperty('startBalance');
      expect(res.body.payload).toHaveProperty('endBalance');
      expect(res.body.payload.startBalance).toBe(0);
      expect(res.body.payload.endBalance).toBe(80);
    });
  });
});
