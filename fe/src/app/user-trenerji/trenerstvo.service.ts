import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Trener {
  id: string;
  ime: string;
  priimek: string;
  email?: string;
  telefon?: string;
  specializacija?: string;
}

export interface MojTermin {
  id: string;
  zacetek: string; // ISO
  konec: string;   // ISO
  trenerId: string;
  clanId: string;
}

export interface CreateTerminRequest {
  trenerId: string;
  zacetek: string; // ISO
  konec: string;   // ISO
  clanId: String,
}

@Injectable({ providedIn: 'root' })
export class TrenerstvoService {
  private baseUrl = 'http://localhost:8085/api'; 

  constructor(private http: HttpClient) {}

  getTrenerji(): Observable<Trener[]> {
    return this.http.get<Trener[]>(`${this.baseUrl}/trenerji`);
  }

  createTermin(dto: CreateTerminRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/termini`, dto, { responseType: 'text' as 'json' });
  }

  
    getTerminiByClan(clanId: string): Observable<MojTermin[]> {
        return this.http.get<MojTermin[]>(`${this.baseUrl}/termini/clan/${clanId}`);
    }
  
  deleteTermin(terminId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/termini/${terminId}`);
  }
}
