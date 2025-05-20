import { getChannel } from '../utils/rabbitmq';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default async function consumePermissionUpdatedEvents() {
  const channel = getChannel();
  const queue = 'permission.updated';

  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg) => {
    if (msg) {
      const { roleId, permissions } = JSON.parse(msg.content.toString());
      console.log('Received permission updated event:', { roleId, permissions });

      try {
        await prisma.rolePermission.deleteMany({
          where: { roleId },
        });

        const createData = permissions.map((perm: string) => ({
          roleId,
          permission: perm,
        }));

        await prisma.rolePermission.createMany({
          data: createData,
        });

        channel.ack(msg);
      } catch (error) {
        console.error('Failed to update permissions:', error);
      }
    }
  });
}