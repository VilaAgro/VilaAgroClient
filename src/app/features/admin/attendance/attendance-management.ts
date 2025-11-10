// src/app/features/admin/attendance/attendance-management.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TabsModule } from 'primeng/tabs';
import { MessageModule } from 'primeng/message';
import { FileUploadModule } from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AttendanceService } from '../../../core/services/attendance/attendance';
import { AbsenceDTO, RegisterAbsencesRequest, ReviewJustificationRequest } from '../../../core/models/attendance.model';
import { UserService, UserDTO } from '../../../core/services/user/user';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-attendance-management',
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
    DatePickerModule,
    TabsModule,
    MessageModule,
    FileUploadModule,
    TextareaModule,
    MultiSelectModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
<div class="attendance-management">
  <p-toast />
  <p-confirmDialog />

  <!-- Header -->
  <p-toolbar styleClass="page-toolbar" class="mb-2">
    <div class="p-toolbar-group-start">
      <div class="title-section">
        <h1>Gerenciamento de Frequência</h1>
        <p class="subtitle">Gerencie faltas, justificativas e presenças dos comerciantes</p>
      </div>
    </div>
    <div class="p-toolbar-group-end">
      <button
        pButton
        label="Registrar Faltas"
        icon="pi pi-calendar-times"
        class="p-button-danger"
        (click)="openRegisterAbsencesDialog()"
      ></button>
    </div>
  </p-toolbar>

  <!-- Tabs -->
  <p-tabs [(value)]="activeTab">
    <!-- Tab: Justificativas Pendentes -->
    <p-tabpanel header="Justificativas Pendentes" [value]="0">
      <div class="pending-count" *ngIf="pendingJustifications.length > 0">
        <p-message severity="warn" styleClass="w-full">
          <ng-template pTemplate="content">
            <i class="pi pi-exclamation-triangle"></i>
            <span>Existem {{ pendingJustifications.length }} justificativas aguardando análise</span>
          </ng-template>
        </p-message>
      </div>

      <p-table
        [value]="pendingJustifications"
        [loading]="loading"
        [paginator]="true"
        [rows]="10"
        styleClass="p-datatable-striped"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Comerciante</th>
            <th>Data da Falta</th>
            <th>Tipo</th>
            <th>Justificativa</th>
            <th>Anexo</th>
            <th>Ações</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-absence>
          <tr>
            <td>
              <div class="user-info">
                <i class="pi pi-user"></i>
                <span>{{ getUserName(absence.userId) }}</span>
              </div>
            </td>
            <td>{{ formatDate(absence.date) }}</td>
            <td>
              <p-tag
                [value]="getTypeLabel(absence.type)"
                [severity]="getTypeSeverity(absence.type)"
              />
            </td>
            <td>
              <div class="justification-preview">
                {{ absence.justification?.description || '-' }}
              </div>
            </td>
            <td class="text-center">
              @if (absence.justification?.hasAnnex) {
                <button
                  pButton
                  icon="pi pi-paperclip"
                  class="p-button-rounded p-button-text p-button-sm"
                  (click)="downloadAnnex(absence.justification.id)"
                  pTooltip="Baixar Anexo"
                ></button>
              } @else {
                <span class="text-muted">-</span>
              }
            </td>
            <td>
              <div class="action-buttons">
                <button
                  pButton
                  icon="pi pi-check"
                  label="Aprovar"
                  class="p-button-sm p-button-success"
                  (click)="reviewJustification(absence, true)"
                ></button>
                <button
                  pButton
                  icon="pi pi-times"
                  label="Reprovar"
                  class="p-button-sm p-button-danger"
                  (click)="openRejectDialog(absence)"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center">
              <div class="empty-state">
                <i class="pi pi-check-circle" style="font-size: 3rem; color: #4caf50"></i>
                <p>Nenhuma justificativa pendente</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </p-tabpanel>

    <!-- Tab: Histórico de Faltas -->
    <p-tabpanel header="Histórico de Faltas" [value]="1">
      <!-- Filtros -->
      <div class="filters-section">
        <div class="filter-group">
          <p-select
            [(ngModel)]="selectedUserId"
            [options]="users"
            optionLabel="name"
            optionValue="id"
            placeholder="Todos os comerciantes"
            (onChange)="loadAbsencesHistory()"
            styleClass="w-full"
            [filter]="true"
            [showClear]="true"
          />
        </div>
      </div>

      <p-table
        [value]="absencesHistory"
        [loading]="loadingHistory"
        [paginator]="true"
        [rows]="10"
        styleClass="p-datatable-striped"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Comerciante</th>
            <th>Data</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Justificativa</th>
            <th>Ações</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-absence>
          <tr>
            <td>{{ getUserName(absence.userId) }}</td>
            <td>{{ formatDate(absence.date) }}</td>
            <td>
              <p-tag
                [value]="getTypeLabel(absence.type)"
                [severity]="getTypeSeverity(absence.type)"
              />
            </td>
            <td>
              <p-tag
                [value]="getStatusLabel(absence.isAccepted, absence.justification?.isApproved)"
                [severity]="getStatusSeverity(absence.isAccepted, absence.justification?.isApproved)"
              />
            </td>
            <td>
              @if (absence.justification) {
                <span class="has-justification">
                  <i class="pi pi-file-edit"></i>
                  {{ absence.justification.description.substring(0, 50) }}...
                </span>
              } @else {
                <span class="text-muted">Sem justificativa</span>
              }
            </td>
            <td>
              <button
                pButton
                icon="pi pi-eye"
                class="p-button-rounded p-button-text p-button-sm"
                (click)="viewAbsenceDetails(absence)"
                pTooltip="Ver Detalhes"
              ></button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="6" class="text-center">
              <div class="empty-state">
                <i class="pi pi-calendar" style="font-size: 3rem; color: #ccc"></i>
                <p>Nenhuma falta registrada</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </p-tabpanel>
  </p-tabs>

  <!-- Dialog: Registrar Faltas -->
  <p-dialog
    [(visible)]="showRegisterDialog"
    header="Registrar Faltas"
    [modal]="true"
    [style]="{width: '700px'}"
    styleClass="attendance-dialog"
    [draggable]="false"
  >
    <div class="register-absences-form">
      <div class="field">
        <label for="absenceDate">Data da Feira *</label>
        <p-datepicker
          id="absenceDate"
          [(ngModel)]="absenceForm.date"
          dateFormat="dd/mm/yy"
          [showIcon]="true"
          styleClass="w-full"
          placeholder="Selecione a data"
          appendTo="body"
        />
      </div>

      <div class="field">
        <label>Comerciantes Faltantes *</label>
        @if (loadingUsers) {
          <div class="loading-message">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Carregando comerciantes...</span>
          </div>
        }
        <p-multiselect
          [(ngModel)]="absenceForm.userIds"
          [options]="activeUsers"
          optionLabel="name"
          optionValue="id"
          placeholder="Selecione os comerciantes"
          [filter]="true"
          styleClass="w-full"
          display="chip"
          appendTo="body"
          [disabled]="activeUsers.length === 0 || loadingUsers"
        >
          <ng-template pTemplate="selectedItems" let-values>
            @if (values && values.length > 0) {
              <div class="selected-users">
                @for (userId of values; track userId) {
                  <p-tag [value]="getUserName(userId)" styleClass="mr-1" />
                }
              </div>
            }
          </ng-template>
        </p-multiselect>
        @if (activeUsers.length === 0 && !loadingUsers) {
          <small class="p-error">
            Nenhum comerciante disponível. Verifique se há comerciantes cadastrados com status APPROVED ou ACTIVE.
          </small>
        } @else if (!loadingUsers) {
          <small class="p-text-secondary">
            Selecione todos os comerciantes que faltaram nesta data ({{ activeUsers.length }} disponíveis)
          </small>
        }
      </div>
    </div>

    <ng-template pTemplate="footer">
      <button
        pButton
        label="Cancelar"
        icon="pi pi-times"
        (click)="showRegisterDialog = false"
        class="p-button-text"
      ></button>
      <button
        pButton
        label="Registrar Faltas"
        icon="pi pi-check"
        (click)="registerAbsences()"
        [disabled]="!absenceForm.date || absenceForm.userIds.length === 0"
      ></button>
    </ng-template>
  </p-dialog>

  <!-- Dialog: Reprovar Justificativa -->
  <p-dialog
    [(visible)]="showRejectDialog"
    header="Reprovar Justificativa"
    [modal]="true"
    [style]="{width: '550px'}"
    styleClass="attendance-dialog"
    [draggable]="false"
  >
    <div class="reject-form">
      <p-message severity="warn" styleClass="w-full mb-3">
        <ng-template pTemplate="content">
          <span>A justificativa será reprovada e a falta permanecerá registrada.</span>
        </ng-template>
      </p-message>

      <div class="field">
        <label for="rejectReason">Motivo da Reprovação (opcional)</label>
        <textarea
          id="rejectReason"
          pInputTextarea
          [(ngModel)]="rejectReason"
          rows="4"
          class="w-full"
          placeholder="Descreva o motivo da reprovação..."
        ></textarea>
      </div>
    </div>

    <ng-template pTemplate="footer">
      <button
        pButton
        label="Cancelar"
        icon="pi pi-times"
        (click)="showRejectDialog = false"
        class="p-button-text"
      ></button>
      <button
        pButton
        label="Reprovar"
        icon="pi pi-check"
        (click)="confirmReject()"
        class="p-button-danger"
      ></button>
    </ng-template>
  </p-dialog>

  <!-- Dialog: Detalhes da Falta -->
  <p-dialog
    [(visible)]="showDetailsDialog"
    header="Detalhes da Falta"
    [modal]="true"
    [style]="{width: '650px'}"
    styleClass="attendance-dialog"
    [draggable]="false"
  >
    @if (selectedAbsence) {
      <div class="absence-details">
        <div class="detail-group">
          <label>Comerciante:</label>
          <p>{{ getUserName(selectedAbsence.userId) }}</p>
        </div>

        <div class="detail-group">
          <label>Data da Falta:</label>
          <p>{{ formatDate(selectedAbsence.date) }}</p>
        </div>

        <div class="detail-group">
          <label>Tipo:</label>
          <p-tag
            [value]="getTypeLabel(selectedAbsence.type)"
            [severity]="getTypeSeverity(selectedAbsence.type)"
          />
        </div>

        <div class="detail-group">
          <label>Status:</label>
          <p-tag
            [value]="getStatusLabel(selectedAbsence.isAccepted, selectedAbsence.justification?.isApproved)"
            [severity]="getStatusSeverity(selectedAbsence.isAccepted, selectedAbsence.justification?.isApproved)"
          />
        </div>

        @if (selectedAbsence.justification) {
          <div class="detail-group">
            <label>Justificativa:</label>
            <p class="justification-full">{{ selectedAbsence.justification.description }}</p>
          </div>

          @if (selectedAbsence.justification.hasAnnex) {
            <div class="detail-group">
              <label>Anexo:</label>
              <button
                pButton
                label="Baixar Anexo"
                icon="pi pi-download"
                class="p-button-outlined"
                (click)="downloadAnnex(selectedAbsence.justification.id)"
              ></button>
            </div>
          }

          @if (selectedAbsence.justification.approvedByAdminId) {
            <div class="detail-group">
              <label>Analisado por:</label>
              <p>Administrador (ID: {{ selectedAbsence.justification.approvedByAdminId }})</p>
            </div>
          }
        }

        <div class="detail-group">
          <label>Registrado em:</label>
          <p>{{ formatDateTime(selectedAbsence.createdAt) }}</p>
        </div>
      </div>
    }

    <ng-template pTemplate="footer">
      <button
        pButton
        label="Fechar"
        icon="pi pi-times"
        (click)="showDetailsDialog = false"
      ></button>
    </ng-template>
  </p-dialog>
