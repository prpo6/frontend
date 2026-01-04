import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Clan {
  id: string;
  ime: string;
  priimek: string;
  datumRojstva?: string;
  handicap?: number;
  naslov?: string;
  postaId?: number;
  clanOd?: string;
  potekClanstva?: string;
}

@Component({
  selector: 'app-clani',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clani.component.html',
  styleUrls: ['./clani.component.css']
})
export class ClaniComponent {
  clani: Clan[] = [
    {
      id: '1',
      ime: 'Janez',
      priimek: 'Novak',
      datumRojstva: '1985-03-15',
      handicap: 18.5,
      naslov: 'Prešernova 10',
      postaId: 1000,
      clanOd: '2020-01-15',
      potekClanstva: '2025-01-15'
    },
    {
      id: '2',
      ime: 'Marija',
      priimek: 'Kovač',
      datumRojstva: '1990-07-22',
      handicap: 12.3,
      naslov: 'Cankarjeva 5',
      postaId: 1000,
      clanOd: '2019-05-10',
      potekClanstva: '2024-05-10'
    },
    {
      id: '3',
      ime: 'Peter',
      priimek: 'Horvat',
      datumRojstva: '1978-11-30',
      handicap: 24.8,
      naslov: 'Vodnikova 8',
      postaId: 2000,
      clanOd: '2021-03-20',
      potekClanstva: '2026-03-20'
    }
  ];

  editingClan: Clan | null = null;
  newClan: Clan = this.createEmptyClan();
  showAddForm = false;

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
    if (this.editingClan) {
      const index = this.clani.findIndex(c => c.id === this.editingClan!.id);
      if (index !== -1) {
        this.clani[index] = { ...this.editingClan };
      }
      this.editingClan = null;
    }
  }

  deleteClan(id: string) {
    if (confirm('Ali ste prepričani, da želite izbrisati tega člana?')) {
      this.clani = this.clani.filter(c => c.id !== id);
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
      const newId = (Math.max(...this.clani.map(c => parseInt(c.id))) + 1).toString();
      this.clani.push({ ...this.newClan, id: newId });
      this.newClan = this.createEmptyClan();
      this.showAddForm = false;
    }
  }

  cancelAdd() {
    this.showAddForm = false;
    this.newClan = this.createEmptyClan();
  }
}
