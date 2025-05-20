import { Request, Response } from 'express';
import * as userRoleService from '../services/assignRoleToUser';
import { publishToQueue } from '../utils/rabbitmq'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const assignRole = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id
    if(!userId) {
      res.json({
            success:false,
            message:"User id not found."
      })
      return 
    }

    const { roleId } = req.body
    if(!roleId) {
      res.json({
            success:false,
            message:"User id not found."
      })
      return 
    }

    const updatedUser = await userRoleService.assignRoleToUser(userId, roleId);

    await publishToQueue('user.updated', {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      updatedAt: new Date().toISOString(),
    });

    res.json({
        success:true,
        message:"User Role updated.",
        user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ 
      success:false,
      error: error
    });
  }
};
