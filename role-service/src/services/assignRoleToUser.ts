import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const assignRoleToUser = async (userId: string, roleId: string) => {
  const user = await prisma.user.findUnique({ 
    where: { id: userId } 
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedRoles = user.roleIds.includes(roleId) ? user.roleIds : [...user.roleIds, roleId];

  return prisma.user.update({
    where: { id: userId },
    data: { 
      roleIds: updatedRoles 
    },
  });
};
