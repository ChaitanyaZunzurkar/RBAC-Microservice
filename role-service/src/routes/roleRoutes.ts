import express from 'express';
import * as roleController from '../controllers/roleController';
import { authMiddleware , AdminVerify } from '../middleware/adminOnly';

const router = express.Router();

router.post('/create-role', authMiddleware , AdminVerify , roleController.createRole);
router.get('/get-roles', authMiddleware , AdminVerify , roleController.getRoles);
router.put('/update-roles/:id', authMiddleware , AdminVerify , roleController.updateRole);
router.delete('/delete/:id', authMiddleware , AdminVerify , roleController.deleteRole);
router.post('/assign-permissions/:roleId', authMiddleware , AdminVerify , roleController.assignPermission);

export default router;
