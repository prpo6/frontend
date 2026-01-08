import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'http://localhost:8090/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  validateToken(): Observable<any> {
    const token = this.getToken();
    return this.http.get(`${this.authUrl}/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  logout() {
    const token = this.getToken();
    
    if (token) {
      this.http.post(`${this.authUrl}/logout`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe({
        next: () => {
          this.clearSession();
          this.router.navigate(['/login']);
        },
        error: () => {
          this.clearSession();
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.clearSession();
      this.router.navigate(['/login']);
    }
  }

  private clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('clanId');
    localStorage.removeItem('accountType');
  }
}
