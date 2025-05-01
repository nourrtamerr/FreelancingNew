import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { AuthService } from "../../Services/Auth/auth.service";

export const clientOrFreelancerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const role = authService.getRole();

  return role === 'Client' || role === 'Freelancer';
};