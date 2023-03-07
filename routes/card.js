import express from 'express';
import * as controller from '../controllers/card.js';
import authentication from '../middleware/authentication.js';
const router = express.Router();


router.post('/add', authentication, controller.addCard);
router.post('/list', authentication, controller.list);
router.delete('/:cardId', authentication, controller.removeCard);

export default router;
