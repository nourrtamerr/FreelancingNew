import { TestBed } from '@angular/core/testing';

import { SubscribtionpaymentService } from './subscribtionpayment.service';

describe('SubscribtionpaymentService', () => {
  let service: SubscribtionpaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubscribtionpaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
