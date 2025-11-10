// src/app/features/admin/users/users-list.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService, UserDTO } from '../../../../core/services/user/user';
import { SalePointService, SalePointDTO } from '../../../../core/services/sale-point/sale-point';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    DialogModule,
    SelectModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.scss']
})
export class UsersList implements OnInit {
  private userService = inject(UserService);
  private salePointService = inject(SalePointService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];

  loading = false;
  loadingSalePoints = false;

  showCreateUserDialog = false;
  userForm = {
    name: '',
    email: '',
    cpf: '',
    password: '',
    type: null as string | null
  };

  // Filtros
  searchTerm = '';
  selectedStatus: string | null = null;
  selectedType: string | null = null;

  // Dialogs
  showUserDialog = false;
  showSalePointDialog = false;
  showRejectDialog = false;
  selectedUser: UserDTO | null = null;

  // Sale Points
  availableSalePoints: SalePointDTO[] = [];
  selectedSalePointId: string | null = null;

  // Rejection
  rejectionReason = '';

  statusOptions = [
    { label: 'Pendente', value: 'PENDING' },
    { label: 'Aprovado', value: 'APPROVED' },
    { label: 'Ativo', value: 'ACTIVE' },
    { label: 'Reprovado', value: 'DISAPPROVED' },
    { label: 'Inativo', value: 'INACTIVE' }
  ];

  typeOptions = [
    { label: 'Produtor Rural', value: 'PRODUTOR_RURAL' },
    { label: 'Gastrônomo', value: 'GASTRONOMO' },
    { label: 'Produtor Artesanal', value: 'PRODUTOR_ARTESANAL' }
  ];

