import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";
import { AuthService } from "../../Services/Auth/auth.service";

export const clientOrFreelancerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const roles = authService.getRoles();

  return roles?.some(role=>role === 'Client' || role === 'Freelancer'|| role === 'Admin')? true:false;
};