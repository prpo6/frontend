import { Routes } from '@angular/router';
import { ClaniComponent } from './clani/clani.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login';
import { IgrisceComponent } from './igrisce/igrisce';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'clani', component: ClaniComponent },
  { path: 'login', component: LoginComponent },
  { path: 'igrisce', component: IgrisceComponent }
];
