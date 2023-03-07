import express from 'express';
import chalk from 'chalk';
import settings from './config/settings.js';
import database from './config/database.js';
import expressConfig from './config/express.js';
import routes from './routes/index.js';


const app = express();
expressConfig(app);
database(settings.db);
routes(app);

console.log(chalk.green(`NODE ENVIRONMENT: ${settings.env}`));
app.listen(settings.port, () => console.log(chalk.green(`SERVER IS ARMED AND READY ON PORT: ${settings.port}`)));
