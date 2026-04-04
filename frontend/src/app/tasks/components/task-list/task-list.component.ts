import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../../services/tasks.service';
import { Task, TaskFilter, TaskStatus, TaskPriority, PaginatedTasks } from '../../../core/models';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, TaskFormComponent],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  private readonly tasksService = inject(TasksService);

  readonly tasks = signal<Task[]>([]);
  readonly pagination = signal<Omit<PaginatedTasks, 'data'>>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly editingTask = signal<Task | null>(null);

  readonly filter = signal<TaskFilter>({ page: 1, limit: 10 });
  readonly statusFilter = signal<TaskStatus | ''>('');
  readonly priorityFilter = signal<TaskPriority | ''>('');

  readonly statusOptions: { label: string; value: TaskStatus | '' }[] = [
    { label: 'All statuses', value: '' },
    { label: 'Todo', value: 'todo' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Done', value: 'done' },
  ];

  readonly priorityOptions: { label: string; value: TaskPriority | '' }[] = [
    { label: 'All priorities', value: '' },
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ];

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const f: TaskFilter = {
      page: this.filter().page,
      limit: this.filter().limit,
    };
    if (this.statusFilter()) f.status = this.statusFilter() as TaskStatus;
    if (this.priorityFilter()) f.priority = this.priorityFilter() as TaskPriority;

    this.tasksService.getAll(f).subscribe({
      next: ({ data, total, page, limit, totalPages }) => {
        this.tasks.set(data);
        this.pagination.set({ total, page, limit, totalPages });
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load tasks.');
        this.isLoading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.filter.update((f) => ({ ...f, page: 1 }));
    this.loadTasks();
  }

  goToPage(page: number): void {
    this.filter.update((f) => ({ ...f, page }));
    this.loadTasks();
  }

  openCreateForm(): void {
    this.editingTask.set(null);
    this.showForm.set(true);
  }

  openEditForm(task: Task): void {
    this.editingTask.set(task);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingTask.set(null);
  }

  onTaskSaved(): void {
    this.closeForm();
    this.loadTasks();
  }

  deleteTask(id: string): void {
    if (!confirm('Delete this task?')) return;
    this.tasksService.delete(id).subscribe({
      next: () => this.loadTasks(),
      error: () => this.errorMessage.set('Failed to delete task.'),
    });
  }

  statusBadgeClass(status: TaskStatus): string {
    const map: Record<TaskStatus, string> = {
      'todo':        'badge-todo',
      'in-progress': 'badge-in-progress',
      'done':        'badge-done',
    };
    return map[status];
  }

  priorityBadgeClass(priority: TaskPriority): string {
    const map: Record<TaskPriority, string> = {
      'low':    'badge-low',
      'medium': 'badge-medium',
      'high':   'badge-high',
    };
    return map[priority];
  }

  priorityBorderClass(priority: TaskPriority): string {
    const map: Record<TaskPriority, string> = {
      'low':    'priority-low',
      'medium': 'priority-medium',
      'high':   'priority-high',
    };
    return map[priority];
  }

  get pages(): number[] {
    return Array.from({ length: this.pagination().totalPages }, (_, i) => i + 1);
  }
}
