import { Request, Response } from 'express';
import * as permissionService from '../services/permission';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { publishToQueue } from '../utils/rabbitmq'

export const createPermission = async (req: Request, res: Response):Promise<void> => {
  try {
    const { name , description } = req.body

    if(!name || !description) {
        res.json({
            success:false,
            message:"Provide all details"
        })
        return 
    }

    const existingPermission = await prisma.permission.findUnique({
      where: { name : name }
    })

    if(existingPermission) {
      res.json({
            success:false,
            message:"Permission name alredy exists."
        })
      return 
    }

    const permission = await permissionService.createPermission(name, description);
    res.status(201).json({
        success:true,
        message: "Permission Created.",
        permission
    });

  } catch (error) {
    res.status(500).json({ 
        error: error 
    });
  }
};

export const getPermissions = async (req: Request, res: Response):Promise<void> => {
  try {
      const permissions = await permissionService.getAllPermissions();
      res.json({
          success:true,
          message: "Permission Created.",
          permissions
      });
  } 
  catch (error) {
      res.status(500).json({
          success:false,
          message:"Fail to get permissions."
      })
  }
};

export const updatePermission = async (req: Request, res: Response):Promise<void> => {
  try {
    const PermissionId = req.params.id
    if(!PermissionId) {
      res.json({
            success:false,
            message:"permission id not found."
      })
      return 
    }

    const { name , description } = req.body
    if(!name || !description) {
        res.json({
            success:false,
            message:"Provide all details"
        })
        return 
    }

    const Updatedpermission = await permissionService.updatePermission(PermissionId, name, description);

    await publishToQueue('permission.updated', {
        id: Updatedpermission.id,
        name: name,
        description: description,
        updatedAt: new Date().toISOString(),
    });

    res.status(201).json({
        success:true,
        message: "Permission Updated.",
        permission: Updatedpermission
    });

  } catch (error) {
      res.status(500).json({ 
        success:false,
        message: error 
      });
    }
};

export const deletePermission = async (req: Request, res: Response):Promise<void> => {
  try {
    const id = req.params.id
    if(!id) {
      res.json({
            success:false,
            message:"User id not found."
      })
      return 
    }

    await permissionService.deletePermission(id);

    await publishToQueue('permission.updated', {
        message:"Permission deleted",
        updatedAt: new Date().toISOString(),
    });

    res.json({ 
        success: true,
        message: 'Permission deleted'
    });

  } catch (error) {
      res.status(500).json({ 
        success:false,
        error: error 
      });
    }
};
