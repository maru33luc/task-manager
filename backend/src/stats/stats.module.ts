import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../entities';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { StatsRepository } from './stats.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  providers: [StatsService, StatsRepository],
  controllers: [StatsController],
})
export class StatsModule {}
