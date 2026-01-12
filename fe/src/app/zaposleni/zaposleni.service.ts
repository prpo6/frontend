import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Zaposleni {
  id?: string;
  ime: string;
  priimek: string;
  email: string;
  telefon: string;
  pozicija: string;
  status: string;

  naslov?: string;
  postaId?: number;
  datumRojstva?: string;     // "YYYY-MM-DD"
  datumZaposlitve?: string;  // "YYYY-MM-DD"
}

@Injectable({ providedIn: 'root' })
export class ZaposleniService {
  private apiUrl = 'http://localhost:8091/api/zaposleni';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Zaposleni[]> {
    return this.http.get<Zaposleni[]>(this.apiUrl);
  }

  create(z: Zaposleni): Observable<Zaposleni> {
    return this.http.post<Zaposleni>(this.apiUrl, z);
  }

  update(id: string, z: Zaposleni): Observable<Zaposleni> {
    return this.http.put<Zaposleni>(`${this.apiUrl}/${id}`, z);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
