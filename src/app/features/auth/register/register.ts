import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, FormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth';

interface UserType {
  label: string;
  value: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    InputTextModule,
    PasswordModule,
    ButtonModule,
    SelectModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MessageModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  userTypes: UserType[] = [
    { label: 'Produtor Rural', value: 'PRODUTOR_RURAL' },
    { label: 'Gastrônomo', value: 'GASTRONOMO' },
    { label: 'Produtor Artesanal', value: 'PRODUTOR_ARTESANAL' }
  ];

  constructor() {
    this.registerForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      cpf: new FormControl('', [Validators.required, Validators.pattern(/^\d{11}$/)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
      type: new FormControl(null, [Validators.required])
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const g = control as FormGroup;
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;

    const userData = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      cpf: this.registerForm.value.cpf,
      password: this.registerForm.value.password,
      type: this.registerForm.value.type,
      documentsStatus: 'PENDING' // Status inicial
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Registro realizado com sucesso:', response);
        this.successMessage = 'Cadastro realizado com sucesso! Redirecionando...';
        this.isLoading = false;

        // Redireciona após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/painel']);
        }, 2000);
      },
      error: (error) => {
        console.error('Erro no registro:', error);
        this.errorMessage = error.message || 'Erro ao realizar cadastro. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  redirectToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  // Helpers para validação
  get nameInvalid(): boolean {
    const control = this.registerForm.get('name');
    return !!(control?.invalid && control?.touched);
  }

  get emailInvalid(): boolean {
    const control = this.registerForm.get('email');
    return !!(control?.invalid && control?.touched);
  }

  get cpfInvalid(): boolean {
    const control = this.registerForm.get('cpf');
    return !!(control?.invalid && control?.touched);
  }

  get passwordInvalid(): boolean {
    const control = this.registerForm.get('password');
    return !!(control?.invalid && control?.touched);
  }

  get confirmPasswordInvalid(): boolean {
    const control = this.registerForm.get('confirmPassword');
    const touched = !!control?.touched;
    return !!(control?.invalid && touched) || (this.registerForm.hasError('mismatch') && touched);
  }

  get typeInvalid(): boolean {
    const control = this.registerForm.get('type');
    return !!(control?.invalid && control?.touched);
  }
}
