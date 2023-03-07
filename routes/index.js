import user from './user.js';
import card from './card.js';
import operation from './operation.js';
import report from './report.js';

/**
 * Main router
 * @param {import('express').Application} app
 */
export default (app) => {
  app.use('/user', user);
  app.use('/card', card);
  app.use('/operation', operation);
  app.use('/report', report);
  app.all('*', (_, res) => res.status(404).send('404 Not Found!').end());
};
