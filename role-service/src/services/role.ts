import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

export const createRole = async (name: string) => {
    return prisma.role.create({ 
        data: { name } 
    });
};

export const getAllRoles = async () => {
  return prisma.role.findMany();
};

export const updateRole = async (id: string, name: string) => {
  return prisma.role.update({
    where: { id },
    data: { name },
  });
};

export const deleteRole = async (id: string) => {
  return prisma.role.delete({ 
    where: { id } 
  });
};

export const assignPermissionToRole = async (roleId: string, permissionId: string) => {
  const role = await prisma.role.findUnique({ 
    where: { id: roleId } 
  });

  if (!role) {
    throw new Error("Role not found");
  }

  const updatedPermissions = role.permissionIds.includes(permissionId) ? role.permissionIds : [...role.permissionIds, permissionId];

  return prisma.role.update({
    where: { id: roleId },
    data: { 
      permissionIds: updatedPermissions 
    },
  });
};
