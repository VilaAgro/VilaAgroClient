import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>Bem-vindo, {{ user?.name }}!</h1>
        <button pButton label="Sair" icon="pi pi-sign-out" (click)="logout()"></button>
      </div>

      <div class="cards-grid">
        <p-card header="Perfil">
          <p><strong>Email:</strong> {{ user?.email }}</p>
          <p><strong>Status:</strong> {{ getStatusLabel(user?.status) }}</p>
          <p><strong>Categoria:</strong> {{ user?.category }}</p>
        </p-card>

        <p-card header="Ações Rápidas">
          <button pButton label="Ver Cursos" class="p-button-outlined mb-2 w-full"></button>
          <button pButton label="Minha Frequência" class="p-button-outlined mb-2 w-full"></button>
          <button pButton label="Comunicados" class="p-button-outlined w-full"></button>
        </p-card>

        <p-card header="Ponto de Venda">
          @if (user?.salePointId) {
            <p>Você está alocado em um ponto de venda</p>
            <button pButton label="Ver Detalhes" class="p-button-success"></button>
          } @else {
            <p>Você ainda não está alocado em um ponto de venda</p>
          }
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    :host ::ng-deep .p-card {
      height: 100%;
    }
  `]
})
export class UserDashboard implements OnInit {
  private authService = inject(AuthService);
  user: User | null = null;

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
  }

  getStatusLabel(status?: string): string {
    const labels: any = {
      'PENDING': 'Pendente',
      'APPROVED': 'Aprovado',
      'ACTIVE': 'Ativo',
      'DISAPPROVED': 'Reprovado',
      'INACTIVE': 'Inativo'
    };
    return labels[status || ''] || status || 'Desconhecido';
  }
}
