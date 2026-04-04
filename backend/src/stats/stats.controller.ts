import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth';

interface RequestWithUser extends Request {
  user: { id: string; email: string };
}

@ApiTags('stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get task statistics for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Task statistics' })
  async getStats(@Request() req: RequestWithUser) {
    return this.statsService.getStats(req.user.id);
  }
}
