import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Artikel, ShrambaService } from './shramba.service';

@Component({
  selector: 'app-shramba',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shramba.component.html',
  styleUrls: ['./shramba.component.css']
})

export class ShrambaComponent implements OnInit {
  artikli: Artikel[] = [];
  loading = true;

  showAddForm = false;
  newArtikel: Artikel = { imeArtikla: '', kolicina: 0, cenaNajema: 0.0, opis: '' };
  editing: Artikel | null = null;

  constructor(
    private service: ShrambaService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() { this.load(); }

  navigateBack() { this.router.navigate(['/admin']); }

  load() {
    this.loading = true;
    this.cdr.detectChanges();
    this.service.getAll().subscribe({
      next: (data) => {
        this.artikli = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
        alert('Napaka pri nalaganju shrambe. Preveri, če Shramba MS teče in apiUrl je pravilen.');
      }
    });
  }

  toggleAdd() {
    this.showAddForm = !this.showAddForm;
    this.newArtikel = { imeArtikla: '', kolicina: 0, cenaNajema: 0.0, opis: '' };
  }

  add() {
    this.service.create(this.newArtikel).subscribe({
      next: () => { this.showAddForm = false; this.load(); },
      error: (err) => { console.error(err); alert(err.error?.message || 'Napaka pri dodajanju.'); }
    });
  }

  startEdit(a: Artikel) { this.editing = { ...a }; }
  cancelEdit() { this.editing = null; }

  saveEdit() {
    if (!this.editing?.id) return;
    this.service.update(this.editing.id, this.editing).subscribe({
      next: () => { this.editing = null; this.load(); },
      error: (err) => { console.error(err); alert(err.error?.message || 'Napaka pri shranjevanju.'); }
    });
  }

  remove(id?: string) {
    if (!id) return;
    if (!confirm('Izbrišem artikel?')) return;
    this.service.delete(id).subscribe({
      next: () => this.load(),
      error: (err) => { console.error(err); alert(err.error?.message || 'Napaka pri brisanju.'); }
    });
  }
}