</div>
  `,
  styles: [`
.attendance-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

:host ::ng-deep .page-toolbar {
  background: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .title-section {
    h1 {
      margin: 0 0 0.25rem 0;
      color: #333;
      font-size: 1.75rem;
      font-weight: 600;
    }
    .subtitle {
      margin: 0;
      color: #6c757d;
      font-size: 0.95rem;
    }
  }
}

.filters-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pending-count {
  margin-bottom: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    color: #666;
  }
}

.justification-preview {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #666;

  p {
    margin-top: 1rem;
    font-size: 1.1rem;
  }
}

.register-absences-form,
.reject-form {
  .field {
    margin-bottom: 1.25rem;

    label {
      display: block;
      font-weight: 500;
      color: #333;
      margin-bottom: 0.5rem;
    }

    small.p-text-secondary {
      display: block;
      margin-top: 0.25rem;
      color: #6c757d;
      font-size: 0.85rem;
    }
  }

  .selected-users {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .loading-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background: #f0f8ff;
    border-radius: 4px;
    color: #2196f3;
    font-size: 0.9rem;

    i {
      font-size: 1.2rem;
    }
  }
}

.absence-details {
  .detail-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    p {
      margin: 0;
      color: #666;
    }

    .justification-full {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      white-space: pre-wrap;
    }
  }
}

