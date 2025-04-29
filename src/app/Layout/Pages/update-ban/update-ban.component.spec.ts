import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateBanComponent } from './update-ban.component';

describe('UpdateBanComponent', () => {
  let component: UpdateBanComponent;
  let fixture: ComponentFixture<UpdateBanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateBanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateBanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
