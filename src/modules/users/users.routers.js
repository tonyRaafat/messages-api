import express from 'express';
import { login, register, requestOtp, verifyOtp } from './user.controllers.js';

const router = express.Router();

router.post('/register', register);

router.post('/verifyOtp',verifyOtp)

router.post('/requestOtp',requestOtp)

router.post('/login', login);

export default router;
