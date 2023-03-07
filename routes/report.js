import express from 'express';
import * as controller from '../controllers/report.js';
import authentication from '../middleware/authentication.js';
const router = express.Router();


router.post('/transactions', authentication, controller.transactions);
router.post('/balance', authentication, controller.balance);

export default router;
