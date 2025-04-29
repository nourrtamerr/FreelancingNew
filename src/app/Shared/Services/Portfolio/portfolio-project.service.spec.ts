import { TestBed } from '@angular/core/testing';
import { PortfolioProjectService } from './portfolio-project.service';


describe('PortfolioProjectService', () => {
  let service: PortfolioProjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
