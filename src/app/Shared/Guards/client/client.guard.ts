import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../Services/Auth/auth.service';

export const clientGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const roles = authService.getRoles();
  if (roles?.some(role=>role === 'Client' || role === 'Admin')) {
    return true;
  } else {
    router.navigate(['/home']);
    return false;
  }
};



