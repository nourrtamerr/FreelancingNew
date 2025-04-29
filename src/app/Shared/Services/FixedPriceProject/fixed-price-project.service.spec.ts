import { TestBed } from '@angular/core/testing';

import { FixedPriceProjectService } from './fixed-price-project.service';

describe('FixedPriceProjectService', () => {
  let service: FixedPriceProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FixedPriceProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
