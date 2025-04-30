import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFundByClientComponent } from './add-fund-by-client.component';

describe('AddFundByClientComponent', () => {
  let component: AddFundByClientComponent;
  let fixture: ComponentFixture<AddFundByClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFundByClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFundByClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
