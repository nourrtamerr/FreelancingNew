import { TestBed } from '@angular/core/testing';

import { BiddingProjectService } from './bidding-project.service';

describe('BiddingProjectService', () => {
  let service: BiddingProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BiddingProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
