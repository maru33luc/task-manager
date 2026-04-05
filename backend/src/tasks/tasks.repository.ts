import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Task } from '../entities';
import { TaskFilterDto } from './dto';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>,
  ) {}

  async findByUserPaginated(userId: string, filter: TaskFilterDto) {
    const { status, priority, page = 1, limit = 10 } = filter;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('task').where('task.userId = :userId', { userId });

    if (status) qb.andWhere('task.status = :status', { status });
    if (priority) qb.andWhere('task.priority = :priority', { priority });

    qb.orderBy('task.createdAt', 'DESC').skip(skip).take(limit);

    return qb.getManyAndCount();
  }

  // Proxy methods expected by service
  createQueryBuilder(alias: string) {
    return this.repo.createQueryBuilder(alias);
  }

  async findOne(options: FindOneOptions<Task>) {
    return this.repo.findOne(options);
  }

  create(data: Partial<Task>) {
    return this.repo.create(data);
  }

  save(task: Task) {
    return this.repo.save(task);
  }

  remove(task: Task) {
    return this.repo.remove(task);
  }
}
