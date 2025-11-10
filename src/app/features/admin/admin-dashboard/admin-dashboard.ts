// src/app/features/admin/admin-dashboard/admin-dashboard.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
  imports: [CommonModule, CardModule, ButtonModule, ProgressSpinnerModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

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

  // Métodos de navegação
  navigateToUsers() {
    this.router.navigate(['/admin/users']);
  }

  navigateToSalePoints() {
    this.router.navigate(['/admin/sale-points']);
  }

  navigateToAttendance() {
    this.router.navigate(['/admin/attendance']);
  }

  navigateToFairs() {
    this.router.navigate(['/admin/fairs']);
  }
}
