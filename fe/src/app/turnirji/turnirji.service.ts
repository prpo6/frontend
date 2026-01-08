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
  private apiUrl = 'http://localhost:8083/api/turnirji';

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
}
