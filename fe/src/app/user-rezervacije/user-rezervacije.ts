import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserRezervacijeService, Rezervacija } from './user-rezervacije.service';
import { AuthService } from '../services/auth.service';
import { forkJoin } from 'rxjs';
import { WeatherService, DayWeather } from './weather.service';

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
  // debug switch za turnirje, set to off ce turnirji niso zagnani
  private turnirjiAvailable = true;
  
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

  selectedDayWeather: DayWeather | null = null;
  weatherLoading = false;
  weatherError: string | null = null;

  // lj
  private readonly LJ_LAT = 46.0569;
  private readonly LJ_LON = 14.5058;

  private weatherCache: Record<string, DayWeather | null> = {};
  
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
    private authService: AuthService,
    private weatherService: WeatherService
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

  patchRezervacijeIntoCalendar() {
    for (const d of this.calendarDays) {
      if (!d?.date) continue;
      const dateStr = this.formatDate(d.date);

      const dayRez = this.rezervacije.filter(r => r.datum === dateStr);
      d.rezervacije = dayRez;
      d.userHasReservation = dayRez.some(r => r.clanId === this.currentUserId);
    }
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
        this.patchRezervacijeIntoCalendar();
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
        dateKey: dateStr,
        rezervacije: dayRezervacije,
        userHasReservation: userRezervacije.length > 0,
        isTournamentDay: false
      };
      
      // Check if tournament on this date
      if (this.turnirjiAvailable) {
        this.rezervacijeService.isTournamentOnDate(dateStr).subscribe({
          next: (isTournament) => {
            calendarDay.isTournamentDay = isTournament;
            this.cdr.detectChanges();
          },
          error: () => {
            // servis ni dosegljiv -> ugasni nadaljnje klice
            this.turnirjiAvailable = false;
            calendarDay.isTournamentDay = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        calendarDay.isTournamentDay = false;
      }

      
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

    this.selectedDate = null;
    this.dayRezervacije = [];
    this.userHasReservationOnSelectedDay = false;
    this.showAddForm = false;

    this.generateCalendar();
    this.loadMonthData();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.selectedMonth = this.currentDate.getMonth();
    this.selectedYear = this.currentDate.getFullYear();

    this.selectedDate = null;
    this.dayRezervacije = [];
    this.userHasReservationOnSelectedDay = false;
    this.showAddForm = false;

    this.generateCalendar();
    this.loadMonthData();
  }

  jumpToMonth() {
    this.currentDate = new Date(this.selectedYear, this.selectedMonth, 1);

    // reset selection, ker je lahko iz prejsnjega meseca
    this.selectedDate = null;
    this.dayRezervacije = [];
    this.userHasReservationOnSelectedDay = false;
    this.showAddForm = false;

    // najprej naredi pravilen koledar za nov mesec
    this.generateCalendar();

    // potem nalozi rezervacije za ta mesec
    this.loadMonthData();
    }

  selectDay(calendarDay: any) {
    if (calendarDay.day && !calendarDay.isTournamentDay) {
      this.selectedDate = calendarDay.date;
      // console.log('CLICKED', this.formatDate(calendarDay.date), 'isWithin14Days?=', this.isWithinNext14Days(calendarDay.date));
      this.loadWeatherForSelectedDay(calendarDay.date);
      const dateStr = this.formatDate(calendarDay.date);
      this.dayRezervacije = this.rezervacije.filter(r => r.datum === dateStr);
      this.userHasReservationOnSelectedDay = calendarDay.userHasReservation;
      this.showAddForm = false;
      this.loadWeatherForSelectedDay(calendarDay.date);
    } else if (calendarDay.isTournamentDay) {
        alert('Ta dan je rezerviran za turnir. Rezervacije niso možne.');
        this.selectedDayWeather = null;
        this.weatherLoading = false;
        this.weatherError = null;
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

  private toDateKey(d: Date): string {
    return this.formatDate(d); // ze imas YYYY-MM-DD
  }

  isWithinNext14Days(date: Date | null): boolean {
    if (!date) return false;

    const dayStart = new Date(date);
    dayStart.setHours(0,0,0,0);

    const today = new Date();
    today.setHours(0,0,0,0);

    const diffDays = Math.floor((dayStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 13;
  }

  // https://open-meteo.com/en/docs#weather_variable_documentation
  weatherEmoji(code?: number): string {
    if (code == null) return '';
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '🌤️';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code === 51 || code === 53 || code === 55) return '🌦️';
    if (code === 61 || code === 63 || code === 65) return '🌧️';
    if (code === 66 || code === 67) return '🌧️❄️';
    if (code === 71 || code === 73 || code === 75 || code === 77) return '❄️';
    if (code === 80 || code === 81 || code === 82) return '🌧️';
    if (code === 85 || code === 86) return '🌨️';
    if (code === 95) return '⛈️';
    if (code === 96 || code === 99) return '⛈️🧊';
    return '🌡️';
  }

  loadWeatherForSelectedDay(date: Date) {
  // reset UI
  this.selectedDayWeather = null;
  this.weatherError = null;

  // samo za naslednjih 14 dni
  if (!this.isWithinNext14Days(date)) {
    this.weatherLoading = false;
    return; // ne prikazuj nic
  }

  const dateStr = this.formatDate(date);

  // cache (optional)
  if (this.weatherCache[dateStr] !== undefined) {
    this.selectedDayWeather = this.weatherCache[dateStr];
    this.weatherLoading = false;
    if (!this.selectedDayWeather) this.weatherError = 'Vreme za ta dan ni na voljo.';
    return;
  }

  this.weatherLoading = true;

  this.weatherService.getForecastForDay(this.LJ_LAT, this.LJ_LON, dateStr).subscribe({
    next: (w) => {
      this.selectedDayWeather = w;
      this.weatherCache[dateStr] = w;
      this.weatherLoading = false;
      if (!w) this.weatherError = 'Vreme za ta dan ni na voljo.';
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Napaka pri nalaganju vremena:', err);
      this.weatherCache[dateStr] = null;
      this.weatherLoading = false;
      this.weatherError = 'Napaka pri nalaganju vremena.';
      this.cdr.detectChanges();
    }
  });
}

}
