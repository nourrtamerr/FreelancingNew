import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { clientOrFreelancerGuardGuard } from './client-or-freelancer-guard.guard';

describe('clientOrFreelancerGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => clientOrFreelancerGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
