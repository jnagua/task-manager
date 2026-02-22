import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './users/user.entity';
import { Task } from './tasks/task.entity';
import { TaskStatus, TaskPriority } from './tasks/task.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DB_PATH || 'database.sqlite',
  entities: [User, Task],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const taskRepo = AppDataSource.getRepository(Task);

  const users = [
    { email: 'admin@taskmanager.com', password: 'Admin1234!', name: 'Admin User' },
    { email: 'juan@taskmanager.com', password: 'Juan1234!', name: 'Jaun Perez' },
    { email: 'Maria@taskmanager.com', password: 'Maria1234!', name: 'Maria Martinez' },
  ];

  const createdUsers: User[] = [];
  for (const u of users) {
    const exists = await userRepo.findOne({ where: { email: u.email } });
    if (!exists) {
      const hashed = await bcrypt.hash(u.password, 10);
      const user = userRepo.create({ ...u, password: hashed });
      createdUsers.push(await userRepo.save(user));
      console.log(`✅ Created user: ${u.email} / ${u.password}`);
    } else {
      createdUsers.push(exists);
      console.log(`⚠️  User already exists: ${u.email}`);
    }
  }

  // Seed sample tasks for first user
  const adminUser = createdUsers[0];
  const sampleTasks = [
    {
      title: 'Iniciar CI/CD pipeline',
      description: 'Configurar GitHub para despliegue automatico',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      due_date: '2025-03-01',
    },
    {
      title: 'Realizar Unit Test',
      description: 'para probar la actulizacion y editar tareas',
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      due_date: '2025-03-15',
    },
    {
      title: 'Actulizar Documentacion',
      description: 'Mejorar el README con el paso a paso',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.LOW,
    },
  ];

  for (const t of sampleTasks) {
    const task = taskRepo.create({ ...t, owner_id: adminUser.id });
    await taskRepo.save(task);
  }
  console.log('✅ Sample tasks created for admin user');

  await AppDataSource.destroy();
  console.log('\n🎉 Seed completed!');
}

seed().catch(console.error);
