// src/app/features/admin/fairs/fairs-list/fairs-list.ts
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
import { TextareaModule } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FairService, FairDTO, AttractionDTO } from '../../../../core/services/fair/fair';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface ArtistDTO {
  id: string;
  name: string;
  genre?: string;
  hasBanner: boolean;
}

@Component({
  selector: 'app-fairs-list',
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
    TextareaModule,
    TabsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './fairs-list.html',
  styleUrls: ['./fairs-list.scss']
})
export class FairsList implements OnInit {
  private fairService = inject(FairService);
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // Dados
  fairs: FairDTO[] = [];
  filteredFairs: FairDTO[] = [];
  artists: ArtistDTO[] = [];
  attractions: AttractionDTO[] = [];

  loading = false;
  loadingAttractions = false;

  // Filtros
  searchTerm = '';
  selectedStatus: string | null = null;

  // Dialogs
  showFairDialog = false;
  showAttractionDialog = false;
  showArtistDialog = false;
  isEditMode = false;

  selectedFair: FairDTO | null = null;
  selectedAttraction: AttractionDTO | null = null;

  // Formulários
  fairForm = {
    date: null as Date | null,
    startTime: '',
    endTime: '',
    notes: '',
    status: 'scheduled' as 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
  };

  attractionForm = {
    artistId: null as string | null,
    fairId: null as string | null,
    timeStart: '',
    timeEnd: ''
  };

  artistForm = {
    name: '',
    genre: ''
  };

  // Opções
  statusOptions = [
    { label: 'Agendada', value: 'scheduled' },
    { label: 'Confirmada', value: 'confirmed' },
    { label: 'Cancelada', value: 'cancelled' },
    { label: 'Concluída', value: 'completed' }
  ];

  // Tab ativa
  activeTab = 0;

  ngOnInit() {
    this.loadFairs();
    this.loadArtists();
  }

  // ========== FEIRAS ==========

