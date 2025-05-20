import express from 'express';
import * as userRoleController from '../controllers/userRoleController';
import { authMiddleware , AdminVerify } from '../middleware/adminOnly';

const router = express.Router();

// Assign role to user
router.post('assign-role-to-user/:userId', authMiddleware , AdminVerify , userRoleController.assignRole);

export default router;
