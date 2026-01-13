import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type DayOfWeek =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface DelovniDanDto {
    danVTednu: DayOfWeek;
    zacetek: string; // backend: LocalTime ("08:00:00" ali "08:00")
    konec: string;  
}

export interface UrnikDto {
    dnevi: DelovniDanDto[];
}

@Injectable({ providedIn: 'root' })
export class UrnikService {
    private baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8091/api/zaposleni' : '/api/zaposleni';

    constructor(private http: HttpClient) {}

    getUrnik(zaposleniId: string): Observable<UrnikDto> {
        return this.http.get<UrnikDto>(`${this.baseUrl}/${zaposleniId}/urnik`);
    }

    setDan(zaposleniId: string, dan: DayOfWeek, dto: DelovniDanDto): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${zaposleniId}/urnik/${dan}`, dto);
    }

    deleteDan(zaposleniId: string, dan: DayOfWeek): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${zaposleniId}/urnik/${dan}`);
    }

    deleteUrnik(zaposleniId: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${zaposleniId}/urnik`);
    }
}
