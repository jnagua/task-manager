import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Task } from '../tasks/task.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: process.env.DB_PATH || 'database.sqlite',
  entities: [User, Task],
  synchronize: true, // En producción usa migrations
  logging: false,
};
