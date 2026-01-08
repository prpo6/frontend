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
  private apiUrl = 'http://localhost:8085/api/rezervacije';

  constructor(private http: HttpClient) {}

  getRezervacijeByDateRange(datumOd: string, datumDo: string): Observable<Rezervacija[]> {
    return this.http.get<Rezervacija[]>(`${this.apiUrl}?datumOd=${datumOd}&datumDo=${datumDo}`);
  }

  createRezervacija(rezervacija: Rezervacija): Observable<Rezervacija> {
    return this.http.post<Rezervacija>(this.apiUrl, rezervacija);
  }

  isTournamentOnDate(datum: string): Observable<boolean> {
    return this.http.get<boolean>(`http://localhost:8083/api/turnirji/check-date?datum=${datum}`);
  }
}
