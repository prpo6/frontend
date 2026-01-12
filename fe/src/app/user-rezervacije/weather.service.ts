import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export type DayWeather = {
  date: string;        // YYYY-MM-DD
  weatherCode: number;
  tMax?: number;
  tMin?: number;
};

@Injectable({ providedIn: 'root' })
export class WeatherService {
  constructor(private http: HttpClient) {}

  getForecastForDay(lat: number, lon: number, date: string): Observable<DayWeather | null> {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&start_date=${date}&end_date=${date}` +
      `&timezone=auto&temperature_unit=celsius`;

    return this.http.get<any>(url).pipe(
      map(res => {
        const time = res?.daily?.time?.[0];
        if (!time) return null;

        return {
          date: time,
          weatherCode: res.daily.weather_code?.[0],
          tMax: res.daily.temperature_2m_max?.[0],
          tMin: res.daily.temperature_2m_min?.[0]
        } as DayWeather;
      })
    );
  }
}
