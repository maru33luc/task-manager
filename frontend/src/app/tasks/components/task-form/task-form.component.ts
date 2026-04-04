import {
  Component,
  inject,
  input,
  output,
  signal,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TasksService } from '../../services/tasks.service';
import { Task, TaskStatus, TaskPriority } from '../../../core/models';

@Component({
  selector: 'app-task-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent implements OnInit {
  private readonly tasksService = inject(TasksService);
  private readonly fb = inject(FormBuilder);

  readonly task = input<Task | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly statusOptions: { label: string; value: TaskStatus }[] = [
    { label: 'Todo', value: 'todo' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Done', value: 'done' },
  ];

  readonly priorityOptions: { label: string; value: TaskPriority }[] = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ];

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    description: [''],
    status: ['todo' as TaskStatus],
    priority: ['medium' as TaskPriority],
    dueDate: [''],
  });

  get isEditing(): boolean {
    return this.task() !== null;
  }

  ngOnInit(): void {
    const t = this.task();
    if (t) {
      this.form.patchValue({
        title: t.title,
        description: t.description ?? '',
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate ?? '',
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { title, description, status, priority, dueDate } = this.form.value;
    const payload = {
      title: title!,
      description: description || undefined,
      status: status as TaskStatus,
      priority: priority as TaskPriority,
      dueDate: dueDate || undefined,
    };

    const t = this.task();
    const request$ = t
      ? this.tasksService.update(t.id, payload)
      : this.tasksService.create(payload);

    request$.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.saved.emit();
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage.set(err.error?.message ?? 'Failed to save task.');
        this.isLoading.set(false);
      },
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  get titleControl() { return this.form.controls['title']; }
}
