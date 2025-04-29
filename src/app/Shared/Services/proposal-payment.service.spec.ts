import { TestBed } from '@angular/core/testing';

import { ProposalPaymentService } from './proposal-payment.service';

describe('ProposalPaymentService', () => {
  let service: ProposalPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProposalPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
