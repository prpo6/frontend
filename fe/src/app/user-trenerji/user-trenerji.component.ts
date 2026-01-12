import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, of, timeout } from 'rxjs';

import {
    TrenerstvoService,
    Trener,
    CreateTerminRequest,
    MojTermin
} from './trenerstvo.service';

@Component({
    selector: 'app-user-trenerji',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './user-trenerji.component.html',
    styleUrls: ['./user-trenerji.component.css']
})

export class UserTrenerjiComponent implements OnInit {
    loading = true;
    error: string | null = null;

    trenerji: Trener[] = [];

    selectedTrener: Trener | null = null;

    datum = '';
    zacetek = '';
    trajanjeUre = 1 // ali 2
    clanId = null
    terminLoading = false;
    terminError: string | null = null;
    terminSuccess: string | null = null;
    trenerById: Record<string, Trener> = {};
    ure: string[] = Array.from({ length: 15 }, (_, i) => String(i + 6).padStart(2, '0') + ':00');

    showMojiModal = false;

    mojiLoading = false;
    mojiError: string | null = null;
    mojiTermini: MojTermin[] = [];

    constructor(
        private router: Router,
        private trenerstvoService: TrenerstvoService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        console.log('[Trenerji] ngOnInit');
        this.fetchTrenerji();
    }

    nazaj() {
        this.router.navigate(['/user']);
    }

    private fetchTrenerji() {
    console.log('[Trenerji] fetchTrenerji start');
    this.loading = true;
    this.error = null;

    this.cdr.detectChanges();

    this.trenerstvoService.getTrenerji().pipe(
        finalize(() => {
        console.log('[Trenerji] finalize -> loading=false');
        this.loading = false;
        this.cdr.detectChanges();
        }),
        catchError((err) => {
        console.error('[Trenerji] error', err);
        this.error = 'Napaka pri nalaganju trenerjev.';
        return of([] as Trener[]);
        })
    ).subscribe((data) => {
        console.log('[Trenerji] subscribe data length:', data?.length);
        this.trenerji = data ?? [];
        this.trenerById = Object.fromEntries(this.trenerji.map(t => [t.id, t]));
        this.cdr.detectChanges();
    });
    }


    odpriTerminForm(trener: Trener) {
        this.selectedTrener = trener;
        this.terminError = null;
        this.terminSuccess = null;
        this.datum = '';
        this.zacetek = '';
    }

        odpriMojeTermine() {
            this.showMojiModal = true;
            this.naloziMojeTermine();
        }

    prekliciTermin() {
        this.selectedTrener = null;
    }

    
    shraniTermin() {
        if (!this.zacetek.endsWith(':00')) {
            this.terminError = 'Začetek mora biti na polno uro.';
            return;
        }
        if (!this.selectedTrener) return;

        this.terminError = null;
        this.terminSuccess = null;

        if (!this.datum || !this.zacetek) {
            this.terminError = 'Izpolni datum in začetek.';
            return;
        }

        if (this.trajanjeUre !== 1 && this.trajanjeUre !== 2) {
            this.terminError = 'Trajanje mora biti 1 ali 2 uri.';
            return;
        }


        const zacetekIso = `${this.datum}T${this.zacetek}:00`;
        const konecIso = this.addHoursIso(zacetekIso, this.trajanjeUre);

        const clanId = this.getClanIdFromJwt();
        if (!clanId) {
            this.terminError = 'Ni uporabniškega ID-ja. Prosimo prijavi se ponovno.';
            return;
        }
        const payload: CreateTerminRequest = {
            trenerId: this.selectedTrener.id,
            zacetek: zacetekIso,
            konec: konecIso,
            clanId: clanId
        }

        console.log(payload)
        this.terminLoading = true;

        this.trenerstvoService.createTermin(payload).pipe(
            timeout(8000),
            catchError(() => {
                this.terminError = 'Napaka pri ustvarjanju termina.';
                return of(null);
            }),
            finalize(() => {
                this.terminLoading = false
                this.cdr.detectChanges();
            })
        ).subscribe((res) => {
            if (res !== null) {
                this.terminSuccess = 'Termin uspešno ustvarjen!';

                setTimeout(() => {
                    this.selectedTrener = null;
                    this.cdr.detectChanges();
                }, 400);
            }
            });
        }

    trackById(_: number, t: Trener) {
        return t.id;
    }

    private addHoursIso(startIso: string, hoursToAdd: number): string {
        const d = new Date(startIso);
        d.setHours(d.getHours() + hoursToAdd);

        const pad = (n: number) => String(n).padStart(2, '0');

        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const mi = pad(d.getMinutes());
        const ss = pad(d.getSeconds());

        return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
    }

    dpriMojeTermine() {
        this.showMojiModal = true;
        this.naloziMojeTermine();
    }

    zapriMojeTermine() {
        this.showMojiModal = false;
    }

    private getClanIdFromJwt(): string | null {
        const token = localStorage.getItem('token'); 
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log(payload.userId)
            return payload.userId ?? null;
        } catch {
            return null;
        }
    }

    private naloziMojeTermine() {
        console.log('[Moji termini] start');
        this.mojiLoading = true;
        this.mojiError = null;
        this.mojiTermini = [];
        this.cdr.detectChanges();

        const clanId = this.getClanIdFromJwt(); 
        if (!clanId) {
            this.mojiError = 'Ni uporabniškega ID-ja. Prosimo prijavi se ponovno.';
            this.mojiLoading = false;
            this.cdr.detectChanges();
            return;
        }

        this.trenerstvoService.getTerminiByClan(clanId).pipe(
            timeout(5000),
            catchError((err) => {
                console.error('[Moji termini] error', err);
                this.mojiError = 'Napaka pri nalaganju terminov.';
                return of([] as MojTermin[]);
            }),
            finalize(() => {
                console.log('[Moji termini] finalize -> mojiLoading=false');
                this.mojiLoading = false;
                this.cdr.detectChanges();
            })
        ).subscribe((data) => {
            console.log(data)
            this.mojiTermini = data
            this.cdr.detectChanges();
        });
        }

    izbrisiTermin(terminId: string) {
        const ok = confirm('Ali res želiš izbrisati ta termin?');
        if (!ok) return;

        this.trenerstvoService.deleteTermin(terminId).pipe(
            catchError((err) => {
            console.error('[Delete termin] error', err);
            this.mojiError = 'Brisanje ni uspelo.';
            return of(null);
            })
        ).subscribe((res) => {
            if (res === null) return;
            this.mojiTermini = this.mojiTermini.filter(t => t.id !== terminId);
        });
    }

    formatDateTime(iso: string): string {
        const d = new Date(iso);
        return d.toLocaleString('sl-SI', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }
}
