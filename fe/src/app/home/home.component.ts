import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  navigateToClani() {
    this.router.navigate(['/clani']);
  }

  navigateToIgrisce() {
    this.router.navigate(['/igrisce']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
