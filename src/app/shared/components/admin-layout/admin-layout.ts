import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Importe RouterModule
import { AuthService } from '../../../core/services/auth';
import { User } from '../../../core/models/user.model';

// Importe os módulos do PrimeNG
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-admin-layout',
  standalone: true, // Adicione standalone
  imports: [
    CommonModule,
    RouterModule, // Adicione RouterModule
    DrawerModule,
    ButtonModule,
    ToolbarModule,
    MenuModule
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss' // Vamos criar este arquivo
})
export class AdminLayout {
  private authService = inject(AuthService);
  private router = inject(Router);

  sidebarVisible = true;
  currentUser: User | null = null;
  menuItems: MenuItem[] = [];

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.menuItems = this.buildMenu();
  }

  logout() {
    this.authService.logout();
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  private buildMenu(): MenuItem[] {
  return [
    {
      label: 'Visão Geral',
      icon: 'pi pi-home',
      routerLink: '/admin/dashboard'
    },
    {
      label: 'Gerenciamento',
      items: [
        {
          label: 'Usuários',
          icon: 'pi pi-users',
          routerLink: '/admin/users' // ✅ Agora funciona!
        },
        {
          label: 'Pontos de Venda',
          icon: 'pi pi-map-marker',
          routerLink: '/admin/sale-points'
        },
        {
          label: 'Feiras e Atrações',
          icon: 'pi pi-shopping-bag',
          routerLink: '/admin/fairs'
        },
        {
          label: 'Frequência',
          icon: 'pi pi-calendar',
          routerLink: '/admin/attendance'
        },
        {
          label: 'Cursos',
          icon: 'pi pi-book',
          routerLink: '/admin/courses'
        },
        {
          label: 'Comunicados',
          icon: 'pi pi-bullhorn',
          routerLink: '/admin/statements'
        }
      ]
    },
    {
      label: 'Sua Conta',
      items: [
        {
          label: 'Meu Perfil',
          icon: 'pi pi-user',
          command: () => this.router.navigate(['/admin/profile'])
        },
        {
          label: 'Sair',
          icon: 'pi pi-sign-out',
          command: () => this.logout()
        }
      ]
    }
  ];
}
}
