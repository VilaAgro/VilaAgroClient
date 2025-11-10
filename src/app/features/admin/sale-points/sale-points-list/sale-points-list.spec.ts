import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalePointsList } from './sale-points-list';

describe('SalePointsList', () => {
  let component: SalePointsList;
  let fixture: ComponentFixture<SalePointsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalePointsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalePointsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
