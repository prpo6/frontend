import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminAuthService } from '../services/admin-auth.service';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  username: string | null = null;
  pozicija: string | null = null;

  constructor(private router: Router, private adminAuthService: AdminAuthService) {}

  ngOnInit() {
    this.username = localStorage.getItem('adminUsername');
    this.pozicija = localStorage.getItem('adminPozicija');
  }

  navigateToClani() {
    this.router.navigate(['/clani']);
  }

  navigateToIgrisce() {
    this.router.navigate(['/igrisce']);
  }

  navigateToTurnirji() {
    this.router.navigate(['/turnirji']);
  }

  logout() {
    this.adminAuthService.logoutAdmin();
  }
}
