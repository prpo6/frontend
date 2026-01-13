import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  constructor(private http: HttpClient, private router: Router) {}

  isAdminLoggedIn(): boolean {
    const token = localStorage.getItem('adminToken');
    return !!token;
  }

  getAdminToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  getAdminPozicija(): string | null {
    return localStorage.getItem('adminPozicija');
  }

  isAdmin(): boolean {
    const pozicija = this.getAdminPozicija();
    return pozicija?.toLowerCase() === 'admin';
  }

  validateAdminToken() {
    const token = this.getAdminToken();
    if (!token) {
      return Promise.resolve(false);
    }

    const authUrl = window.location.hostname === 'localhost' ? 'http://localhost:8090/api/auth' : '/api/auth';
    return this.http.get<any>(`${authUrl}/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).toPromise().then(response => {
      return response?.valid && response?.accountType === 'employee';
    }).catch(() => {
      this.clearAdminSession();
      return false;
    });
  }

  logoutAdmin() {
    const token = this.getAdminToken();
    if (token) {
      const authUrl = window.location.hostname === 'localhost' ? 'http://localhost:8090/api/auth' : '/api/auth';
      this.http.post(`${authUrl}/logout`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).subscribe();
    }
    this.clearAdminSession();
    this.router.navigate(['/admin/login']);
  }

  clearAdminSession() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminPozicija');
    localStorage.removeItem('adminAccountType');
  }
}
