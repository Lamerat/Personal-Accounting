import express from 'express';
import * as controller from '../controllers/operation.js';
import authentication from '../middleware/authentication.js';
const router = express.Router();


router.post('/deposit', authentication, controller.deposit);
router.post('/withdraw', authentication, controller.withdraw);
router.post('/transfer', authentication, controller.transfer);

export default router;
