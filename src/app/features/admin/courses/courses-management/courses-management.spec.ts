import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesManagement } from './courses-management';

describe('CoursesManagement', () => {
  let component: CoursesManagement;
  let fixture: ComponentFixture<CoursesManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursesManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
