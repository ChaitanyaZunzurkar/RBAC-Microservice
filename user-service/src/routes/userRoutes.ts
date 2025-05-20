import express from 'express';
import { getUser, updateUser, getAllUser } from '../controllers/userController';
import { authMiddleware , userVerify , AdminVerify , AccessOwnResources } from '../middleware/authorizeUser';

const router = express.Router();

router.get('/get-user/:id', authMiddleware , AccessOwnResources ,  getUser);
router.put('/update-user/:id', authMiddleware , AccessOwnResources , updateUser);
router.get('/get-all-user', authMiddleware , AdminVerify  , getAllUser);

export default router;