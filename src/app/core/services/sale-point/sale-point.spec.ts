import { TestBed } from '@angular/core/testing';

import { SalePoint } from './sale-point';

describe('SalePoint', () => {
  let service: SalePoint;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalePoint);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
