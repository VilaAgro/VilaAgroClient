import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth';

interface DashboardStats {
  pendingRegistrations: number;
  waitingList: number;
  pendingJustifications: number;
  totalSalePoints: number;
  occupiedSalePoints: number;
  occupationRate: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="admin-dashboard">
      <div class="header">
        <h1>Dashboard Administrativo</h1>
        <button pButton label="Sair" icon="pi pi-sign-out" (click)="logout()"></button>
      </div>

      @if (loading) {
        <div class="loading">Carregando estatísticas...</div>
      } @else if (stats) {
        <div class="stats-grid">
          <p-card header="Solicitações Pendentes" styleClass="stat-card pending">
            <div class="stat-value">{{ stats.pendingRegistrations }}</div>
            <p>Novos cadastros aguardando aprovação</p>
          </p-card>

          <p-card header="Fila de Espera" styleClass="stat-card waiting">
            <div class="stat-value">{{ stats.waitingList }}</div>
            <p>Usuários aprovados aguardando alocação</p>
          </p-card>

          <p-card header="Justificativas Pendentes" styleClass="stat-card justifications">
            <div class="stat-value">{{ stats.pendingJustifications }}</div>
            <p>Faltas aguardando análise</p>
          </p-card>

          <p-card header="Taxa de Ocupação" styleClass="stat-card occupation">
            <div class="stat-value">{{ stats.occupationRate.toFixed(1) }}%</div>
            <p>{{ stats.occupiedSalePoints }} de {{ stats.totalSalePoints }} pontos ocupados</p>
          </p-card>
        </div>

        <div class="actions-grid">
          <p-card header="Ações Rápidas">
            <button pButton label="Gerenciar Usuários" class="mb-2 w-full" icon="pi pi-users"></button>
            <button pButton label="Pontos de Venda" class="mb-2 w-full" icon="pi pi-map-marker"></button>
            <button pButton label="Frequência" class="mb-2 w-full" icon="pi pi-calendar"></button>
            <button pButton label="Feiras" class="w-full" icon="pi pi-shopping-bag"></button>
          </p-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-value {
      font-size: 3rem;
      font-weight: bold;
      color: #4CAF50;
      margin: 0.5rem 0;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      font-size: 1.2rem;
      color: #666;
    }

    :host ::ng-deep .stat-card {
      text-align: center;
    }

    :host ::ng-deep .stat-card.pending .p-card-header {
      background: #fff3cd;
    }

    :host ::ng-deep .stat-card.waiting .p-card-header {
      background: #d1ecf1;
    }

    :host ::ng-deep .stat-card.justifications .p-card-header {
      background: #f8d7da;
    }

    :host ::ng-deep .stat-card.occupation .p-card-header {
      background: #d4edda;
    }
  `]
})
export class AdminDashboard implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  stats: DashboardStats | null = null;
  loading = true;

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.http.get<DashboardStats>(`${environment.apiUrl}/dashboard/stats`, {
      withCredentials: true
    }).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas:', error);
        this.loading = false;
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
