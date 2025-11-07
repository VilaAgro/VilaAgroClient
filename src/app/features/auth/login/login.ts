import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FloatLabelModule,
    CheckboxModule,
    MessageModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      rememberMe: new FormControl(false)
    });
  }

  onSubmit() {
    // Limpa mensagem de erro anterior
    this.errorMessage = '';

    // Valida o formulário
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login realizado com sucesso:', response);
        this.isLoading = false;
        // O redirecionamento é feito automaticamente pelo AuthService
      },
      error: (error) => {
        console.error('Erro no login:', error);
        this.errorMessage = error.message || 'Credenciais inválidas. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  redirectToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  // Helpers para validação do formulário
  get emailInvalid(): boolean {
    const control = this.loginForm.get('email');
    return !!(control?.invalid && control?.touched);
  }

  get passwordInvalid(): boolean {
    const control = this.loginForm.get('password');
    return !!(control?.invalid && control?.touched);
  }

  get emailErrorMessage(): string {
    const control = this.loginForm.get('email');
    if (control?.hasError('required')) {
      return 'E-mail é obrigatório';
    }
    if (control?.hasError('email')) {
      return 'E-mail inválido';
    }
    return '';
  }

  get passwordErrorMessage(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) {
      return 'Senha é obrigatória';
    }
    if (control?.hasError('minlength')) {
      return 'Senha deve ter no mínimo 6 caracteres';
    }
    return '';
  }
}
