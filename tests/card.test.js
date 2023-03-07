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

beforeAll(async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(`${mongoURI}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.models.User.findOneAndDelete({ _id: user._id });
  await mongoose.models.Card.deleteMany({ user: user._id });
  await mongoose.connection.close();
});

describe('CARD ENDPOINTS TEST', () => {
  test('Log in system', async () => {
    const res = await supertest(app).post('/user/register').send(user).set(testHeader);
    expect(res.statusCode).toBe(201);
    user._id = res.body.user._id;
    testHeader.Authorization = `Bearer ${res.body.token}`;
  });

  const card = {
    number: '4444 333 32222 8874',
    name: 'Zlatna Pamporova',
    expMonth: 3,
    expYear: 2023,
    cvv: 132,
    metadata: {}
  };

  describe('POST /card/add', () => {
    const address = '/card/add';

    test('Invalid card number', async () => {
      const res = await supertest(app).post(address).send({ ...card, number: 323 }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid name', async () => {
      const res = await supertest(app).post(address).send({ ...card, name: 'dasd sdad d' }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid expire month', async () => {
      const res = await supertest(app).post(address).send({ ...card, expMonth: 14 }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid expire year', async () => {
      const res = await supertest(app).post(address).send({ ...card, expYear: 2000 }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid security code', async () => {
      const res = await supertest(app).post(address).send({ ...card, cvv: 1000 }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid metadata', async () => {
      const res = await supertest(app).post(address).send({ ...card, metadata: true }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Success add card', async () => {
      const res = await supertest(app).post(address).send(card).set(testHeader);
      expect(res.statusCode).toBe(201);
      user.card = res.body.payload._id;
    });
  });

  describe('POST /card/list', () => {
    const address = '/card/list';
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
      const res = await supertest(app).post(address).send({ ...body, pagination: 21 }).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Success result', async () => {
      const res = await supertest(app).post(address).send(body).set(testHeader);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /card/:cardId', () => {
    test('Invalid _id param', async () => {
      const res = await supertest(app).delete(`/card/3232`).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test(`Can't find card`, async () => {
      const res = await supertest(app).delete(`/card/680599a7d7f1c13a48e71419`).set(testHeader);
      expect(res.statusCode).toBe(404);
    });

    test(`Success delete`, async () => {
      const res = await supertest(app).delete(`/card/${user.card}`).set(testHeader);
      expect(res.statusCode).toBe(200);
      expect(res.body.payload).toHaveProperty('deletedAt');
      expect(res.body.payload).toHaveProperty('last4');
    });
  });
});
