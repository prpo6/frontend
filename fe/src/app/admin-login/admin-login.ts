import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // Check if already logged in as admin
    const token = localStorage.getItem('adminToken');
    if (token) {
      this.validateAndRedirect(token);
    }
  }

  validateAndRedirect(token: string) {
    const authUrl = window.location.hostname === 'localhost' ? 'http://localhost:8090/api/auth' : '/api/auth';
    this.http.get<any>(`${authUrl}/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        if (response.valid && response.accountType === 'employee') {
          this.router.navigate(['/admin']);
        }
      },
      error: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminPozicija');
      }
    });
  }

  login() {
    this.errorMessage = '';
    
    if (!this.username || !this.password) {
      this.errorMessage = 'Uporabniško ime in geslo sta obvezna';
      return;
    }

    this.loading = true;

    const authUrl = window.location.hostname === 'localhost' ? 'http://localhost:8090/api/auth' : '/api/auth';
    this.http.post<any>(`${authUrl}/login/employee`, {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        // Store admin session
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminUsername', response.username);
        localStorage.setItem('adminPozicija', response.pozicija);
        localStorage.setItem('adminAccountType', response.accountType);
        
        this.router.navigate(['/admin']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Prijava ni uspela';
      }
    });
  }
}
