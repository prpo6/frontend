import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaniService, Clan, Posta } from './clani.service';

@Component({
  selector: 'app-clani',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clani.component.html',
  styleUrls: ['./clani.component.css']
})
export class ClaniComponent implements OnInit {
  clani: Clan[] = [];
  poste: Posta[] = [];
  editingClan: Clan | null = null;
  newClan: Clan = this.createEmptyClan();
  showAddForm = false;
  showAddPostaForm = false;
  newPosta: Posta = { postnaSt: 0, kraj: '' };
  loading = true;

  constructor(private claniService: ClaniService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadClani();
    this.loadPoste();
  }

  loadClani() {
    this.loading = true;
    this.cdr.detectChanges();
    this.claniService.getAllClani().subscribe({
      next: (data) => {
        console.log('Loaded clani:', data);
        this.clani = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Napaka pri nalaganju članov:', error);
        this.loading = false;
        this.cdr.detectChanges();
        alert('Napaka pri nalaganju podatkov. Preverite, ali je backend zagnan.');
      }
    });
  }

  loadPoste() {
    this.claniService.getAllPoste().subscribe({
      next: (data) => {
        this.poste = data.sort((a, b) => a.postnaSt - b.postnaSt);
      },
      error: (error) => {
        console.error('Napaka pri nalaganju pošt:', error);
      }
    });
  }

  createEmptyClan(): Clan {
    return {
      id: '',
      ime: '',
      priimek: '',
      datumRojstva: '',
      handicap: 0,
      naslov: '',
      postaId: undefined,
      clanOd: '',
      potekClanstva: ''
    };
  }

  startEdit(clan: Clan) {
    this.editingClan = { ...clan };
  }

  cancelEdit() {
    this.editingClan = null;
  }

  saveEdit() {
    if (this.editingClan && this.editingClan.id) {
      this.claniService.updateClan(this.editingClan.id, this.editingClan).subscribe({
        next: (updated) => {
          this.editingClan = null;
          this.loadClani();
        },
        error: (error) => {
          console.error('Napaka pri posodabljanju člana:', error);
          alert('Napaka pri shranjevanju sprememb.');
        }
      });
    }
  }

  deleteClan(id: string) {
    if (confirm('Ali ste prepričani, da želite izbrisati tega člana?')) {
      this.claniService.deleteClan(id).subscribe({
        next: () => {
          this.loadClani();
        },
        error: (error) => {
          console.error('Napaka pri brisanju člana:', error);
          alert('Napaka pri brisanju člana.');
        }
      });
    }
  }

  showAddFormToggle() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.newClan = this.createEmptyClan();
    }
  }

  addClan() {
    if (this.newClan.ime && this.newClan.priimek) {
      this.claniService.createClan(this.newClan).subscribe({
        next: (created) => {
          this.newClan = this.createEmptyClan();
          this.showAddForm = false;
          this.loadClani();
        },
        error: (error) => {
          console.error('Napaka pri dodajanju člana:', error);
          alert('Napaka pri dodajanju novega člana.');
        }
      });
    }
  }

  cancelAdd() {
    this.showAddForm = false;
    this.newClan = this.createEmptyClan();
  }

  toggleAddPostaForm() {
    this.showAddPostaForm = !this.showAddPostaForm;
    if (this.showAddPostaForm) {
      this.newPosta = { postnaSt: 0, kraj: '' };
    }
  }

  addPosta() {
    if (this.newPosta.postnaSt && this.newPosta.kraj) {
      this.claniService.createPosta(this.newPosta).subscribe({
        next: (created) => {
          this.poste.push(created);
          this.showAddPostaForm = false;
          this.newPosta = { postnaSt: 0, kraj: '' };
          alert('Pošta uspešno dodana!');
        },
        error: (error) => {
          console.error('Napaka pri dodajanju pošte:', error);
          alert('Napaka pri dodajanju pošte.');
        }
      });
    }
  }

  cancelAddPosta() {
    this.showAddPostaForm = false;
    this.newPosta = { postnaSt: 0, kraj: '' };
  }

  getPostaDisplay(postaId?: number): string {
    if (!postaId) return '';
    const posta = this.poste.find(p => p.id === postaId);
    return posta ? `${posta.postnaSt} ${posta.kraj}` : '';
  }
}
