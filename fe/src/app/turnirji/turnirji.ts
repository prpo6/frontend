import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TurnirjiService, Turnir, CreateTurnirRequest } from './turnirji.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  viewMode: 'list' | 'scores' | 'bracket' = 'list';
  
  // Score entry for leaderboard tournaments
  participants: any[] = [];
  currentRound = 1;
  showScoreEntryForm = false;
  selectedParticipant: any = null;
  bulkScores: (number | null)[] = Array(18).fill(null);

  // Bracket tournament
  bracketData: any = null;
  selectedMatch: any = null;
  showMatchResultForm = false;

  // Winner names cache
  winnerNames: Map<string, string> = new Map();

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
    this.router.navigate(['/admin']);
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
        this.loadWinnerNames();
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

  openScoreEntry(turnir: Turnir) {
    this.selectedTurnir = turnir;
    if (turnir.tipTurnirja === 'leaderboard') {
      this.viewMode = 'scores';
      this.loadLeaderboard();
    } else {
      this.viewMode = 'bracket';
      this.loadBracket();
    }
  }

  backToList() {
    this.viewMode = 'list';
    this.selectedTurnir = null;
    this.participants = [];
    this.bracketData = null;
  }

  // Leaderboard (Stroke Play) Methods
  loadLeaderboard() {
    if (!this.selectedTurnir?.id) return;
    
    const turnirId = this.selectedTurnir.id;
    this.loading = true;
    
    // First, get all registered participants
    this.turnirjiService.getParticipants(turnirId).subscribe({
      next: (participants) => {
        // Then get the leaderboard scores
        this.turnirjiService.getLeaderboard(turnirId).subscribe({
          next: (leaderboard) => {
            // Merge participants with their scores
            this.participants = participants.map((participant: any) => {
              const scoreEntry = leaderboard.find((l: any) => l.clanId === participant.clanId);
              return {
                ...participant,
                skupniRezultat: scoreEntry?.skupniRezultat || null,
                pozicija: scoreEntry?.pozicija || null
              };
            });
            
            this.loadClanDataForParticipants();
          },
          error: (error) => {
            console.error('Napaka pri nalaganju rezultatov:', error);
            // Still show participants even if no scores yet
            this.participants = participants;
            this.loadClanDataForParticipants();
          }
        });
      },
      error: (error) => {
        console.error('Napaka pri nalaganju udeležencev:', error);
        alert('Napaka pri nalaganju udeležencev');
        this.loading = false;
      }
    });
  }

  loadClanDataForParticipants() {
    const uniqueClanIds = [...new Set(this.participants.map(p => p.clanId))];
    
    if (uniqueClanIds.length === 0) {
      this.loading = false;
      return;
    }
    
    const clanRequests = uniqueClanIds.map(id => 
      this.turnirjiService.getClan(id).pipe(
        catchError(error => {
          console.warn(`Failed to load clan ${id}:`, error);
          return of(null);
        })
      )
    );
    
    forkJoin(clanRequests).subscribe({
      next: (clani) => {
        const clanMap = new Map<string, any>();
        
        clani.forEach((clan) => {
          if (clan) {
            clanMap.set(clan.id, clan);
          }
        });
        
        this.participants = this.participants.map(p => ({
          ...p,
          ime: clanMap.get(p.clanId)?.ime || 'N/A',
          priimek: clanMap.get(p.clanId)?.priimek || ''
        }));
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading clan data:', error);
        this.loading = false;
      }
    });
  }

  openParticipantScoreForm(participant: any) {
    this.selectedParticipant = participant;
    this.showScoreEntryForm = true;
    this.bulkScores = Array(18).fill(null);
  }

  closeScoreEntryForm() {
    this.showScoreEntryForm = false;
    this.selectedParticipant = null;
    this.bulkScores = Array(18).fill(null);
  }

  submitBulkScores() {
    if (!this.selectedParticipant || !this.selectedTurnir) {
      alert('Napaka: manjkajo podatki');
      return;
    }

    const nonEmptyScores = this.bulkScores.filter(s => s !== null && s !== undefined);
    if (nonEmptyScores.length === 0) {
      alert('Prosimo vnesite vsaj en rezultat');
      return;
    }

    this.loading = true;

    // First create the game
    const igraData = {
      rezervacijaId: null,
      clanId: this.selectedParticipant.clanId
    };

    this.turnirjiService.createIgra(igraData).subscribe({
      next: (createdIgra) => {
        // Now submit all non-empty scores
        const scoreRequests = this.bulkScores
          .map((rezultat, index) => {
            if (rezultat !== null && rezultat !== undefined) {
              return this.turnirjiService.addRezultat({
                igraId: createdIgra.id,
                luknja: index + 1,
                rezultat: rezultat
              }).pipe(
                catchError(error => {
                  console.warn(`Failed to add score for hole ${index + 1}:`, error);
                  return of(null);
                })
              );
            }
            return of(null);
          })
          .filter(req => req !== of(null));

        if (scoreRequests.length === 0) {
          this.loading = false;
          alert('Ni rezultatov za vnos');
          return;
        }

        // Submit all scores at once
        forkJoin(scoreRequests).subscribe({
          next: () => {
            // Now link the game to the tournament leaderboard
            const tournamentScoreRequest = {
              clanId: this.selectedParticipant.clanId,
              igraId: createdIgra.id,
              runda: this.currentRound
            };

            this.turnirjiService.enterTournamentScore(this.selectedTurnir!.id!, tournamentScoreRequest).subscribe({
              next: () => {
                this.loading = false;
                this.cdr.detectChanges();
                alert('Rezultati uspešno vnešeni!');
                this.closeScoreEntryForm();
                this.loadLeaderboard();
              },
              error: (error) => {
                this.loading = false;
                this.cdr.detectChanges();
                console.error('Napaka pri povezovanju z turnirjem:', error);
                alert('Igra ustvarjena, vendar napaka pri povezovanju z turnirjem');
                this.closeScoreEntryForm();
              }
            });
          },
          error: (error) => {
            this.loading = false;
            this.cdr.detectChanges();
            console.error('Napaka pri dodajanju rezultatov:', error);
            alert('Napaka pri dodajanju rezultatov');
          }
        });
      },
      error: (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Napaka pri ustvarjanju igre:', error);
        alert('Napaka pri ustvarjanju igre');
      }
    });
  }

  completeRound() {
    if (!this.selectedTurnir?.steviloRund) return;
    
    if (this.currentRound < this.selectedTurnir.steviloRund) {
      if (confirm(`Zaključiti rundo ${this.currentRound} in nadaljevati na rundo ${this.currentRound + 1}?`)) {
        this.currentRound++;
        this.loadLeaderboard();
      }
    } else {
      this.finalizeTournament();
    }
  }

  finalizeTournament() {
    if (!this.selectedTurnir?.id || this.participants.length === 0) return;

    // Winner is the participant with lowest total score
    const sortedParticipants = [...this.participants].sort((a, b) => 
      (a.skupniRezultat || 999) - (b.skupniRezultat || 999)
    );
    
    const winner = sortedParticipants[0];
    
    if (confirm(`Zmagovalec je ${winner.ime} ${winner.priimek} z rezultatom ${winner.skupniRezultat}. Zaključiti turnir?`)) {
      this.turnirjiService.completeTournamentWithWinner(this.selectedTurnir.id, winner.clanId).subscribe({
        next: () => {
          alert('Turnir uspešno zaključen!');
          this.backToList();
          this.loadTurnirji();
        },
        error: (error) => {
          console.error('Napaka pri zaključevanju turnirja:', error);
          alert('Napaka pri zaključevanju turnirja');
        }
      });
    }
  }

  // Bracket (Match Play) Methods
  loadBracket() {
    if (!this.selectedTurnir?.id) return;
    
    this.loading = true;
    this.turnirjiService.getBracket(this.selectedTurnir.id).subscribe({
      next: (data) => {
        this.bracketData = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Napaka pri nalaganju parov:', error);
        alert('Napaka pri nalaganju parov');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getFinalMatchWinner(): string | null {
    if (!this.bracketData?.rounds) return null;
    
    // Find the last round (highest runda number)
    const lastRound = this.bracketData.rounds.reduce((max: any, round: any) => 
      round.runda > max.runda ? round : max, this.bracketData.rounds[0]);
    
    // Check if the final match has a winner
    if (lastRound?.tekme?.length > 0) {
      const finalMatch = lastRound.tekme[0];
      return finalMatch.zmagovalecId || null;
    }
    
    return null;
  }

  confirmTournamentWinner() {
    const winnerId = this.getFinalMatchWinner();
    if (!winnerId || !this.selectedTurnir?.id) return;

    if (!confirm('Ali ste prepričani, da želite potrditi zmagovalca turnirja?')) {
      return;
    }

    this.turnirjiService.completeTournament(this.selectedTurnir.id, winnerId).subscribe({
      next: () => {
        alert('Zmagovalec turnirja uspešno potrjen!');
        this.loadTurnirji();
        this.backToList();
      },
      error: (error) => {
        console.error('Napaka pri potrjevanju zmagovalca:', error);
        alert('Napaka pri potrjevanju zmagovalca');
      }
    });
  }

  loadWinnerNames() {
    // Get all unique winner IDs from completed tournaments
    const winnerIds = this.turnirji
      .filter(t => t.status === 'completed' && t.zmagovalecId)
      .map(t => t.zmagovalecId)
      .filter((id, index, self) => id && self.indexOf(id) === index); // unique IDs

    // Fetch names for all winners
    winnerIds.forEach(winnerId => {
      if (winnerId) {
        this.turnirjiService.getClan(winnerId).subscribe({
          next: (clan) => {
            this.winnerNames.set(winnerId, `${clan.ime} ${clan.priimek}`);
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error(`Napaka pri nalaganju zmagovalca ${winnerId}:`, error);
          }
        });
      }
    });
  }

  getWinnerName(clanId: string): string {
    return this.winnerNames.get(clanId) || 'Nalaganje...';
  }

  openMatchResultForm(match: any) {
    this.selectedMatch = match;
    this.showMatchResultForm = true;
  }

  closeMatchResultForm() {
    this.showMatchResultForm = false;
    this.selectedMatch = null;
  }

  selectWinner(winnerId: string) {
    if (!this.selectedMatch) return;

    if (confirm('Ali ste prepričani, da želite izbrati tega zmagovalca?')) {
      const request = {
        tekmaId: this.selectedMatch.id,
        zmagovalecId: winnerId,
        rezultat1: winnerId === this.selectedMatch.clan1Id ? 1 : 0,
        rezultat2: winnerId === this.selectedMatch.clan2Id ? 1 : 0
      };

      this.turnirjiService.updateMatchResult(request).subscribe({
        next: () => {
          alert('Zmagovalec vnesen!');
          this.closeMatchResultForm();
          this.loadBracket();
          this.checkBracketCompletion();
        },
        error: (error) => {
          console.error('Napaka pri vnosu zmagovalca:', error);
          alert('Napaka pri vnosu zmagovalca');
        }
      });
    }
  }

  checkBracketCompletion() {
    // Check if only one player remains (final round completed)
    if (this.bracketData && this.bracketData.rounds && this.bracketData.rounds.length > 0) {
      const finalRound = this.bracketData.rounds[this.bracketData.rounds.length - 1];
      if (finalRound.matches && finalRound.matches.length === 1) {
        const finalMatch = finalRound.matches[0];
        if (finalMatch.zmagovalecId && this.selectedTurnir?.id) {
          if (confirm('Turnir je končan. Zaključiti turnir?')) {
            this.turnirjiService.completeTournamentWithWinner(this.selectedTurnir.id, finalMatch.zmagovalecId).subscribe({
              next: () => {
                alert('Turnir uspešno zaključen!');
                this.backToList();
                this.loadTurnirji();
              },
              error: (error) => {
                console.error('Napaka pri zaključevanju turnirja:', error);
                alert('Napaka pri zaključevanju turnirja');
              }
            });
          }
        }
      }
    }
  }
}
