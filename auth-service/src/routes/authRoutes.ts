import * as express from 'express';
import { signin, signup , refreshAccessToken , logout , otpGenerator } from '../controllers/AuthControllers';

const router = express.Router();

router.post('/signup' , signup);
router.post('/signin', signin);
router.post('/refresh-token', refreshAccessToken)
router.post('/otp-generator', otpGenerator);
router.post('/logout/:id', logout)

export default router;