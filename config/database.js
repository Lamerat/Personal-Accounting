import chalk from 'chalk';
import mongoose from 'mongoose';

export default (database) => {
  mongoose.set('strictQuery', true);
  mongoose.connect(`${database}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection;

  db.once('open', err => {
    if (err) throw err;
    console.log(chalk.green('DATABASE STATUS: READY'));
  });

  db.on('error', err => console.log(chalk.red(`DATABASE ERROR -> ${err}`)));
};
