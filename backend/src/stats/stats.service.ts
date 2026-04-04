import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskPriority } from '../entities';

export interface StatsResponse {
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  total: number;
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async getStats(userId: string): Promise<StatsResponse> {
    const tasks = await this.tasksRepository.find({ where: { userId } });

    const byStatus: Record<TaskStatus, number> = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.DONE]: 0,
    };

    const byPriority: Record<TaskPriority, number> = {
      [TaskPriority.LOW]: 0,
      [TaskPriority.MEDIUM]: 0,
      [TaskPriority.HIGH]: 0,
    };

    for (const task of tasks) {
      byStatus[task.status]++;
      byPriority[task.priority]++;
    }

    return { byStatus, byPriority, total: tasks.length };
  }
}
