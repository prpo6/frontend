import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [],
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent {
  constructor(private router: Router) {}

  navigateToClani() {
    this.router.navigate(['/clani']);
  }

  navigateToIgrisce() {
    this.router.navigate(['/igrisce']);
  }

  navigateToTurnirji() {
    this.router.navigate(['/turnirji']);
  }

  navigateToUserHome() {
    this.router.navigate(['/user']);
  }
}
