import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserRezervacijeService, Rezervacija } from './user-rezervacije.service';
import { AuthService } from '../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-rezervacije',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-rezervacije.html',
  styleUrl: './user-rezervacije.css'
})
export class UserRezervacijeComponent implements OnInit {
  rezervacije: Rezervacija[] = [];
  loading = true;
  currentUserId: string = '';
  
  // Calendar data
  currentDate = new Date(2025, 11, 1); // December 2025
  calendarDays: any[] = [];
  selectedDate: Date | null = null;
  dayRezervacije: Rezervacija[] = [];
  userHasReservationOnSelectedDay = false;
  
  // Month/Year selection
  selectedMonth: number = 11;
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
  newRezervacija: Rezervacija = {
    clanId: '',
    skupina: 1,
    datum: '',
    ura: '08:00'
  };

  constructor(
    private rezervacijeService: UserRezervacijeService,
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
    this.newRezervacija.clanId = clanId;
    
    for (let year = 2020; year <= 2030; year++) {
      this.years.push(year);
    }
    this.selectedMonth = this.currentDate.getMonth();
    this.selectedYear = this.currentDate.getFullYear();
    this.loadMonthData();
    this.generateCalendar();
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  loadMonthData() {
    this.loading = true;
    const startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    
    const datumOd = this.formatDate(startDate);
    const datumDo = this.formatDate(endDate);
    
    this.rezervacijeService.getRezervacijeByDateRange(datumOd, datumDo).subscribe({
      next: (data) => {
        this.rezervacije = data;
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

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    this.calendarDays = [];
    
    // Add empty days for alignment
    for (let i = 0; i < startingDayOfWeek; i++) {
      this.calendarDays.push({ day: null, date: null, rezervacije: [], isTournamentDay: false });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = this.formatDate(date);
      const dayRezervacije = this.rezervacije.filter(r => r.datum === dateStr);
      const userRezervacije = dayRezervacije.filter(r => r.clanId === this.currentUserId);
      
      const calendarDay = {
        day,
        date,
        rezervacije: dayRezervacije,
        userHasReservation: userRezervacije.length > 0,
        isTournamentDay: false
      };
      
      // Check if tournament on this date
      this.rezervacijeService.isTournamentOnDate(dateStr).subscribe({
        next: (isTournament) => {
          calendarDay.isTournamentDay = isTournament;
          this.cdr.detectChanges();
        },
        error: () => {
          calendarDay.isTournamentDay = false;
        }
      });
      
      this.calendarDays.push(calendarDay);
    }
  }

  isSelectedDateTournamentDay(): boolean {
    if (!this.selectedDate) return false;
    const selectedDay = this.calendarDays.find(d => 
      d.date && d.date.getTime() === this.selectedDate!.getTime()
    );
    return selectedDay?.isTournamentDay || false;
  }

  isToday(date: Date | null): boolean {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
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
    if (calendarDay.day && !calendarDay.isTournamentDay) {
      this.selectedDate = calendarDay.date;
      const dateStr = this.formatDate(calendarDay.date);
      this.dayRezervacije = this.rezervacije.filter(r => r.datum === dateStr);
      this.userHasReservationOnSelectedDay = calendarDay.userHasReservation;
      this.showAddForm = false;
    } else if (calendarDay.isTournamentDay) {
      alert('Ta dan je rezerviran za turnir. Rezervacije niso možne.');
    }
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm && this.selectedDate) {
      this.newRezervacija = {
        clanId: this.currentUserId,
        skupina: 1,
        datum: this.formatDate(this.selectedDate),
        ura: '08:00'
      };
    }
  }

  addRezervacija() {
    if (!this.newRezervacija.datum || !this.newRezervacija.ura) {
      alert('Prosim izpolnite vsa polja.');
      return;
    }

    this.rezervacijeService.createRezervacija(this.newRezervacija).subscribe({
      next: (created) => {
        alert('Rezervacija uspešno ustvarjena!');
        this.showAddForm = false;
        this.loadMonthData();
      },
      error: (error) => {
        console.error('Napaka pri ustvarjanju rezervacije:', error);
        if (error.error && typeof error.error === 'string') {
          alert(error.error);
        } else if (error.error?.message) {
          alert(error.error.message);
        } else {
          alert('Napaka pri ustvarjanju rezervacije. Že imate rezervacijo na ta dan ali je dan rezerviran za turnir.');
        }
      }
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getMonthName(): string {
    return this.months[this.currentDate.getMonth()].label;
  }

  getYear(): number {
    return this.currentDate.getFullYear();
  }
}
