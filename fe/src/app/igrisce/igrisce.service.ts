import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Clan {
  id: string;
  ime: string;
  priimek: string;
}

export interface Rezervacija {
  id?: string;
  clanId: string;
  skupina: number;
  datum: string;
  ura: string;
  clan?: Clan;
}

export interface Igra {
  id?: string;
  rezervacijaId: string;
  clanId: string;
  totalScore?: number;
  rezultati?: Rezultat[];
  clan?: Clan;
}

export interface Rezultat {
  id?: string;
  luknja: number;
  rezultat: number;
  igraId: string;
}

@Injectable({
  providedIn: 'root'
})
export class IgrisceService {
  private apiUrl = 'http://localhost:8085/api';
  private claniApiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // Rezervacije endpoints
  getAllRezervacije(): Observable<Rezervacija[]> {
    return this.http.get<Rezervacija[]>(`${this.apiUrl}/rezervacije`);
  }

  getRezervacijeByDate(datum: string): Observable<Rezervacija[]> {
    return this.http.get<Rezervacija[]>(`${this.apiUrl}/rezervacije?datum=${datum}`);
  }

  getRezervacijeByDateRange(datumOd: string, datumDo: string): Observable<Rezervacija[]> {
    return this.http.get<Rezervacija[]>(`${this.apiUrl}/rezervacije?datumOd=${datumOd}&datumDo=${datumDo}`);
  }

  createRezervacija(rezervacija: Rezervacija): Observable<Rezervacija> {
    return this.http.post<Rezervacija>(`${this.apiUrl}/rezervacije`, rezervacija);
  }

  updateRezervacija(id: string, rezervacija: Rezervacija): Observable<Rezervacija> {
    return this.http.put<Rezervacija>(`${this.apiUrl}/rezervacije/${id}`, rezervacija);
  }

  deleteRezervacija(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rezervacije/${id}`);
  }

  // Igre endpoints
  getAllIgre(): Observable<Igra[]> {
    return this.http.get<Igra[]>(`${this.apiUrl}/igre`);
  }

  getIgreByClan(clanId: string): Observable<Igra[]> {
    return this.http.get<Igra[]>(`${this.apiUrl}/igre/clani/${clanId}`);
  }

  getIgreByRezervacija(rezervacijaId: string): Observable<Igra[]> {
    return this.http.get<Igra[]>(`${this.apiUrl}/igre/rezervacije/${rezervacijaId}`);
  }

  createIgra(igra: { rezervacijaId: string; clanId: string }): Observable<Igra> {
    return this.http.post<Igra>(`${this.apiUrl}/igre`, igra);
  }

  deleteIgra(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/igre/${id}`);
  }

  // Rezultati endpoints
  createRezultat(rezultat: Rezultat): Observable<Rezultat> {
    return this.http.post<Rezultat>(`${this.apiUrl}/rezultati`, rezultat);
  }

  getRezultatiByIgra(igraId: string): Observable<Rezultat[]> {
    return this.http.get<Rezultat[]>(`${this.apiUrl}/rezultati/igre/${igraId}`);
  }

  // Clan endpoints (from clani microservice)
  getClan(clanId: string): Observable<Clan> {
    return this.http.get<Clan>(`${this.claniApiUrl}/api/clani/${clanId}`);
  }

  searchClani(ime?: string, priimek?: string): Observable<Clan[]> {
    let params = '';
    if (ime) params += `ime=${ime}`;
    if (priimek) params += (params ? '&' : '') + `priimek=${priimek}`;
    return this.http.get<Clan[]>(`${this.claniApiUrl}/api/clani/search?${params}`);
  }

  // Check if there's a tournament on a specific date
  isTournamentOnDate(datum: string): Observable<boolean> {
    return this.http.get<boolean>(`http://localhost:8083/api/turnirji/check-date?datum=${datum}`);
  }
}
