import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { Task, TaskStatus, TaskPriority } from '../entities';

const mockTask: Task = {
  id: 'task-uuid-1',
  title: 'Test Task',
  description: 'Test description',
  status: TaskStatus.TODO,
  priority: TaskPriority.MEDIUM,
  dueDate: null,
  userId: 'user-uuid-1',
  user: {} as never,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepository = {
  createQueryBuilder: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: TasksRepository, useValue: mockRepository }],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockTask], 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll('user-uuid-1', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a task if it belongs to the user', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne('task-uuid-1', 'user-uuid-1');

      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'user-uuid-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if task belongs to another user', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.findOne('task-uuid-1', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a new task', async () => {
      const dto = { title: 'New Task', priority: TaskPriority.HIGH };
      mockRepository.create.mockReturnValue({ ...mockTask, ...dto });
      mockRepository.save.mockResolvedValue({ ...mockTask, ...dto });

      const result = await service.create('user-uuid-1', dto);

      expect(result.title).toBe('New Task');
      expect(mockRepository.create).toHaveBeenCalledWith({ ...dto, userId: 'user-uuid-1' });
    });
  });

  describe('remove', () => {
    it('should remove a task', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.remove.mockResolvedValue(mockTask);

      await service.remove('task-uuid-1', 'user-uuid-1');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockTask);
    });
  });
});
