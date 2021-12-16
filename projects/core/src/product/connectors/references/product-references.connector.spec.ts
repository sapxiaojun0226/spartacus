import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductReferencesAdapter } from './product-references.adapter';
import { ProductReferencesConnector } from './product-references.connector';

class MockProductReferencesAdapter implements ProductReferencesAdapter {
  load = jest.fn().mockImplementation((code) =>
    of('product' + code)
  );
}

describe('ProductReferencesConnector', () => {
  let service: ProductReferencesConnector;
  let adapter: ProductReferencesAdapter;
  let result;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ProductReferencesAdapter,
          useClass: MockProductReferencesAdapter,
        },
      ],
    });

    service = TestBed.inject(ProductReferencesConnector);
    adapter = TestBed.inject(ProductReferencesAdapter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call adapter', () => {
    service.get('333').subscribe((res) => (result = res));
    expect(result).toBe('product333');
    expect(adapter.load).toHaveBeenCalledWith('333', undefined, undefined);
  });
});
