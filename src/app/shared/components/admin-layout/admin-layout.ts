import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { User } from '../../../core/models/user.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

// Módulos PrimeNG
import { DrawerModule } from 'primeng/drawer'; // Correto!
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DrawerModule, // Usando DrawerModule
    ButtonModule,
    ToolbarModule,
    MenuModule,
    AvatarModule
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout {
  private authService = inject(AuthService);
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);

  // Signal para controlar a visibilidade do drawer
  sidebarVisible = signal(true);

  // Signal reativo para detectar tela mobile
  isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  currentUser: User | null = null;
  userInitials = signal('?');
  sidebarMenuItems: MenuItem[] = []; // Renomeado de 'menuItems'
  userMenuItems: MenuItem[] = []; // Novo para o menu do avatar

  // Ajusta a visibilidade inicial
  constructor() {
    if (this.isMobile()) {
      this.sidebarVisible.set(false);
    }
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.sidebarMenuItems = this.buildSidebarMenu();
    this.userMenuItems = this.buildUserMenu(); // Crie o menu do usuário
    this.updateUserInitials(); // Calcule as iniciais
  }

  logout() {
    this.authService.logout();
  }

  toggleSidebar() {
    this.sidebarVisible.update(v => !v);
  }

  private updateUserInitials() {
    const name = this.currentUser?.name || '';
    const parts = name.split(' ');
    let initials = '';

    if (parts.length > 1) {
      initials = parts[0][0] + parts[parts.length - 1][0];
    } else if (parts[0].length > 0) {
      initials = parts[0].substring(0, 2);
    } else {
      initials = '?';
    }

    this.userInitials.set(initials.toUpperCase());
  }

  private buildSidebarMenu(): MenuItem[] {
    // Seu método buildMenu() original (sem alterações)
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
            routerLink: '/admin/users'
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

  private buildUserMenu(): MenuItem[] {
    // Movemos os itens de "Sua Conta" para cá
    return [
      {
        label: 'Meu Perfil',
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/admin/profile'])
      },
      {
        separator: true
      },
      {
        label: 'Sair',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

}
