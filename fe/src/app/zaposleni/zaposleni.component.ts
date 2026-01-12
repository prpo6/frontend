import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Zaposleni, ZaposleniService } from './zaposleni.service';

@Component({
  selector: 'app-zaposleni',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './zaposleni.component.html',
  styleUrls: ['./zaposleni.component.css']
})
export class ZaposleniComponent implements OnInit {
  zaposleni: Zaposleni[] = [];
  loading = true;

  showAddForm = false;
  newZaposleni: Zaposleni = this.emptyZaposleni();
  editing: Zaposleni | null = null;

  constructor(
    private service: ZaposleniService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  navigateBack() {
    this.router.navigate(['/admin']);
  }

  emptyZaposleni(): Zaposleni {
    return {
      ime: '',
      priimek: '',
      email: '',
      telefon: '',
      pozicija: 'Trener',
      status: 'AKTIVEN'
    };
  }

  load() {
    this.loading = true;
    this.cdr.detectChanges();

    this.service.getAll().subscribe({
      next: (data) => {
        this.zaposleni = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
        alert('Napaka pri nalaganju zaposleni, preveri ce tece 8091');
      }
    });
  }

  toggleAdd() {
    this.showAddForm = !this.showAddForm;
    this.newZaposleni = this.emptyZaposleni();
  }

  add() {
    this.service.create(this.newZaposleni).subscribe({
      next: () => {
        this.showAddForm = false;
        this.newZaposleni = this.emptyZaposleni();
        this.load();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Napaka pri dodajanju zaposlenega.');
      }
    });
  }

  startEdit(z: Zaposleni) {
    this.editing = { ...z };
  }

  cancelEdit() {
    this.editing = null;
  }

  saveEdit() {
    if (!this.editing?.id) return;

    this.service.update(this.editing.id, this.editing).subscribe({
      next: () => {
        this.editing = null;
        this.load();
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Napaka pri shranjevanju.');
      }
    });
  }

  remove(id?: string) {
    if (!id) return;
    if (!confirm('Izbrišem zaposlenega?')) return;

    this.service.delete(id).subscribe({
      next: () => this.load(),
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Napaka pri brisanju.');
      }
    });
  }
}
