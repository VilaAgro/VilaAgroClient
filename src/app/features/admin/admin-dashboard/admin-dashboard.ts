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
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
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
}
