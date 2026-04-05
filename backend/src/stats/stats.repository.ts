import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskPriority } from '../entities';

@Injectable()
export class StatsRepository {
  constructor(
    @InjectRepository(Task)
    private readonly repo: Repository<Task>,
  ) {}

  async getStatsByUser(userId: string) {
    const byStatusRaw = await this.repo
      .createQueryBuilder('t')
      .select('t.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('t.userId = :userId', { userId })
      .groupBy('t.status')
      .getRawMany();

    const byPriorityRaw = await this.repo
      .createQueryBuilder('t')
      .select('t.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .where('t.userId = :userId', { userId })
      .groupBy('t.priority')
      .getRawMany();

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

    for (const row of byStatusRaw) {
      const key = row.status as TaskStatus;
      byStatus[key] = Number(row.count);
    }

    for (const row of byPriorityRaw) {
      const key = row.priority as TaskPriority;
      byPriority[key] = Number(row.count);
    }

    const total = Object.values(byStatus).reduce((s, v) => s + v, 0);

    return { byStatus, byPriority, total };
  }
}
