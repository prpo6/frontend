import { Routes } from '@angular/router';
import { ClaniComponent } from './clani/clani.component';

export const routes: Routes = [
  { path: '', redirectTo: '/clani', pathMatch: 'full' },
  { path: 'clani', component: ClaniComponent }
];
