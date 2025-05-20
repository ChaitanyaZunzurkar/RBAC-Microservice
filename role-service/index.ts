import express from 'express';
import { connectRabbitMQ } from './src/utils/rabbitmq';
import PermissionConsumer from './src/utils/PermissionConsumer';
import roleConsumer from './src/utils/RoleConsumer';
import * as dotenv from 'dotenv';
import roleRoutes from './src/routes/roleRoutes';
import permissionRoutes from './src/routes/permissionRoutes';
import userRoleRoutes from './src/routes/userRoleRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectRabbitMQ();    
    await PermissionConsumer(); 
    await roleConsumer();       

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/api/v1/roles', roleRoutes);
    app.use('/api/v1/permissions', permissionRoutes);
    app.use('/api/v1/users', userRoleRoutes);

    app.listen(PORT, () => {
      console.log(`role-server is running at port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

startServer();
