import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createPermission = async (name: string, description?: string) => {
  return prisma.permission.create({ 
    data: { 
      name, 
      description 
    } 
  });
};

export const getAllPermissions = async () => {
  return prisma.permission.findMany();
};

export const updatePermission = async (id: string, name: string, description?: string) => {
  return prisma.permission.update({
    where: { id },
    data: { 
      name, 
      description 
    },
  });
};

export const deletePermission = async (id: string) => {
  return prisma.permission.delete({ 
    where: { id } 
  });
};
