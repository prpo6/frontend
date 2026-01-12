import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ZaposleniService, Zaposleni } from '../zaposleni/zaposleni.service';
import { UrnikService, DayOfWeek, UrnikDto, DelovniDanDto } from './urnik.service';

type DayRow = { key: DayOfWeek; label: string };

function toHHmm(t: string | undefined): string {
  if (!t) return '08:00';
  return t.length >= 5 ? t.slice(0, 5) : t;
}

@Component({
  selector: 'app-urnik',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './urnik.html',
  styleUrls: ['./urnik.css']
})
export class UrnikComponent implements OnInit {

  days: DayRow[] = [
    { key: 'MONDAY', label: 'Ponedeljek' },
    { key: 'TUESDAY', label: 'Torek' },
    { key: 'WEDNESDAY', label: 'Sreda' },
    { key: 'THURSDAY', label: 'Četrtek' },
    { key: 'FRIDAY', label: 'Petek' },
    { key: 'SATURDAY', label: 'Sobota' },
    { key: 'SUNDAY', label: 'Nedelja' }
  ];

  zaposleni: Zaposleni[] = [];
  selectedZaposleniId = '';

  loadingZaposleni = true;
  loadingUrnik = false;

  enabled: Record<DayOfWeek, boolean> = {
    MONDAY: false, TUESDAY: false, WEDNESDAY: false, THURSDAY: false,
    FRIDAY: false, SATURDAY: false, SUNDAY: false
  };

  zacetek: Record<DayOfWeek, string> = {
    MONDAY: '08:00', TUESDAY: '08:00', WEDNESDAY: '08:00', THURSDAY: '08:00',
    FRIDAY: '08:00', SATURDAY: '08:00', SUNDAY: '08:00'
  };

  konec: Record<DayOfWeek, string> = {
    MONDAY: '16:00', TUESDAY: '16:00', WEDNESDAY: '16:00', THURSDAY: '16:00',
    FRIDAY: '16:00', SATURDAY: '16:00', SUNDAY: '16:00'
  };

  constructor(
    private router: Router,
    private zaposleniService: ZaposleniService,
    private urnikService: UrnikService
  ) {}

  ngOnInit() {
    this.loadZaposleni();
  }

  navigateBack() {
    this.router.navigate(['/admin']);
  }

  goBackToOverview() {
    this.router.navigate(['/urnik']);
    }

  loadZaposleni() {
    this.loadingZaposleni = true;
    this.zaposleniService.getAll().subscribe({
      next: (data) => {
        this.zaposleni = data;
        this.loadingZaposleni = false;

        if (!this.selectedZaposleniId && this.zaposleni.length > 0) {
          this.selectedZaposleniId = this.zaposleni[0].id!;
          this.loadUrnik();
        }
      },
      error: (e) => {
        console.error(e);
        this.loadingZaposleni = false;
        alert('Napaka pri nalaganju zaposlenih.');
      }
    });
  }

  onChangeZaposleni() {
    if (!this.selectedZaposleniId) return;
    this.loadUrnik();
  }

  loadUrnik() {
    if (!this.selectedZaposleniId) return;

    this.loadingUrnik = true;

    for (const d of this.days) {
      this.enabled[d.key] = false;
    }

    this.urnikService.getUrnik(this.selectedZaposleniId).subscribe({
      next: (urnik) => {
        this.applyUrnik(urnik);
        this.loadingUrnik = false;
      },
      error: (e) => {
        console.error(e);
        this.loadingUrnik = false;
        alert('Napaka pri nalaganju urnika.');
      }
    });
  }

  private applyUrnik(urnik: UrnikDto) {
    for (const dan of urnik.dnevi || []) {
      const key = dan.danVTednu;
      this.enabled[key] = true;
      this.zacetek[key] = toHHmm(dan.zacetek);
      this.konec[key] = toHHmm(dan.konec);
    }
  }

  saveDay(day: DayOfWeek) {
    if (!this.selectedZaposleniId) return;

    if (!this.enabled[day]) {
      this.deleteDay(day);
      return;
    }

    if (this.konec[day] <= this.zacetek[day]) {
      alert('Konec mora biti po začetku.');
      return;
    }

    const dto: DelovniDanDto = {
      danVTednu: day,
      zacetek: `${this.zacetek[day]}:00`,
      konec: `${this.konec[day]}:00`
    };

    this.urnikService.setDan(this.selectedZaposleniId, day, dto).subscribe({
      next: () => {},
      error: (e) => {
        console.error(e);
        alert('Napaka pri shranjevanju dneva.');
      }
    });
  }

  deleteDay(day: DayOfWeek) {
    if (!this.selectedZaposleniId) return;

    this.urnikService.deleteDan(this.selectedZaposleniId, day).subscribe({
      next: () => {
        this.enabled[day] = false;
      },
      error: (e) => {
        console.error(e);
        alert('Napaka pri brisanju dneva.');
      }
    });
  }

  deleteAll() {
    if (!this.selectedZaposleniId) return;
    if (!confirm('Pobrišem cel urnik?')) return;

    this.urnikService.deleteUrnik(this.selectedZaposleniId).subscribe({
      next: () => this.loadUrnik(),
      error: (e) => {
        console.error(e);
        alert('Napaka pri brisanju urnika.');
      }
    });
  }
}
