import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TasksService } from './tasks.service';
import { Task, TaskStatus, TaskPriority, PaginatedTasks } from '../../core/models';

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  description: null,
  status: 'todo',
  priority: 'medium',
  dueDate: null,
  userId: 'user-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('TasksService', () => {
  let service: TasksService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TasksService],
    });
    service = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all tasks', () => {
    const mockResponse: PaginatedTasks = {
      data: [mockTask],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    service.getAll().subscribe((res) => {
      expect(res.data.length).toBe(1);
      expect(res.total).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:3000/tasks');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get tasks with filters', () => {
    const mockResponse: PaginatedTasks = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };

    service.getAll({ status: 'todo', priority: 'high', page: 2 }).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:3000/tasks' &&
        r.params.get('status') === 'todo' &&
        r.params.get('priority') === 'high' &&
        r.params.get('page') === '2',
    );
    req.flush(mockResponse);
  });

  it('should create a task', () => {
    service.create({ title: 'New Task' }).subscribe((task) => {
      expect(task.title).toBe('New Task');
    });

    const req = httpMock.expectOne('http://localhost:3000/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'New Task' });
    req.flush(mockTask);
  });

  it('should update a task', () => {
    const updated = { ...mockTask, title: 'Updated' };
    service.update('task-1', { title: 'Updated' }).subscribe((task) => {
      expect(task.title).toBe('Updated');
    });

    const req = httpMock.expectOne('http://localhost:3000/tasks/task-1');
    expect(req.request.method).toBe('PATCH');
    req.flush(updated);
  });

  it('should delete a task', () => {
    service.delete('task-1').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/tasks/task-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
