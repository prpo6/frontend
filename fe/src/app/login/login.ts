import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/user']);
    }
  }

  login() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Vnesite uporabniško ime in geslo';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.post<any>('http://localhost:8090/api/auth/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('clanId', response.clanId);
        localStorage.setItem('accountType', response.accountType);
        
        this.router.navigate(['/user']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Napačno uporabniško ime ali geslo';
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
