import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  username: string | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.username = this.authService.getUsername();
  }

  navigateToUserRezervacije() {
    this.router.navigate(['/user/rezervacije']);
  }

  navigateToUserTurnirji() {
    this.router.navigate(['/user/turnirji']);
  }

  navigateToAdminHome() {
    this.router.navigate(['/admin']);
  }

  logout() {
    this.authService.logout();
  }
}
