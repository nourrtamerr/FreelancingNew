import { TestBed } from '@angular/core/testing';

import { ProjectSkillsService } from './project-skills.service';

describe('ProjectSkillsService', () => {
  let service: ProjectSkillsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectSkillsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
