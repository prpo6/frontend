import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserTurnirjiService, Turnir } from './user-turnirji.service';
import { AuthService } from '../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-turnirji',
  imports: [CommonModule],
  templateUrl: './user-turnirji.html',
  styleUrl: './user-turnirji.css'
})
export class UserTurnirjiComponent implements OnInit {
  turnirji: Turnir[] = [];
  loading = true;
  currentUserId: string = '';
  userRegistrations = new Map<string, boolean>(); // Track if user is registered for each tournament

  constructor(
    private turnirjiService: UserTurnirjiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    const clanId = localStorage.getItem('clanId');
    if (!clanId) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.currentUserId = clanId;
    this.loadOpenTurnirji();
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  loadOpenTurnirji() {
    this.loading = true;
    this.turnirjiService.getOpenTurnirji().subscribe({
      next: (data) => {
        this.turnirji = data;
        // Check registration status for each tournament
        if (this.turnirji.length > 0) {
          const checks = this.turnirji.map(turnir => 
            this.turnirjiService.getTurnirParticipants(turnir.id!)
          );
          
          forkJoin(checks).subscribe({
            next: (participantLists) => {
              participantLists.forEach((participants, index) => {
                const turnirId = this.turnirji[index].id!;
                const isRegistered = participants.some(p => p.clanId === this.currentUserId);
                this.userRegistrations.set(turnirId, isRegistered);
              });
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: () => {
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Napaka pri nalaganju turnirjev:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  registerForTurnir(turnir: Turnir) {
    if (!turnir.id) return;

    if (confirm(`Ali se želite prijaviti na turnir: ${turnir.naziv}?`)) {
      this.turnirjiService.registerForTurnir(turnir.id, this.currentUserId).subscribe({
        next: () => {
          alert('Uspešno ste se prijavili na turnir!');
          this.loadOpenTurnirji(); // Reload to get updated count
        },
        error: (error) => {
          console.error('Napaka pri prijavi na turnir:', error);
          if (error.error && typeof error.error === 'string') {
            alert(error.error);
          } else if (error.error?.message) {
            alert(error.error.message);
          } else {
            alert('Napaka pri prijavi na turnir. Morda ste že prijavljeni ali je turnir poln.');
          }
        }
      });
    }
  }

  unregisterFromTurnir(turnir: Turnir) {
    if (!turnir.id) return;

    if (confirm(`Ali se želite odjaviti s turnirja: ${turnir.naziv}?`)) {
      this.turnirjiService.unregisterFromTurnir(turnir.id, this.currentUserId).subscribe({
        next: () => {
          alert('Uspešno ste se odjavili s turnirja.');
          this.loadOpenTurnirji(); // Reload to get updated count
        },
        error: (error) => {
          console.error('Napaka pri odjavi s turnirja:', error);
          if (error.error && typeof error.error === 'string') {
            alert(error.error);
          } else if (error.error?.message) {
            alert(error.error.message);
          } else {
            alert('Napaka pri odjavi s turnirja.');
          }
        }
      });
    }
  }

  getTipLabel(tip: string): string {
    switch(tip) {
      case 'leaderboard': return 'Lestvica (Stroke Play)';
      case 'bracket': return 'Izločilni (Match Play)';
      default: return tip;
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'pending': return 'V pripravi';
      case 'registration': return 'Prijave odprte';
      case 'active': return 'V teku';
      case 'completed': return 'Zaključen';
      case 'cancelled': return 'Preklican';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    return status;
  }

  canRegister(turnir: Turnir): boolean {
    return turnir.status === 'registration' && 
           (turnir.trenutnoIgralcev || 0) < turnir.maxIgralcev &&
           !this.isUserRegistered(turnir);
  }

  canUnregister(turnir: Turnir): boolean {
    // Can only unregister if tournament is still in pending or registration status
    return turnir.status === 'pending' || turnir.status === 'registration';
  }

  isUserRegistered(turnir: Turnir): boolean {
    return this.userRegistrations.get(turnir.id!) || false;
  }

  isTurnirFull(turnir: Turnir): boolean {
    return (turnir.trenutnoIgralcev || 0) >= turnir.maxIgralcev;
  }
}
