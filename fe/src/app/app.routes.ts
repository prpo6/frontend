import { Routes } from '@angular/router';
import { ClaniComponent } from './clani/clani.component';
import { HomeComponent } from './home/home.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { IgrisceComponent } from './igrisce/igrisce';
import { TurnirjiComponent } from './turnirji/turnirji';
import { UserRezervacijeComponent } from './user-rezervacije/user-rezervacije';
import { UserTurnirjiComponent } from './user-turnirji/user-turnirji';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'user', component: HomeComponent },
  { path: 'admin', component: AdminHomeComponent },
  { path: 'clani', component: ClaniComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'igrisce', component: IgrisceComponent },
  { path: 'turnirji', component: TurnirjiComponent },
  { path: 'user/rezervacije', component: UserRezervacijeComponent },
  { path: 'user/turnirji', component: UserTurnirjiComponent }
];