  loadFairs() {
    this.loading = true;
    this.fairService.getAllFairs().subscribe({
      next: (fairs: any[]) => {
        this.fairs = fairs.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.filteredFairs = this.fairs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar feiras:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as feiras'
        });
        this.loading = false;
      }
    });
  }

  openNewFairDialog() {
    this.isEditMode = false;
    this.selectedFair = null;
    this.fairForm = {
      date: null,
      startTime: '08:00',
      endTime: '14:00',
      notes: '',
      status: 'scheduled'
    };
    this.showFairDialog = true;
  }

  openEditFairDialog(fair: FairDTO) {
    this.isEditMode = true;
    this.selectedFair = fair;
    this.fairForm = {
      date: new Date(fair.date),
      startTime: fair.startTime,
      endTime: fair.endTime,
      notes: fair.notes || '',
      status: fair.status
    };
    this.showFairDialog = true;
  }

  saveFair() {
    if (!this.fairForm.date || !this.fairForm.startTime || !this.fairForm.endTime) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios'
      });
      return;
    }

    const fairData = {
      date: this.formatDate(this.fairForm.date),
      startTime: this.fairForm.startTime,
      endTime: this.fairForm.endTime,
      notes: this.fairForm.notes,
      status: this.fairForm.status
    };

    if (this.isEditMode && this.selectedFair) {
      this.fairService.updateFair(this.selectedFair.id, fairData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Feira atualizada com sucesso'
          });
          this.showFairDialog = false;
          this.loadFairs();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Não foi possível atualizar a feira'
          });
        }
      });
    } else {
      this.fairService.createFair(fairData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Feira criada com sucesso'
          });
          this.showFairDialog = false;
          this.loadFairs();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: error.error?.message || 'Não foi possível criar a feira'
          });
        }
      });
    }
  }

  deleteFair(fair: FairDTO) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a feira de ${this.formatDateBR(fair.date)}?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.fairService.deleteFair(fair.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Feira excluída com sucesso'
            });
            this.loadFairs();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: error.error?.message || 'Não foi possível excluir a feira'
            });
          }
        });
      }
    });
  }

  // ========== ATRAÇÕES ==========

  loadAttractions(fair: FairDTO) {
    this.selectedFair = fair;
    this.loadingAttractions = true;

    this.fairService.getFairAttractions(fair.id).subscribe({
      next: (attractions: AttractionDTO[]) => {
        this.attractions = attractions;
        this.loadingAttractions = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar atrações:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as atrações'
        });
        this.loadingAttractions = false;
      }
    });
  }

  openNewAttractionDialog(fair: FairDTO) {
    this.selectedFair = fair;
    this.selectedAttraction = null;
    this.attractionForm = {
      artistId: null,
      fairId: fair.id,
      timeStart: '10:00',
      timeEnd: '12:00'
    };
    this.showAttractionDialog = true;
  }

  openEditAttractionDialog(attraction: AttractionDTO) {
    this.selectedAttraction = attraction;
    this.attractionForm = {
      artistId: attraction.artist.id,
      fairId: attraction.fair.id,
      timeStart: attraction.timeStart,
      timeEnd: attraction.timeEnd
    };
    this.showAttractionDialog = true;
  }

  saveAttraction() {
    if (!this.attractionForm.artistId || !this.attractionForm.fairId ||
        !this.attractionForm.timeStart || !this.attractionForm.timeEnd) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos'
      });
      return;
    }

    const attractionData = {
      artistId: this.attractionForm.artistId,
      fairId: this.attractionForm.fairId,
      timeStart: this.attractionForm.timeStart,
      timeEnd: this.attractionForm.timeEnd
    };

    const endpoint = this.selectedAttraction
      ? `${environment.apiUrl}/attractions/${this.selectedAttraction.id}`
      : `${environment.apiUrl}/attractions`;

    const method = this.selectedAttraction ? 'put' : 'post';

    this.http[method](endpoint, attractionData, { withCredentials: true }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Atração ${this.selectedAttraction ? 'atualizada' : 'criada'} com sucesso`
        });
        this.showAttractionDialog = false;
        if (this.selectedFair) {
          this.loadAttractions(this.selectedFair);
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Não foi possível salvar a atração'
        });
      }
    });
  }

  deleteAttraction(attraction: AttractionDTO) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir a apresentação de ${attraction.artist.name}?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.http.delete(`${environment.apiUrl}/attractions/${attraction.id}`, {
          withCredentials: true
        }).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Atração excluída com sucesso'
            });
            if (this.selectedFair) {
              this.loadAttractions(this.selectedFair);
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível excluir a atração'
            });
          }
        });
      }
    });
  }

  // ========== ARTISTAS ==========

  loadArtists() {
    this.http.get<ArtistDTO[]>(`${environment.apiUrl}/artists`, {
      withCredentials: true
    }).subscribe({
      next: (artists) => {
        this.artists = artists;
      },
      error: (error) => {
        console.error('Erro ao carregar artistas:', error);
      }
    });
  }

  openNewArtistDialog() {
    this.artistForm = {
      name: '',
      genre: ''
    };
    this.showArtistDialog = true;
  }

  saveArtist() {
    if (!this.artistForm.name) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Nome do artista é obrigatório'
      });
      return;
    }

    const formData = new FormData();
    formData.append('name', this.artistForm.name);
    formData.append('genre', this.artistForm.genre);

    this.http.post(`${environment.apiUrl}/artists`, formData, {
      withCredentials: true
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Artista criado com sucesso'
        });
        this.showArtistDialog = false;
        this.loadArtists();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível criar o artista'
        });
      }
    });
  }

  // ========== FILTROS ==========

  applyFilters() {
    this.filteredFairs = this.fairs.filter(fair => {
      const matchesSearch = !this.searchTerm ||
        fair.notes?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.formatDateBR(fair.date).includes(this.searchTerm);

      const matchesStatus = !this.selectedStatus ||
        fair.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.applyFilters();
  }

  // ========== HELPERS ==========

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateBR(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  }

  getStatusBadge(status: string): { severity: string; label: string } {
    const badges: any = {
      'scheduled': { severity: 'info', label: 'Agendada' },
      'confirmed': { severity: 'success', label: 'Confirmada' },
      'cancelled': { severity: 'danger', label: 'Cancelada' },
      'completed': { severity: 'secondary', label: 'Concluída' }
    };
    return badges[status] || { severity: 'info', label: status };
  }

  getStatusLabel(status: string): string {
    return this.getStatusBadge(status).label;
  }
}
