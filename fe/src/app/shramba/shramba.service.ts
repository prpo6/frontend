import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Artikel {
  id?: string;
  imeArtikla: string;
  opis?: string;
  kolicina: number;
  cenaNajema: number;
  izposojeno?: number;
  pregledano?: string;
}

@Injectable({ providedIn: 'root' })
export class ShrambaService {
  private apiUrl = 'http://localhost:8081/api/artikli';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Artikel[]> {
    return this.http.get<Artikel[]>(this.apiUrl);
  }

  create(a: Artikel): Observable<Artikel> {
    return this.http.post<Artikel>(this.apiUrl, a);
  }

  update(id: string, a: Artikel): Observable<Artikel> {
    return this.http.put<Artikel>(`${this.apiUrl}/${id}`, a);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
