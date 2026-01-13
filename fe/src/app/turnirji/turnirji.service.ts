import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Turnir {
  id?: string;
  naziv: string;
  opis?: string;
  datumZacetek: string;
  datumKonec?: string;
  tipTurnirja: 'bracket' | 'leaderboard';
  status: 'pending' | 'registration' | 'active' | 'completed' | 'cancelled';
  maxIgralcev: number;
  trenutnoIgralcev?: number;
  rezervacijaId?: string;
  zmagovalecId?: string;
  steviloRund: number;
  skupinaStart?: number;
  skupinaEnd?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTurnirRequest {
  naziv: string;
  opis?: string;
  datumZacetek: string;
  datumKonec?: string;
  tipTurnirja: 'bracket' | 'leaderboard';
  maxIgralcev: number;
  steviloRund: number;
  skupinaStart?: number;
  skupinaEnd?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TurnirjiService {
  private apiUrl = window.location.hostname === 'localhost' ? 'http://localhost:8083/api/turnirji' : '/api/turnirji';

  constructor(private http: HttpClient) {}

  getAllTurnirji(upcomingOnly: boolean = false): Observable<Turnir[]> {
    const params = new HttpParams().set('upcomingOnly', upcomingOnly);
    return this.http.get<Turnir[]>(this.apiUrl, { params });
  }

  getTurnir(id: string): Observable<Turnir> {
    return this.http.get<Turnir>(`${this.apiUrl}/${id}`);
  }

  createTurnir(request: CreateTurnirRequest, adminClanId: string): Observable<Turnir> {
    const params = new HttpParams().set('adminClanId', adminClanId);
    return this.http.post<Turnir>(this.apiUrl, request, { params });
  }

  updateTurnir(id: string, request: Partial<CreateTurnirRequest>): Observable<Turnir> {
    return this.http.put<Turnir>(`${this.apiUrl}/${id}`, request);
  }

  deleteTurnir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  openRegistration(id: string): Observable<Turnir> {
    return this.http.post<Turnir>(`${this.apiUrl}/${id}/open-registration`, {});
  }

  startTurnir(id: string): Observable<Turnir> {
    return this.http.post<Turnir>(`${this.apiUrl}/${id}/start`, {});
  }

  completeTurnir(id: string, zmagovalecId?: string): Observable<Turnir> {
    const params = zmagovalecId ? new HttpParams().set('zmagovalecId', zmagovalecId) : new HttpParams();
    return this.http.patch<Turnir>(`${this.apiUrl}/${id}/complete`, {}, { params });
  }

  // Leaderboard methods
  getLeaderboard(turnirId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${turnirId}/leaderboard`);
  }

  enterTournamentScore(turnirId: string, request: { clanId: string; igraId: string; runda: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${turnirId}/scores`, request);
  }

  completeTournamentWithWinner(turnirId: string, winnerId: string): Observable<Turnir> {
    const params = new HttpParams().set('zmagovalecId', winnerId);
    return this.http.patch<Turnir>(`${this.apiUrl}/${turnirId}/complete`, {}, { params });
  }

  // Bracket methods
  getBracket(turnirId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${turnirId}/bracket`);
  }

  updateMatchResult(request: { tekmaId: string; zmagovalecId: string; rezultat1: number; rezultat2: number }): Observable<any> {
    return this.http.put(`${this.apiUrl}/matches/result`, request);
  }

  completeTournament(turnirId: string, zmagovalecId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${turnirId}/complete?zmagovalecId=${zmagovalecId}`, {});
  }

  getClan(clanId: string): Observable<any> {
    const claniUrl = window.location.hostname === 'localhost' ? 'http://localhost:8080/api/clani' : '/api/clani';
    return this.http.get(`${claniUrl}/${clanId}`);
  }

  getParticipants(turnirId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${turnirId}/participants`);
  }

  createIgra(igra: { rezervacijaId: string | null; clanId: string }): Observable<any> {
    const igreUrl = window.location.hostname === 'localhost' ? 'http://localhost:8085/api/igre' : '/api/igre';
    return this.http.post(igreUrl, igra);
  }

  addRezultat(rezultat: { igraId: string; luknja: number; rezultat: number }): Observable<any> {
    const rezultatiUrl = window.location.hostname === 'localhost' ? 'http://localhost:8085/api/rezultati' : '/api/rezultati';
    return this.http.post(rezultatiUrl, rezultat);
  }
}
