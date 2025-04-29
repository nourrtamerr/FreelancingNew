import { ApplicationConfig, provideZoneChangeDetection,importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { headerInterceptor } from './Shared/Interceptors/Header/header.interceptor';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { errorInterceptor } from './Shared/Interceptors/Error/error.interceptor';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
export const appConfig: ApplicationConfig = {

  providers: [provideCharts(withDefaultRegisterables()),
    provideHttpClient(withFetch(),
    withInterceptors([headerInterceptor,errorInterceptor])),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-bottom-right',  // Global position for all toasts
      timeOut: 3000,                       // Time for toast to stay visible
      closeButton: true,                   // Show close button
      progressBar: true,                   // Show progress bar
      preventDuplicates: true,             // Prevent duplicate toasts
    }),
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes)]

};

