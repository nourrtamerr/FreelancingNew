import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanDetailsComponent } from './ban-details.component';

describe('BanDetailsComponent', () => {
  let component: BanDetailsComponent;
  let fixture: ComponentFixture<BanDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BanDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BanDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
