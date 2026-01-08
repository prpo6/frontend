import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TurnirjiService, Turnir, CreateTurnirRequest } from './turnirji.service';

@Component({
  selector: 'app-turnirji',
  imports: [CommonModule, FormsModule],
  templateUrl: './turnirji.html',
  styleUrl: './turnirji.css'
})
export class TurnirjiComponent implements OnInit {
  turnirji: Turnir[] = [];
  loading = true;
  showAddForm = false;
  editMode = false;
  selectedTurnir: Turnir | null = null;

  newTurnir: CreateTurnirRequest = {
    naziv: '',
    opis: '',
    datumZacetek: '',
    datumKonec: '',
    tipTurnirja: 'leaderboard',
    maxIgralcev: 16,
    steviloRund: 1,
    skupinaStart: 1,
    skupinaEnd: 10
  };

  // Temporary admin ID - in real app this would come from auth service
  adminClanId = '07d557fe-264d-4eb1-9447-b478d2fa4080'; // Replace with actual logged-in user

  constructor(
    private turnirjiService: TurnirjiService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  navigateToHome() {
    this.router.navigate(['/']);
  }

  ngOnInit() {
    this.loadTurnirji();
  }

  loadTurnirji() {
    this.loading = true;
    this.turnirjiService.getAllTurnirji().subscribe({
      next: (data) => {
        this.turnirji = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Napaka pri nalaganju turnirjev:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    this.editMode = false;
    this.selectedTurnir = null;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.newTurnir = {
      naziv: '',
      opis: '',
      datumZacetek: '',
      datumKonec: '',
      tipTurnirja: 'leaderboard',
      maxIgralcev: 16,
      steviloRund: 1,
      skupinaStart: 1,
      skupinaEnd: 10
    };
  }

  addTurnir() {
    if (!this.newTurnir.naziv || !this.newTurnir.datumZacetek) {
      alert('Prosimo izpolnite obvezna polja');
      return;
    }

    this.turnirjiService.createTurnir(this.newTurnir, this.adminClanId).subscribe({
      next: () => {
        this.loadTurnirji();
        this.showAddForm = false;
        this.resetForm();
      },
      error: (error) => {
        console.error('Napaka pri dodajanju turnirja:', error);
        alert('Napaka pri dodajanju turnirja');
      }
    });
  }

  editTurnir(turnir: Turnir) {
    this.selectedTurnir = turnir;
    this.editMode = true;
    this.showAddForm = true;
    this.newTurnir = {
      naziv: turnir.naziv,
      opis: turnir.opis || '',
      datumZacetek: turnir.datumZacetek,
      datumKonec: turnir.datumKonec || '',
      tipTurnirja: turnir.tipTurnirja,
      maxIgralcev: turnir.maxIgralcev,
      steviloRund: turnir.steviloRund,
      skupinaStart: turnir.skupinaStart,
      skupinaEnd: turnir.skupinaEnd
    };
  }

  saveEdit() {
    if (!this.selectedTurnir) return;

    this.turnirjiService.updateTurnir(this.selectedTurnir.id!, this.newTurnir).subscribe({
      next: () => {
        this.loadTurnirji();
        this.showAddForm = false;
        this.editMode = false;
        this.selectedTurnir = null;
        this.resetForm();
      },
      error: (error) => {
        console.error('Napaka pri urejanju turnirja:', error);
        alert('Napaka pri urejanju turnirja');
      }
    });
  }

  deleteTurnir(id: string) {
    if (confirm('Ste prepričani, da želite izbrisati ta turnir?')) {
      this.turnirjiService.deleteTurnir(id).subscribe({
        next: () => {
          this.loadTurnirji();
        },
        error: (error) => {
          console.error('Napaka pri brisanju turnirja:', error);
          alert('Napaka pri brisanju turnirja');
        }
      });
    }
  }

  openRegistration(id: string) {
    this.turnirjiService.openRegistration(id).subscribe({
      next: () => {
        this.loadTurnirji();
      },
      error: (error) => {
        console.error('Napaka pri odpiranju registracije:', error);
        alert('Napaka pri odpiranju registracije');
      }
    });
  }

  startTurnir(id: string) {
    if (confirm('Ali želite začeti ta turnir?')) {
      this.turnirjiService.startTurnir(id).subscribe({
        next: () => {
          this.loadTurnirji();
        },
        error: (error) => {
          console.error('Napaka pri začenjanju turnirja:', error);
          alert('Napaka pri začenjanju turnirja');
        }
      });
    }
  }

  completeTurnir(id: string) {
    if (confirm('Ali želite zaključiti ta turnir?')) {
      this.turnirjiService.completeTurnir(id).subscribe({
        next: () => {
          this.loadTurnirji();
        },
        error: (error) => {
          console.error('Napaka pri zaključevanju turnirja:', error);
          alert('Napaka pri zaključevanju turnirja');
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pending': 'Na čakanju',
      'registration': 'Prijave odprte',
      'active': 'Aktiven',
      'completed': 'Zaključen',
      'cancelled': 'Preklican'
    };
    return statusLabels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getTipLabel(tip: string): string {
    return tip === 'bracket' ? 'Izločilni' : 'Lestvica';
  }
}
