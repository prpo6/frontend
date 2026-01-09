import { Routes } from '@angular/router';
import { ClaniComponent } from './clani/clani.component';
import { HomeComponent } from './home/home.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { AdminLoginComponent } from './admin-login/admin-login';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { IgrisceComponent } from './igrisce/igrisce';
import { TurnirjiComponent } from './turnirji/turnirji';
import { UserRezervacijeComponent } from './user-rezervacije/user-rezervacije';
import { UserTurnirjiComponent } from './user-turnirji/user-turnirji';
import { inject } from '@angular/core';
import { AdminAuthService } from './services/admin-auth.service';
import { Router } from '@angular/router';

const adminGuard = async () => {
  const adminAuthService = inject(AdminAuthService);
  const router = inject(Router);
  const isValid = await adminAuthService.validateAdminToken();
  if (!isValid) {
    router.navigate(['/admin/login']);
    return false;
  }
  return true;
};

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'user', component: HomeComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin', component: AdminHomeComponent, canActivate: [adminGuard] },
  { path: 'clani', component: ClaniComponent, canActivate: [adminGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'igrisce', component: IgrisceComponent, canActivate: [adminGuard] },
  { path: 'turnirji', component: TurnirjiComponent, canActivate: [adminGuard] },
  { path: 'user/rezervacije', component: UserRezervacijeComponent },
  { path: 'user/turnirji', component: UserTurnirjiComponent }
];
