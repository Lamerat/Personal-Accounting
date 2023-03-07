import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import settings from './settings.js';
import chalk from 'chalk';


const getDurationInMilliseconds = (start) => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);

  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

const methods = {
  GET: chalk.blue('GET'),
  POST: chalk.green('POST'),
  PUT: chalk.yellow('PUT'),
  DELETE: chalk.red('DELETE')
};


/**
 * Main router
 * @param {import('express').Application} app
 */
const expressConfig = (app) => {
  app.use('/public', express.static('public'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors());

  app.use((req, res, next) => {
    const start = process.hrtime();

    if (!req.headers.test) {
      res.on('finish', () => {
        const durationInMilliseconds = getDurationInMilliseconds(start);

        durationInMilliseconds < settings.tooLongRequest * 1000
          ? console.log(`${methods[req.method]} ${req.originalUrl} - Request time: ${durationInMilliseconds} ms`)
          : console.log(chalk.magenta(`${methods[req.method]} ${req.originalUrl} - Request time: ${durationInMilliseconds} ms`));
      });
    }

    next();
  });
};

export default expressConfig;
