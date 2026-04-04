import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { StatsService } from '../../services/stats.service';
import { TaskStats } from '../../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly statsService = inject(StatsService);
  readonly authService = inject(AuthService);

  readonly stats = signal<TaskStats | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly todoCount = computed(() => this.stats()?.byStatus['todo'] ?? 0);
  readonly inProgressCount = computed(() => this.stats()?.byStatus['in-progress'] ?? 0);
  readonly doneCount = computed(() => this.stats()?.byStatus['done'] ?? 0);
  readonly lowCount = computed(() => this.stats()?.byPriority['low'] ?? 0);
  readonly mediumCount = computed(() => this.stats()?.byPriority['medium'] ?? 0);
  readonly highCount = computed(() => this.stats()?.byPriority['high'] ?? 0);
  readonly total = computed(() => this.stats()?.total ?? 0);

  ngOnInit(): void {
    this.statsService.getStats().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load statistics.');
        this.isLoading.set(false);
      },
    });
  }
}