  ngOnInit() {
    this.loadUsers();
    this.loadSalePoints();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os usuários'
        });
        this.loading = false;
      }
    });
  }

  loadSalePoints() {
    this.loadingSalePoints = true;
    this.salePointService.getAllSalePoints().subscribe({
      next: (salePoints) => {
        // Filtra apenas pontos sem usuário alocado (disponíveis)
        this.availableSalePoints = salePoints.filter(sp => !sp.allocatedUser);
        this.loadingSalePoints = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pontos de venda:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os pontos de venda'
        });
        this.loadingSalePoints = false;
        this.availableSalePoints = [];
      }
    });
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm ||
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (user.cpf && user.cpf.includes(this.searchTerm));

      const matchesStatus = !this.selectedStatus ||
        user.documentsStatus === this.selectedStatus;

      const matchesType = !this.selectedType ||
        user.type === this.selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.selectedType = null;
    this.applyFilters();
  }

  viewUser(user: UserDTO) {
    this.selectedUser = user;
    this.showUserDialog = true;
  }

  approveUser(user: UserDTO) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja aprovar os documentos de ${user.name}?`,
      header: 'Confirmar Aprovação',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.userService.updateUserStatus(user.id, 'APPROVED').subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Documentos aprovados com sucesso'
            });
            this.loadUsers();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível aprovar os documentos'
            });
          }
        });
      }
    });
  }

  activateUser(user: UserDTO) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja ativar ${user.name}? O comerciante poderá participar das feiras.`,
      header: 'Confirmar Ativação',
      icon: 'pi pi-check-circle',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.userService.updateUserStatus(user.id, 'ACTIVE').subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Comerciante ativado com sucesso'
            });
            this.loadUsers();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível ativar o comerciante'
            });
          }
        });
      }
    });
  }

  deactivateUser(user: UserDTO) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja desativar ${user.name}? O comerciante não poderá mais participar das feiras.`,
      header: 'Confirmar Desativação',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.userService.updateUserStatus(user.id, 'INACTIVE').subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Comerciante desativado com sucesso'
            });
            this.loadUsers();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível desativar o comerciante'
            });
          }
        });
      }
    });
  }

  rejectUser(user: UserDTO) {
    this.selectedUser = user;
    this.rejectionReason = '';
    this.showRejectDialog = true;
  }

  confirmRejection() {
    if (!this.selectedUser || !this.rejectionReason) return;

    this.userService.updateUserStatus(
      this.selectedUser.id,
      'DISAPPROVED',
      this.rejectionReason
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Documentos reprovados'
        });
        this.showRejectDialog = false;
        this.loadUsers();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível reprovar os documentos'
        });
      }
    });
  }

  allocateSalePoint(user: UserDTO) {
    this.selectedUser = user;
    this.selectedSalePointId = null;
    this.loadSalePoints(); // Recarrega pontos disponíveis
    this.showSalePointDialog = true;
  }

  changeSalePoint(user: UserDTO) {
    this.selectedUser = user;
    this.selectedSalePointId = user.salePointId || null;
    this.loadSalePoints(); // Recarrega pontos disponíveis
    this.showSalePointDialog = true;
  }

  confirmSalePointAllocation() {
    if (!this.selectedUser || !this.selectedSalePointId) return;

    this.userService.updateUser(this.selectedUser.id, {
      salePointId: this.selectedSalePointId
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Ponto de venda alocado com sucesso'
        });
        this.showSalePointDialog = false;
        this.loadUsers();
        this.loadSalePoints(); // Atualiza lista de pontos disponíveis
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível alocar o ponto de venda'
        });
      }
    });
  }

  deleteUser(user: UserDTO) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir ${user.name}? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Usuário excluído com sucesso'
            });
            this.loadUsers();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível excluir o usuário'
            });
          }
        });
      }
    });
  }

  // Helpers
  getCountByStatus(status: string): number {
    return this.users.filter(u => u.documentsStatus === status && u.type !== 'ADMIN').length;
  }

  getUserTypeLabel(type: string): string {
    const labels: any = {
      'PRODUTOR_RURAL': 'Produtor Rural',
      'GASTRONOMO': 'Gastrônomo',
      'PRODUTOR_ARTESANAL': 'Produtor Artesanal',
      'ADMIN': 'Administrador'
    };
    return labels[type] || type;
  }

  getTypeSeverity(type: string): string {
    const severities: any = {
      'PRODUTOR_RURAL': 'success',
      'GASTRONOMO': 'info',
      'PRODUTOR_ARTESANAL': 'warning',
      'ADMIN': 'danger'
    };
    return severities[type] || 'info';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'PENDING': 'Pendente',
      'APPROVED': 'Aprovado',
      'ACTIVE': 'Ativo',
      'DISAPPROVED': 'Reprovado',
      'INACTIVE': 'Inativo',
      'REQUESTED_TERMINATION': 'Solicitou Desligamento'
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): string {
    const severities: any = {
      'PENDING': 'warning',
      'APPROVED': 'info',
      'ACTIVE': 'success',
      'DISAPPROVED': 'danger',
      'INACTIVE': 'secondary',
      'REQUESTED_TERMINATION': 'danger'
    };
    return severities[status] || 'info';
  }

  getSalePointNumber(salePointId: string): string {
    const point = this.availableSalePoints.find(p => p.id === salePointId);
    return point ? point.name : salePointId;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  openNewUserDialog() {
    this.userForm = {
      name: '',
      email: '',
      cpf: '',
      password: '',
      type: null
    };
    this.showCreateUserDialog = true;
  }

  createUser() {
    // Validações básicas
    if (!this.userForm.name || !this.userForm.email || !this.userForm.password || !this.userForm.type) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios'
      });
      return;
    }

    // Valida CPF (11 dígitos) se fornecido
    if (this.userForm.cpf && !/^\d{11}$/.test(this.userForm.cpf)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'CPF deve conter exatamente 11 dígitos'
      });
      return;
    }

    const userData = {
      name: this.userForm.name,
      email: this.userForm.email,
      cpf: this.userForm.cpf || undefined,
      password: this.userForm.password,
      type: this.userForm.type!,
      documentsStatus: 'PENDING'
    };

    // Chama o endpoint de criação de usuário (POST /api/users)
    this.userService.createUser(userData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Usuário criado com sucesso'
        });
        this.showCreateUserDialog = false;
        this.loadUsers();
      },
      error: (error: { error: { message: any; }; }) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Não foi possível criar o usuário'
        });
      }
    });
  }
}
