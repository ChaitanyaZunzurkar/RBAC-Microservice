import { Request, Response } from 'express';
import * as roleService from '../services/role';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const createRole = async (req: Request, res: Response):Promise<void> => {
  try {
    const { name } = req.body
    if(!name) {
        res.json({
            success:false,
            message:"Provide all details"
        })
        return 
    }

    const existingRole = await prisma.permission.findUnique({
      where: { name : name }
    })
    
    if(existingRole) {
      res.json({
            success:false,
            message:"Role name alredy exists."
        })
      return 
    }

    const role = await roleService.createRole(name);
    res.status(201).json({
        success:true,
        message: "Role created.",
        role
    });

  } catch (error) {
      res.status(500).json({ 
          success:false,
          error: error 
      });
    }
};

export const getRoles = async (req: Request, res: Response):Promise<void> => {
  try {
      const roles = await roleService.getAllRoles();
      res.json({
        success:true,
        message:"fetch all roles.",
        roles
      });

  } 
  catch (error) {
      res.status(500).json({
          success:false,
          message:"Fail to get roles."
      })
  }
};

export const updateRole = async (req: Request, res: Response):Promise<void> => {
  try {
    const id = req.params.id
    if(!id) {
      res.json({
          success:false,
          message:"User id not found."
      })
      return 
    }

    const { name } = req.body
    if(!name) {
        res.json({
            success:false,
            message:"Provide all details"
        })
        return 
    }

    const Updatedrole = await roleService.updateRole(id, name);
    res.status(201).json({
        success:true,
        message: "Role Updated.",
        role: Updatedrole
    });

  } catch (error) {
      res.status(500).json({ 
          error: error 
      });
    }
};

export const deleteRole = async (req: Request, res: Response):Promise<void> => {
  try {
    const id = req.params.id
    if(!id) {
      res.json({
            success:false,
            message:"User id not found."
      })
      return 
    }
    await roleService.deleteRole(id);
    res.json({
        success:true, 
        message: 'Role deleted' 
    });

  } catch (err) {
      res.status(500).json({
        success:false, 
        error: err 
      });
    }
};

export const assignPermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const roleId = req.params.id;
    const { permissionId } = req.body;

    if (!roleId) {
      res.status(400).json({
        success: false,
        message: "Role ID not provided in params.",
      });
      return;
    }

    if (!permissionId) {
      res.status(400).json({
        success: false,
        message: "Permission ID not provided in request body.",
      });
      return;
    }

    const updatedRole = await roleService.assignPermissionToRole(roleId, permissionId);

    res.status(200).json({
      success: true,
      message: "Permission assigned to role successfully.",
      role: updatedRole,
    });
  } catch (err: any) {
    console.error("Error assigning permission:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: err.message || err,
    });
  }
};
