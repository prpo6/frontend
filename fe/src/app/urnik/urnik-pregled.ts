import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, of, forkJoin } from 'rxjs';
import { finalize, catchError, timeout, takeUntil, map, switchMap} from 'rxjs/operators';

import { ZaposleniService, Zaposleni } from '../zaposleni/zaposleni.service';
import { UrnikService, DayOfWeek, UrnikDto } from './urnik.service';

type DayRow = { key: DayOfWeek; label: string };

type Slot = {
  zaposleniId: string;
  ime: string;
  priimek: string;
  pozicija: string;
  zacetek: string; // HH:mm
  konec: string;   // HH:mm
};

function toHHmm(t?: string) {
  if (!t) return '';
  return t.slice(0, 5); // "08:00:00" -> "08:00"
}

@Component({
  selector: 'app-urnik-pregled',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './urnik-pregled.html',
  styleUrls: ['./urnik-pregled.css']
})
export class UrnikPregledComponent implements OnInit {
days: DayRow[] = [
    { key: 'MONDAY', label: 'Pon' },
    { key: 'TUESDAY', label: 'Tor' },
    { key: 'WEDNESDAY', label: 'Sre' },
    { key: 'THURSDAY', label: 'Čet' },
    { key: 'FRIDAY', label: 'Pet' },
    { key: 'SATURDAY', label: 'Sob' },
    { key: 'SUNDAY', label: 'Ned' }
];

loading = true;
slotsByDay: Record<DayOfWeek, Slot[]> = {
    MONDAY: [], TUESDAY: [], WEDNESDAY: [], THURSDAY: [],
    FRIDAY: [], SATURDAY: [], SUNDAY: []
};

constructor(
    private router: Router,
    private zaposleniService: ZaposleniService,
    private urnikService: UrnikService,
    private cdr: ChangeDetectorRef,
) {
    //console.log('UrnikPregledComponent INSTANCE', Math.random());
}

ngOnInit() {
    this.load();
}

back() { this.router.navigate(['/admin']); }
openEditor() { this.router.navigate(['/urnik/uredi']); }

public refreshInProgress = false;
private cancel$ = new Subject<void>();

load() {
  this.cancel$.next();

  if (this.refreshInProgress) return;
  this.refreshInProgress = true;
  this.loading = true;

  for (const d of this.days) this.slotsByDay[d.key] = [];
    console.log('LOAD start');
    this.zaposleniService.getAll().pipe(
        takeUntil(this.cancel$),
        timeout(8000),
        catchError(err => {
        console.error('getAll failed', err);
        alert('Napaka pri nalaganju zaposlenih');
        return of([] as Zaposleni[]);
    }),

    switchMap((zaposleni: Zaposleni[]) => {
      const urniki$ = (zaposleni || [])
        .filter(z => !!z.id)
        .map(z =>
          this.urnikService.getUrnik(z.id!).pipe(
            timeout(8000),
            catchError(err => {
              console.warn('getUrnik failed for', z.id, err);
              return of({ dnevi: [] } as UrnikDto);
            }),
            map(urnik => ({ zaposleni: z, urnik }))
          )
        );

      return forkJoin(urniki$); 
    }),

    finalize(() => {
        console.log('FINALIZE -> loading false');
        this.loading = false;
        this.refreshInProgress = false;
        this.cdr.detectChanges();
    })
  )
    .subscribe({
        next: (results) => {
            console.log('SUBSCRIBE next results:', results)
            for (const { zaposleni, urnik } of results) {
            for (const dd of (urnik.dnevi || [])) {
                const day = dd.danVTednu as DayOfWeek;

                if (!this.slotsByDay[day]) continue;

                this.slotsByDay[day].push({
                zaposleniId: zaposleni.id!,
                ime: zaposleni.ime,
                priimek: zaposleni.priimek,
                pozicija: zaposleni.pozicija,
                zacetek: (dd.zacetek ?? '').slice(0, 5),
                konec: (dd.konec ?? '').slice(0, 5),
                });
            }
            }

            for (const d of this.days) {
                this.slotsByDay[d.key].sort((a, b) =>
                    (a.zacetek ?? '').localeCompare(b.zacetek ?? '')
                );
            }
            this.cdr.detectChanges();
        },
        error: (e) => console.error('SUBSCRIBE error:', e),
        complete: () => console.log('SUBSCRIBE complete')
    });
}
}
