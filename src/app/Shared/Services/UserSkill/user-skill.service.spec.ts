import { TestBed } from '@angular/core/testing';

import { UserSkillService } from './user-skill.service';

describe('UserSkillService', () => {
  let service: UserSkillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserSkillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
