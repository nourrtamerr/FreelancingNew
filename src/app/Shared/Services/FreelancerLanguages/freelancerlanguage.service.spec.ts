import { TestBed } from '@angular/core/testing';

import { FreelancerlanguageService } from './freelancerlanguage.service';

describe('FreelancerlanguageService', () => {
  let service: FreelancerlanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FreelancerlanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
