import { Injectable } from '@nestjs/common';
import { TaskStatus, TaskPriority } from '../entities';
import { StatsRepository } from './stats.repository';

export interface StatsResponse {
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  total: number;
}

@Injectable()
export class StatsService {
  constructor(private readonly statsRepository: StatsRepository) {}

  async getStats(userId: string): Promise<StatsResponse> {
    return this.statsRepository.getStatsByUser(userId);
  }
}
