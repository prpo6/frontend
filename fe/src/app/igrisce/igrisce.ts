import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IgrisceService, Rezervacija, Igra, Rezultat, Clan } from './igrisce.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-igrisce',
  imports: [CommonModule, FormsModule],
  templateUrl: './igrisce.html',
  styleUrl: './igrisce.css'
})
export class IgrisceComponent implements OnInit {
  rezervacije: Rezervacija[] = [];
  igre: Igra[] = [];
  loading = true;
  viewMode: 'calendar' | 'results' = 'calendar';
  
  // Calendar data
  currentDate = new Date(2025, 11, 1); // December 2025
  calendarDays: any[] = [];
  selectedDate: Date | null = null;
  dayRezervacije: Rezervacija[] = [];
  
  // Month/Year selection
  selectedMonth: number = 11; // December (0-indexed)
  selectedYear: number = 2025;
  months = [
    { value: 0, label: 'Januar' },
    { value: 1, label: 'Februar' },
    { value: 2, label: 'Marec' },
    { value: 3, label: 'April' },
    { value: 4, label: 'Maj' },
    { value: 5, label: 'Junij' },
    { value: 6, label: 'Julij' },
    { value: 7, label: 'Avgust' },
    { value: 8, label: 'September' },
    { value: 9, label: 'Oktober' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ];
  years: number[] = [];
  
  // New rezervacija form
  showAddForm = false;
  clanSearchQuery = '';
  searchedClani: Clan[] = [];
  selectedClan: Clan | null = null;
  showClanDropdown = false;
  newRezervacija: Rezervacija = {
    clanId: '',
    skupina: 1,
    datum: '',
    ura: ''
  };

  constructor(
    private igrisceService: IgrisceService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Generate years array (2020 to 2030)
    for (let year = 2020; year <= 2030; year++) {
      this.years.push(year);
    }
    this.selectedMonth = this.currentDate.getMonth();
    this.selectedYear = this.currentDate.getFullYear();
    this.loadMonthData();
    this.generateCalendar();
  }

  loadMonthData() {
    this.loading = true;
    const startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    
    const datumOd = this.formatDate(startDate);
    const datumDo = this.formatDate(endDate);
    
    this.igrisceService.getRezervacijeByDateRange(datumOd, datumDo).subscribe({
      next: (data) => {
        this.rezervacije = data;
        this.loadClanDataForRezervacije();
        this.loading = false;
        this.generateCalendar();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Napaka pri nalaganju rezervacij:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadClanDataForRezervacije() {
    const uniqueClanIds = [...new Set(this.rezervacije.map(r => r.clanId))];
    console.log('Loading clan data for IDs:', uniqueClanIds);
    
    if (uniqueClanIds.length === 0) {
      console.log('No clan IDs to load');
      return;
    }
    
    const clanRequests = uniqueClanIds.map(id => {
      console.log('Fetching clan with ID:', id);
      return this.igrisceService.getClan(id).pipe(
        catchError(error => {
          console.warn(`Failed to load clan ${id}:`, error.status);
          return of(null); // Return null for failed requests
        })
      );
    });
    
    forkJoin(clanRequests).subscribe({
      next: (clani) => {
        console.log('Received clan data:', clani);
        const clanMap = new Map<string, Clan>();
        
        // Filter out null values and map successful clan fetches
        clani.forEach((clan, index) => {
          if (clan) {
            console.log('Mapping clan:', clan.id, clan.ime, clan.priimek);
            clanMap.set(clan.id, clan);
          } else {
            console.warn('Clan data not found for ID:', uniqueClanIds[index]);
          }
        });
        
        this.rezervacije.forEach(rez => {
          rez.clan = clanMap.get(rez.clanId);
          console.log('Reservation clanId:', rez.clanId, 'Mapped clan:', rez.clan);
        });
        
        // Update dayRezervacije if a day is selected
        if (this.selectedDate) {
          const dateStr = this.formatDate(this.selectedDate);
          this.dayRezervacije = this.rezervacije.filter(r => r.datum === dateStr);
          console.log('Updated dayRezervacije:', this.dayRezervacije);
        }
        
        this.generateCalendar();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Napaka pri nalaganju podatkov članov:', error);
        console.error('Full error:', error);
      }
    });
  }

  loadIgre() {
    this.loading = true;
    this.igrisceService.getAllIgre().subscribe({
      next: (data) => {
        this.igre = data;
        this.loadClanDataForIgre();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Napaka pri nalaganju iger:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadClanDataForIgre() {
    const uniqueClanIds = [...new Set(this.igre.map(i => i.clanId))];
    
    if (uniqueClanIds.length === 0) {
      return;
    }
    
    const clanRequests = uniqueClanIds.map(id => 
      this.igrisceService.getClan(id).pipe(
        catchError(error => {
          console.warn(`Failed to load clan ${id} for igre:`, error.status);
          return of(null);
        })
      )
    );
    
    forkJoin(clanRequests).subscribe({
      next: (clani) => {
        const clanMap = new Map<string, Clan>();
        
        clani.forEach((clan, index) => {
          if (clan) {
            clanMap.set(clan.id, clan);
          } else {
            console.warn('Clan data not found for igra ID:', uniqueClanIds[index]);
          }
        });
        
        this.igre.forEach(igra => {
          igra.clan = clanMap.get(igra.clanId);
        });
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Napaka pri nalaganju podatkov članov:', error);
      }
    });
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    this.calendarDays = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      this.calendarDays.push({ day: null, date: null, rezervacije: [] });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = this.formatDate(date);
      const dayRezervacije = this.rezervacije.filter(r => r.datum === dateStr);
      
      this.calendarDays.push({
        day: day,
        date: date,
        dateStr: dateStr,
        rezervacije: dayRezervacije,
        isToday: this.isToday(date)
      });
    }
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.selectedMonth = this.currentDate.getMonth();
    this.selectedYear = this.currentDate.getFullYear();
    this.loadMonthData();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.selectedMonth = this.currentDate.getMonth();
    this.selectedYear = this.currentDate.getFullYear();
    this.loadMonthData();
  }

  jumpToMonth() {
    this.currentDate = new Date(this.selectedYear, this.selectedMonth, 1);
    this.loadMonthData();
  }

  selectDay(calendarDay: any) {
    if (calendarDay.day) {
      this.selectedDate = calendarDay.date;
      // Always get fresh data from the rezervacije array to ensure clan info is included
      const dateStr = this.formatDate(calendarDay.date);
      this.dayRezervacije = this.rezervacije.filter(r => r.datum === dateStr);
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  getMonthName(): string {
    return this.currentDate.toLocaleDateString('sl-SI', { month: 'long', year: 'numeric' });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm && this.selectedDate) {
      this.newRezervacija.datum = this.formatDate(this.selectedDate);
    }
    if (!this.showAddForm) {
      this.clanSearchQuery = '';
      this.searchedClani = [];
      this.selectedClan = null;
      this.showClanDropdown = false;
    }
  }

  searchClan() {
    const query = this.clanSearchQuery.trim();
    if (query.length < 2) {
      this.searchedClani = [];
      this.showClanDropdown = false;
      return;
    }

    const parts = query.split(' ');
    const ime = parts[0];
    const priimek = parts.length > 1 ? parts.slice(1).join(' ') : '';

    this.igrisceService.searchClani(ime, priimek).subscribe({
      next: (clani) => {
        this.searchedClani = clani;
        this.showClanDropdown = clani.length > 0;
      },
      error: (error) => {
        console.error('Napaka pri iskanju članov:', error);
        this.searchedClani = [];
        this.showClanDropdown = false;
      }
    });
  }

  selectClanFromDropdown(clan: Clan) {
    this.selectedClan = clan;
    this.newRezervacija.clanId = clan.id;
    this.clanSearchQuery = `${clan.ime} ${clan.priimek}`;
    this.showClanDropdown = false;
  }

  addRezervacija() {
    if (!this.newRezervacija.clanId || !this.newRezervacija.datum || !this.newRezervacija.ura) {
      alert('Prosimo izpolnite vsa polja');
      return;
    }

    this.igrisceService.createRezervacija(this.newRezervacija).subscribe({
      next: () => {
        this.loadMonthData();
        this.showAddForm = false;
        this.clanSearchQuery = '';
        this.searchedClani = [];
        this.selectedClan = null;
        this.showClanDropdown = false;
        this.newRezervacija = {
          clanId: '',
          skupina: 1,
          datum: '',
          ura: ''
        };
      },
      error: (error) => {
        console.error('Napaka pri dodajanju rezervacije:', error);
        alert('Napaka pri dodajanju rezervacije');
      }
    });
  }

  deleteRezervacija(id: string) {
    if (confirm('Ste prepričani, da želite izbrisati rezervacijo?')) {
      this.igrisceService.deleteRezervacija(id).subscribe({
        next: () => {
          this.loadMonthData();
          if (this.selectedDate) {
            this.dayRezervacije = this.dayRezervacije.filter(r => r.id !== id);
          }
        },
        error: (error) => {
          console.error('Napaka pri brisanju rezervacije:', error);
          alert('Napaka pri brisanju rezervacije');
        }
      });
    }
  }

  switchToCalendar() {
    this.viewMode = 'calendar';
    this.loadMonthData();
  }

  switchToResults() {
    this.viewMode = 'results';
    this.loadIgre();
  }
}
