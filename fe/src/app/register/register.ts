import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

interface Posta {
  id: number;
  postnaSt: number;
  kraj: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit {
  // Member details (matching Clan model)
  ime: string = '';
  priimek: string = '';
  datumRojstva: string = '';
  handicap: string = '';
  naslov: string = '';
  postnaSt: string = '';
  kraj: string = '';
  postaId: number | null = null;
  clanOd: string = '';
  potekClanstva: string = '';
  
  // Account details
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  
  errorMessage: string = '';
  loading: boolean = false;
  krajDisabled: boolean = false;

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/user']);
      return;
    }
    
    // Set default clanOd to today
    this.clanOd = new Date().toISOString().split('T')[0];
    // Set default potekClanstva to 1 year from now
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    this.potekClanstva = oneYearFromNow.toISOString().split('T')[0];
  }

  // Check if postal code exists when user types it
  onPostnaStChange() {
    const postnaSt = parseInt(this.postnaSt);
    
    if (!this.postnaSt || isNaN(postnaSt)) {
      this.kraj = '';
      this.krajDisabled = false;
      this.postaId = null;
      return;
    }

    // Look up postal code
    this.http.get<Posta>(`http://localhost:8080/api/poste/postnaSt/${postnaSt}`).subscribe({
      next: (posta) => {
        // Postal code exists - auto-fill kraj and disable it
        this.kraj = posta.kraj;
        this.krajDisabled = true;
        this.postaId = posta.id;
      },
      error: (error) => {
        // Postal code doesn't exist - enable kraj field for user to enter
        this.kraj = '';
        this.krajDisabled = false;
        this.postaId = null;
      }
    });
  }

  register() {
    this.errorMessage = '';

    if (!this.ime || !this.priimek || !this.username || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Ime, priimek, uporabniško ime in geslo so obvezni';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Gesli se ne ujemata';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Geslo mora vsebovati najmanj 6 znakov';
      return;
    }

    this.loading = true;

    // If postal code was entered, handle posta creation if needed
    if (this.postnaSt) {
      const postnaSt = parseInt(this.postnaSt);
      
      if (isNaN(postnaSt)) {
        this.errorMessage = 'Poštna številka mora biti številka';
        this.loading = false;
        return;
      }

      if (!this.kraj) {
        this.errorMessage = 'Mesto je obvezno če vnesete poštno številko';
        this.loading = false;
        return;
      }

      // If postaId is null, it means postal code doesn't exist yet - create it
      if (this.postaId === null) {
        this.http.post<Posta>('http://localhost:8080/api/poste', {
          postnaSt: postnaSt,
          kraj: this.kraj
        }).subscribe({
          next: (posta) => {
            this.postaId = posta.id;
            this.createClanAndAccount();
          },
          error: (error) => {
            this.loading = false;
            this.errorMessage = error.error?.message || 'Napaka pri ustvarjanju pošte';
          }
        });
      } else {
        // Postal code already exists, proceed with clan creation
        this.createClanAndAccount();
      }
    } else {
      // No postal code entered, proceed without it
      this.createClanAndAccount();
    }
  }

  private createClanAndAccount() {
    // Create the clan with all fields
    const clanData: any = {
      ime: this.ime,
      priimek: this.priimek,
      naslov: this.naslov || null,
      postaId: this.postaId || null,
      clanOd: this.clanOd || null,
      potekClanstva: this.potekClanstva || null
    };
    
    // Add optional fields only if provided
    if (this.datumRojstva) {
      clanData.datumRojstva = this.datumRojstva;
    }
    if (this.handicap) {
      clanData.handicap = parseFloat(this.handicap);
    }

    this.http.post<any>('http://localhost:8080/api/clani', clanData).subscribe({
      next: (clan) => {
        // Now create the account with the new clanId
        this.http.post<any>('http://localhost:8090/api/auth/register', {
          clanId: clan.id,
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
            this.errorMessage = error.error?.message || 'Ustvarjanje računa ni uspelo';
          }
        });
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Registracija ni uspela';
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
