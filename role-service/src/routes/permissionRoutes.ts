import express from 'express';
import * as permissionController from '../controllers/permissionController';
import { authMiddleware , AdminVerify } from '../middleware/adminOnly';

const router = express.Router();

router.post('/create-permission', authMiddleware , AdminVerify , permissionController.createPermission);
router.get('/get-permissions', authMiddleware , AdminVerify , permissionController.getPermissions);
router.put('/update-permissions/:id', authMiddleware , AdminVerify , permissionController.updatePermission);
router.delete('/delete-permissions/:id', authMiddleware , AdminVerify , permissionController.deletePermission);

export default router;
