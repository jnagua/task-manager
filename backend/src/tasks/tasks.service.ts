import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { CreateTaskDto, UpdateTaskDto } from './task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async findAll(userId: number, status?: TaskStatus): Promise<Task[]> {
    const query = this.tasksRepository
      .createQueryBuilder('task')
      .where('task.owner_id = :userId', { userId })
      .orderBy('task.created_at', 'DESC');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task #${id} not found`);
    if (task.owner_id !== userId) throw new ForbiddenException();
    return task;
  }

  async create(dto: CreateTaskDto, userId: number): Promise<Task> {
    const task = this.tasksRepository.create({
      ...dto,
      owner_id: userId,
    });
    return this.tasksRepository.save(task);
  }

  async update(id: number, dto: UpdateTaskDto, userId: number): Promise<Task> {
    const task = await this.findOne(id, userId);
    Object.assign(task, dto);
    return this.tasksRepository.save(task);
  }

  async remove(id: number, userId: number): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.tasksRepository.remove(task);
  }
}
