import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "../../Services/Auth/auth.service";

export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  try {
    if (!req.url.includes('/api/') || req.url.includes('/Account/login')) {
      return next(req);
    }

    const authService = inject(AuthService);
    const token = authService.getTokenFromCookie();

    let headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest'
    };

    const isFormData = req.body instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const cloned = req.clone({
      setHeaders: headers
    });

    return next(cloned);
  } catch (error) {
    console.error('Interceptor error:', error);
    toastr.error('An error occurred while processing the request.', 'Error');
    return next(req);
  }
};