import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Rezervacija {
  id?: string;
  clanId: string;
  skupina: number;
  datum: string;
  ura: string;
  clan?: {
    id: string;
    ime: string;
    priimek: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserRezervacijeService {
  private apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:8085/api/rezervacije' : '/api/rezervacije';

  constructor(private http: HttpClient) {}

  getRezervacijeByDateRange(datumOd: string, datumDo: string): Observable<Rezervacija[]> {
    return this.http.get<Rezervacija[]>(`${this.apiUrl}?datumOd=${datumOd}&datumDo=${datumDo}`);
  }

  createRezervacija(rezervacija: Rezervacija): Observable<Rezervacija> {
    return this.http.post<Rezervacija>(this.apiUrl, rezervacija);
  }

  isTournamentOnDate(datum: string): Observable<boolean> {
    const turnirjiUrl = window.location.hostname === 'localhost' ? 'http://localhost:8083/api/turnirji' : '/api/turnirji';
    return this.http.get<boolean>(`${turnirjiUrl}/check-date?datum=${datum}`);
  }
}
