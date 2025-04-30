import { TestBed } from '@angular/core/testing';

import { FundandwithdrawService } from './fundandwithdraw.service';

describe('FundandwithdrawService', () => {
  let service: FundandwithdrawService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FundandwithdrawService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
