import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Turnir {
  id?: string;
  naziv: string;
  opis?: string;
  datumZacetek: string;
  datumKonec?: string;
  tipTurnirja: 'leaderboard' | 'bracket';
  maxIgralcev: number;
  trenutnoIgralcev?: number;
  status: 'pending' | 'registration' | 'active' | 'completed' | 'cancelled';
  steviloRund: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserTurnirjiService {
  private apiUrl = 'http://localhost:8083/api/turnirji';

  constructor(private http: HttpClient) {}

  getOpenTurnirji(): Observable<Turnir[]> {
    return this.http.get<Turnir[]>(`${this.apiUrl}?status=registration`);
  }

  getTurnir(id: string): Observable<Turnir> {
    return this.http.get<Turnir>(`${this.apiUrl}/${id}`);
  }

  registerForTurnir(turnirId: string, clanId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${turnirId}/register`, {
      clanId: clanId,
      handicap: 0
    });
  }

  unregisterFromTurnir(turnirId: string, clanId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${turnirId}/participants/${clanId}`);
  }

  getTurnirParticipants(turnirId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${turnirId}/participants`);
  }
}
