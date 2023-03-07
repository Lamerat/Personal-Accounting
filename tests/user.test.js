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
  email: 'pop@armenia.com',
  password: 123456,
  firstName: 'Златна',
  lastName: 'Пампорова'
};

beforeAll(async () => {
  mongoose.set('strictQuery', true);
  await mongoose.connect(`${mongoURI}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.models.User.findOneAndDelete({ _id: user._id });
  await mongoose.connection.close();
});

describe('USER ENDPOINTS TEST', () => {
  describe('POST /user/check', () => {
    const address = '/user/check';

    test('Missing email', async () => {
      const res = await supertest(app).post(address).send({}).set(testHeader);
      expect(res.body.message).toBe(`Missing field 'email'`);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid email', async () => {
      const res = await supertest(app).post(address).send({ email: 'lamer@dir.bg1' }).set(testHeader);
      expect(res.body.message).toBe(`Invalid field 'email'. Must be valid email address!`);
      expect(res.statusCode).toBe(422);
    });

    test('Email exists', async () => {
      const res = await supertest(app).post(address).send({ email: 'pop@armenia.com' }).set(testHeader);
      expect(res.statusCode).toBe(200);
      expect(res.body.payload.emailExists).toBe(true);
    });

    test(`Email don't exists`, async () => {
      const randomEmail = customAlphabet('1234567890abcdef', 10)(10);
      const res = await supertest(app).post(address).send({ email: `${randomEmail}@armenia.com` }).set(testHeader);
      expect(res.statusCode).toBe(200);
      expect(res.body.payload.emailExists).toBe(false);
    });
  });

  describe('POST /user/register', () => {
    const address = '/user/register';

    test('Missing email', async () => {
      const res = await supertest(app).post(address).send({ ...user, email: null }).set(testHeader);
      expect(res.body.message).toBe(`Missing field 'email'`);
      expect(res.statusCode).toBe(422);
    });

    test('Missing password', async () => {
      const res = await supertest(app).post(address).send({ ...user, password: '' }).set(testHeader);
      expect(res.body.message).toBe(`Missing field 'password'`);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid email', async () => {
      const res = await supertest(app).post(address).send({ ...user, email: 'lamer@dir.bg1' }).set(testHeader);
      expect(res.body.message).toBe(`Invalid field 'email'. Must be valid email address!`);
      expect(res.statusCode).toBe(422);
    });

    test('Missing firstName', async () => {
      const res = await supertest(app).post(address).send({ ...user, firstName: '' }).set(testHeader);
      expect(res.body.message).toBe(`Missing field 'firstName'`);
      expect(res.statusCode).toBe(422);
    });

    test('Missing lastName', async () => {
      const res = await supertest(app).post(address).send({ ...user, lastName: '' }).set(testHeader);
      expect(res.body.message).toBe(`Missing field 'lastName'`);
      expect(res.statusCode).toBe(422);
    });

    test('Too short password', async () => {
      const res = await supertest(app).post(address).send({ ...user, password: 12345 }).set(testHeader);
      expect(res.body.message).toBe(`Password must be min. 6 symbols`);
      expect(res.statusCode).toBe(422);
    });

    test('Email is already taken', async () => {
      const res = await supertest(app).post(address).send(user).set(testHeader);
      expect(res.body.message).toBe(`User with email ${user.email} already exists!`);
      expect(res.statusCode).toBe(409);
    });

    test('Successful register', async () => {
      user.email = `${customAlphabet('1234567890abcdef', 10)(10)}@armenia.com`;
      const res = await supertest(app).post(address).send(user).set(testHeader);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('POST /user/login', () => {
    const address = '/user/login';

    test('Missing both credentials', async () => {
      const res = await supertest(app).post(address).send({}).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test('Missing email', async () => {
      const res = await supertest(app).post(address).send({ password: true }).set(testHeader);
      expect(res.body.message).toBe(`Missing field 'email'`);
      expect(res.statusCode).toBe(422);
    });

    test('Missing password', async () => {
      const res = await supertest(app).post(address).send({ email: 'lamer@dir.bg' }).set(testHeader);
      expect(res.body.message).toBe(`Missing field 'password'`);
      expect(res.statusCode).toBe(422);
    });

    test('Invalid email', async () => {
      const res = await supertest(app).post(address).send({ email: 'lamer@dir.bg1', password: 123 }).set(testHeader);
      expect(res.body.message).toBe(`Invalid field 'email'. Must be valid email address!`);
      expect(res.statusCode).toBe(422);
    });

    test(`User don't exists`, async () => {
      const res = await supertest(app).post(address).send({ email: 'nobody@armenia.com', password: 123456 }).set(testHeader);
      expect(res.body.message).toBe(`User with this email don't exists`);
      expect(res.statusCode).toBe(404);
    });

    test(`Successful login`, async () => {
      const res = await supertest(app).post(address).send(user).set(testHeader);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      user._id = res.body.user._id;
      testHeader.Authorization = `Bearer ${res.body.token}`;
    });
  });

  describe('POST /user/list', () => {
    const address = '/user/list';
    const body = {
      page: 1,
      limit: 10,
      pagination: true,
      sort: { lastName: 'desc' },
      email: '',
      name: ''
    };

    test('Missing authorization', async () => {
      const res = await supertest(app).post(address).send().set({ ...testHeader, Authorization: 1 });
      expect(res.statusCode).toBe(401);
    });

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

  describe('GET /user/:_id', () => {
    test('Invalid _id param', async () => {
      const res = await supertest(app).get(`/user/3232`).set(testHeader);
      expect(res.statusCode).toBe(422);
    });

    test(`Can't find user`, async () => {
      const res = await supertest(app).get(`/user/680599a7d7f1c13a48e71419`).set(testHeader);
      expect(res.statusCode).toBe(404);
    });

    test(`Success request`, async () => {
      const res = await supertest(app).get(`/user/${user._id}`).set(testHeader);
      expect(res.statusCode).toBe(200);
      expect(res.body.payload).toHaveProperty('balance');
    });
  });

  describe('PUT /user/logout', () => {
    test('Success logout', async () => {
      const res = await supertest(app).put(`/user/logout`).set(testHeader);
      expect(res.statusCode).toBe(200);
    });
  });
});
