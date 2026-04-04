import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, name, password } = this.form.value;

    this.authService
      .register({ email: email!, name: name!, password: password! })
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage.set(err.error?.message ?? 'Registration failed. Please try again.');
          this.isLoading.set(false);
        },
      });
  }

  get nameControl() { return this.form.controls['name']; }
  get emailControl() { return this.form.controls['email']; }
  get passwordControl() { return this.form.controls['password']; }
}
