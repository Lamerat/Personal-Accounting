import express from 'express';
import * as controller from '../controllers/user.js';
import authentication from '../middleware/authentication.js';
const router = express.Router();


router.post('/register', controller.register);
router.post('/check', controller.check);
router.post('/login', controller.login);
router.post('/list', authentication, controller.list);
router.get('/:_id', authentication, controller.single);
router.put('/logout', authentication, controller.logout);

export default router;