.has-justification {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4caf50;

  i {
    color: #4caf50;
  }
}

.text-muted {
  color: #999;
  font-style: italic;
}

@media (max-width: 1024px) {
  .action-buttons {
    flex-direction: column;
  }
}

:host ::ng-deep {
  // Dialog size configurations
  .attendance-dialog {
    .p-dialog-header {
      padding: 1.5rem;
      background: #f8f9fa;
    }

    .p-dialog-content {
      padding: 1.5rem;
      max-height: 70vh;
      overflow-y: auto;
    }
  }

  .p-datatable {
    .p-datatable-thead > tr > th {
      background: #f8f9fa;
      color: #495057;
      font-weight: 600;
      border: none;
      padding: 1rem;
    }

    .p-datatable-tbody > tr > td {
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
    }

    .p-datatable-tbody > tr:hover {
      background: #f8f9fa;
    }
  }

  .p-tabs {
    .p-tabs-nav {
      background: #ffffff;
      border-bottom: 2px solid #e9ecef;
      padding: 0 1rem;
      margin-bottom: 1.5rem;
    }

    .p-tab {
      padding: 1rem 1.5rem;
      color: #6c757d;
      font-weight: 500;
      border: none;
      background: transparent;

      &:hover {
        color: #4caf50;
        background: #f8f9fa;
      }

      &.p-tab-active {
        color: #4caf50;
        border-bottom: 2px solid #4caf50;
      }
    }
  }
}
  `]
})
export class AttendanceManagement implements OnInit {
  private attendanceService = inject(AttendanceService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Dados
  pendingJustifications: AbsenceDTO[] = [];
  absencesHistory: AbsenceDTO[] = [];
  users: UserDTO[] = [];
  activeUsers: UserDTO[] = [];

  loading = false;
  loadingHistory = false;
  loadingUsers = false;

  // Filtros
  selectedUserId: string | null = null;

  // Dialogs
  showRegisterDialog = false;
  showRejectDialog = false;
  showDetailsDialog = false;

  selectedAbsence: AbsenceDTO | null = null;
  rejectReason = '';

  // Formulário de registro de faltas
  absenceForm = {
    date: null as Date | null,
    userIds: [] as string[]
  };

  // Tab ativa
  activeTab = 0;

  ngOnInit() {
    this.loadUsers();
    this.loadPendingJustifications();
    this.loadAbsencesHistory();
  }

  loadUsers() {
    this.loadingUsers = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Todos os usuários:', users);
        this.users = users.filter(u => u.type !== 'ADMIN');
        console.log('Usuários não-admin:', this.users);

        // Inclui comerciantes APPROVED e ACTIVE para registro de faltas
        this.activeUsers = users.filter(u =>
          u.type !== 'ADMIN' &&
          (u.documentsStatus === 'ACTIVE' || u.documentsStatus === 'APPROVED')
        );
        console.log('Comerciantes aprovados/ativos:', this.activeUsers);

        if (this.activeUsers.length === 0) {
          console.warn('Nenhum comerciante aprovado/ativo encontrado!');
          this.messageService.add({
            severity: 'warn',
            summary: 'Atenção',
            detail: 'Nenhum comerciante aprovado ou ativo encontrado. Verifique o cadastro de usuários.'
          });
        }
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

  loadPendingJustifications() {
    this.loading = true;
    this.attendanceService.getPendingJustifications().subscribe({
      next: (absences) => {
        this.pendingJustifications = absences;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar justificativas:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as justificativas'
        });
        this.loading = false;
      }
    });
  }

  loadAbsencesHistory() {
    this.loadingHistory = true;

    if (this.selectedUserId) {
      this.attendanceService.getUserAbsences(this.selectedUserId).subscribe({
        next: (absences) => {
          this.absencesHistory = absences;
          this.loadingHistory = false;
        },
        error: (error) => {
          console.error('Erro ao carregar histórico:', error);
          this.loadingHistory = false;
        }
      });
    } else {
      // Carrega todas as faltas
      this.attendanceService.getAllAbsences().subscribe({
        next: (absences) => {
          this.absencesHistory = absences;
          this.loadingHistory = false;
        },
        error: (error) => {
          console.error('Erro ao carregar histórico:', error);
          this.loadingHistory = false;
        }
      });
    }
  }

  openRegisterAbsencesDialog() {
    this.absenceForm = {
      date: null,
      userIds: []
    };
    this.showRegisterDialog = true;
  }

  registerAbsences() {
    if (!this.absenceForm.date || this.absenceForm.userIds.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos'
      });
      return;
    }

    const dateStr = this.formatDateISO(this.absenceForm.date);
    const request: RegisterAbsencesRequest = {
      date: dateStr,
      userIds: this.absenceForm.userIds
    };

    this.attendanceService.registerAbsences(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `${this.absenceForm.userIds.length} falta(s) registrada(s) com sucesso`
        });
        this.showRegisterDialog = false;
        this.loadAbsencesHistory();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Não foi possível registrar as faltas'
        });
      }
    });
  }

  reviewJustification(absence: AbsenceDTO, approve: boolean) {
    const action = approve ? 'aprovar' : 'reprovar';

    this.confirmationService.confirm({
      message: `Tem certeza que deseja ${action} esta justificativa?`,
      header: `Confirmar ${approve ? 'Aprovação' : 'Reprovação'}`,
      icon: approve ? 'pi pi-check-circle' : 'pi pi-times-circle',
      acceptButtonStyleClass: approve ? 'p-button-success' : 'p-button-danger',
      accept: () => {
        if (!absence.justification) return;

        const request: ReviewJustificationRequest = {
          isApproved: approve,
          reason: this.rejectReason || undefined
        };

        this.attendanceService.reviewJustification(
          absence.justification.id,
          request
        ).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Justificativa ${approve ? 'aprovada' : 'reprovada'} com sucesso`
            });
            this.loadPendingJustifications();
            this.loadAbsencesHistory();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível processar a justificativa'
            });
          }
        });
      }
    });
  }

  openRejectDialog(absence: AbsenceDTO) {
    this.selectedAbsence = absence;
    this.rejectReason = '';
    this.showRejectDialog = true;
  }

  confirmReject() {
    if (!this.selectedAbsence?.justification) return;

    const request: ReviewJustificationRequest = {
      isApproved: false,
      reason: this.rejectReason || undefined
    };

    this.attendanceService.reviewJustification(
      this.selectedAbsence.justification.id,
      request
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Justificativa reprovada'
        });
        this.showRejectDialog = false;
        this.loadPendingJustifications();
        this.loadAbsencesHistory();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível reprovar a justificativa'
        });
      }
    });
  }

  viewAbsenceDetails(absence: AbsenceDTO) {
    this.selectedAbsence = absence;
    this.showDetailsDialog = true;
  }

  downloadAnnex(justificationId: string) {
    this.attendanceService.downloadJustificationAnnex(justificationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `anexo-${justificationId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível baixar o anexo'
        });
      }
    });
  }

  // Helpers
  getUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user?.name || 'Usuário desconhecido';
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR');
  }

  formatDateISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTypeLabel(type: string): string {
    return type === 'NOTIFIED' ? 'Avisada' : 'Registrada';
  }

  getTypeSeverity(type: string): string {
    return type === 'NOTIFIED' ? 'info' : 'warning';
  }

  getStatusLabel(isAccepted?: boolean, isApproved?: boolean | null): string {
    if (isAccepted === true) return 'Justificada';
    if (isApproved === null) return 'Pendente';
    if (isApproved === false) return 'Reprovada';
    return 'Não Justificada';
  }

  getStatusSeverity(isAccepted?: boolean, isApproved?: boolean | null): string {
    if (isAccepted === true) return 'success';
    if (isApproved === null) return 'warning';
    if (isApproved === false) return 'danger';
    return 'secondary';
  }
}
