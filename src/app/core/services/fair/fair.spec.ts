import { TestBed } from '@angular/core/testing';

import { Fair } from './fair';

describe('Fair', () => {
  let service: Fair;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Fair);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
