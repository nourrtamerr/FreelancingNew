import { TestBed } from '@angular/core/testing';

import { SubscribtionService } from './subscribtion.service';

describe('SubscribtionService', () => {
  let service: SubscribtionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubscribtionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
