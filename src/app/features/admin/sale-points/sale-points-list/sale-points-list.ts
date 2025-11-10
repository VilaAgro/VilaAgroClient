// src/app/features/admin/sale-points/sale-points-list/sale-points-list.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SalePointService, SalePointDTO, SalePointCreateDTO } from '../../../../core/services/sale-point/sale-point';
import { UserService, UserDTO } from '../../../../core/services/user/user';

@Component({
  selector: 'app-sale-points-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    SelectModule,
    MessageModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './sale-points-list.html',
  styleUrls: ['./sale-points-list.scss']
})
export class SalePointsList implements OnInit {
  private salePointService = inject(SalePointService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  salePoints: SalePointDTO[] = [];
  filteredSalePoints: SalePointDTO[] = [];
  loading = false;

  // Filtros
  searchTerm = '';

  // Dialogs
  showSalePointDialog = false;
  showAllocateDialog = false;
  isEditMode = false;
  selectedSalePoint: SalePointDTO | null = null;

  // Formulário
  salePointForm: SalePointCreateDTO = {
    name: '',
    addressId: undefined
  };

  // Alocação
  availableUsers: UserDTO[] = [];
  selectedUserId: string | null = null;
  loadingUsers = false;

  ngOnInit() {
    this.loadSalePoints();
    this.loadAvailableUsers();
  }

  loadSalePoints() {
    this.loading = true;
    this.salePointService.getAllSalePoints().subscribe({
      next: (salePoints) => {
        this.salePoints = salePoints;
        this.filteredSalePoints = salePoints;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pontos de venda:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os pontos de venda'
        });
        this.loading = false;
      }
    });
  }

  loadAvailableUsers() {
    this.loadingUsers = true;
    // Carrega todos os usuários e filtra os que estão APPROVED ou ACTIVE sem ponto de venda
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.availableUsers = users.filter(u =>
          u.type !== 'ADMIN' &&
          (u.documentsStatus === 'APPROVED' || u.documentsStatus === 'ACTIVE') &&
          !u.salePointId
        );
        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os comerciantes'
        });
        this.loadingUsers = false;
      }
    });
  }

  applyFilters() {
    this.filteredSalePoints = this.salePoints.filter(sp => {
      const matchesSearch = !this.searchTerm ||
        sp.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (sp.allocatedUser && sp.allocatedUser.name.toLowerCase().includes(this.searchTerm.toLowerCase()));

      return matchesSearch;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.applyFilters();
  }

  openNewSalePointDialog() {
    this.isEditMode = false;
    this.selectedSalePoint = null;
    this.salePointForm = {
      name: '',
      addressId: undefined
    };
    this.showSalePointDialog = true;
  }

  openEditSalePointDialog(salePoint: SalePointDTO) {
    this.isEditMode = true;
    this.selectedSalePoint = salePoint;
    this.salePointForm = {
      name: salePoint.name,
      addressId: salePoint.addressId
    };
    this.showSalePointDialog = true;
  }

  saveSalePoint() {
    if (!this.salePointForm.name.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Nome do ponto de venda é obrigatório'
      });
      return;
    }

    if (this.isEditMode && this.selectedSalePoint) {
      // Atualizar
      this.salePointService.updateSalePoint(this.selectedSalePoint.id, this.salePointForm).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Ponto de venda atualizado com sucesso'
          });
          this.showSalePointDialog = false;
          this.loadSalePoints();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Não foi possível atualizar o ponto de venda'
          });
        }
      });
    } else {
      // Criar
      this.salePointService.createSalePoint(this.salePointForm).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Ponto de venda criado com sucesso'
          });
          this.showSalePointDialog = false;
          this.loadSalePoints();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Não foi possível criar o ponto de venda'
          });
        }
      });
    }
  }

  deleteSalePoint(salePoint: SalePointDTO) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o ponto "${salePoint.name}"? Esta ação não pode ser desfeita.`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.salePointService.deleteSalePoint(salePoint.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Ponto de venda excluído com sucesso'
            });
            this.loadSalePoints();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: error.error?.message || 'Não foi possível excluir o ponto de venda'
            });
          }
        });
      }
    });
  }

  openAllocateDialog(salePoint: SalePointDTO) {
    this.selectedSalePoint = salePoint;
    this.selectedUserId = salePoint.allocatedUser?.id || null;
    this.loadAvailableUsers(); // Recarrega usuários disponíveis
    this.showAllocateDialog = true;
  }

  allocateUser() {
    if (!this.selectedSalePoint || !this.selectedUserId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione um comerciante'
      });
      return;
    }

    this.salePointService.allocateUserToSalePoint(this.selectedSalePoint.id, {
      userId: this.selectedUserId
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Comerciante alocado com sucesso'
        });
        this.showAllocateDialog = false;
        this.loadSalePoints();
        this.loadAvailableUsers(); // Atualiza lista de disponíveis
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Não foi possível alocar o comerciante'
        });
      }
    });
  }

  removeUser(salePoint: SalePointDTO) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja desalocar ${salePoint.allocatedUser?.name} deste ponto?`,
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.salePointService.removeUserFromSalePoint(salePoint.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Usuário removido do ponto de venda'
            });
            this.loadSalePoints();
            this.loadAvailableUsers();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível remover o usuário'
            });
          }
        });
      }
    });
  }

  getStatusBadge(salePoint: SalePointDTO): { severity: string; label: string } {
    if (salePoint.allocatedUser) {
      return { severity: 'success', label: 'Ocupado' };
    }
    return { severity: 'warning', label: 'Disponível' };
  }
}
