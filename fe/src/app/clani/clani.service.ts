import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Posta {
  id?: number;
  postnaSt: number;
  kraj: string;
}

export interface Clan {
  id?: string;
  ime: string;
  priimek: string;
  datumRojstva?: string;
  handicap?: number;
  naslov?: string;
  postaId?: number;
  posta?: Posta;
  clanOd?: string;
  potekClanstva?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClaniService {
  private apiUrl = 'http://localhost:8080/api/clani';
  private posteUrl = 'http://localhost:8080/api/poste';

  constructor(private http: HttpClient) {}

  getAllClani(): Observable<Clan[]> {
    return this.http.get<Clan[]>(this.apiUrl);
  }

  getClanById(id: string): Observable<Clan> {
    return this.http.get<Clan>(`${this.apiUrl}/${id}`);
  }

  createClan(clan: Clan): Observable<Clan> {
    return this.http.post<Clan>(this.apiUrl, clan);
  }

  updateClan(id: string, clan: Clan): Observable<Clan> {
    return this.http.put<Clan>(`${this.apiUrl}/${id}`, clan);
  }

  deleteClan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Posta API methods
  getAllPoste(): Observable<Posta[]> {
    return this.http.get<Posta[]>(this.posteUrl);
  }

  getPostaById(id: number): Observable<Posta> {
    return this.http.get<Posta>(`${this.posteUrl}/${id}`);
  }

  createPosta(posta: Posta): Observable<Posta> {
    return this.http.post<Posta>(this.posteUrl, posta);
  }
}
