import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../../Services/Auth/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && error.error?.message.includes('Invalid token')) {
        authService.logout();
        router.navigate(['/login']);
        toastr.error('Session expired. Please log in again.');
        return EMPTY;
      }
      else if (error.error?.message) {
        toastr.error(error.error.message);
        return EMPTY;
      }
      return throwError(() => error);
    })
  );
};
