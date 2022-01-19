import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Product } from '@spartacus/core';
import { ProductService } from 'projects/core/src/product';
import { Observable, of } from 'rxjs';
import { AddedToCartToastService } from './added-to-cart-toast.service';

class MockProductService implements Partial<ProductService> {
  get(): Observable<any> {
    return of(mockProduct);
  }
}

const mockProduct: Partial<Product> = {
  name: 'Test Product',
  price: {
    formattedValue: '$4.20',
  },
  images: {},
};

describe('AddedToCartToastService', () => {
  let addedToCartToastService: AddedToCartToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ProductService, useClass: MockProductService }],
    });
    addedToCartToastService = TestBed.inject(AddedToCartToastService);
  });

  it('should be created', () => {
    expect(addedToCartToastService).toBeTruthy();
  });

  it('should add a toast item', () => {
    const toast = addedToCartToastService.addToast(
      1,
      mockProduct,
      'toast-test'
    );
    expect(toast).toBeTruthy();
    expect(addedToCartToastService.cartToastItems.length).toBe(1);
  });

  it('should remove previous toasts when adding a new one', fakeAsync(() => {
    const removeSpy = spyOn(addedToCartToastService, 'removePrevious');
    addedToCartToastService.addToast(1, mockProduct, 'toast-test');
    addedToCartToastService.addToast(1, mockProduct, 'toast-test');
    tick(500);
    addedToCartToastService.removeToast();
    expect(removeSpy).toHaveBeenCalled();
    expect(addedToCartToastService.cartToastItems.length).toBe(1);
  }));

  it('should remove a toast', () => {
    addedToCartToastService.addToast(1, mockProduct, 'toast-test');
    addedToCartToastService.removeToast();
    expect(addedToCartToastService.cartToastItems.length).toBe(0);
  });

  it('it should set the position of the toast', () => {
    const testClassName = 'test-class';
    addedToCartToastService.addToast(1, mockProduct, 'toast-test');
    addedToCartToastService.setPosition('test-class');
    expect(addedToCartToastService.cartToastItems[0].baseClass).toBe(
      testClassName
    );
  });
});
