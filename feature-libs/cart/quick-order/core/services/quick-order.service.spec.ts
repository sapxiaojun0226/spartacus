import { AbstractType } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActiveCartService,
  CartAddEntrySuccessEvent,
  EventService,
  OrderEntry,
  Product,
  ProductAdapter,
} from '@spartacus/core';
import { Observable, of, queueScheduler } from 'rxjs';
import { delay, observeOn, switchMap, take, tap } from 'rxjs/operators';
import { QuickOrderService } from './quick-order.service';

const mockProduct1Code: string = 'mockCode1';
const mockProduct2Code: string = 'mockCode2';
const mockProduct1: Product = {
  code: mockProduct1Code,
  price: {
    value: 1,
  },
};
const mockProduct2: Product = {
  code: mockProduct2Code,
  price: {
    value: 1,
  },
};
const mockEmptyEntry: OrderEntry = {};
const mockEntry1: OrderEntry = {
  product: mockProduct1,
  quantity: 1,
  basePrice: {
    value: 1,
  },
  totalPrice: {
    value: 1,
  },
};
const mockEntry2: OrderEntry = {
  product: mockProduct2,
  quantity: 2,
  basePrice: {
    value: 1,
  },
  totalPrice: {
    value: 1,
  },
};
const mockEntry1AfterUpdate: OrderEntry = {
  product: mockProduct1,
  quantity: 4,
  basePrice: {
    value: 1,
  },
  totalPrice: {
    value: 1,
  },
};
const mockEntries: OrderEntry[] = [mockEntry1, mockEntry2];

class MockProductAdapter implements Partial<ProductAdapter> {
  load(_productCode: any, _scope?: string): Observable<Product> {
    return of(mockProduct1);
  }
}

class MockActiveCartService implements Partial<ActiveCartService> {
  isStable(): Observable<boolean> {
    return of(true);
  }
  addEntries(_cartEntries: OrderEntry[]): void {}
}

class MockEventService implements Partial<EventService> {
  get<T>(_type: AbstractType<T>): Observable<T> {
    const event = new CartAddEntrySuccessEvent();
    event.productCode = mockProduct1Code;
    event.quantity = 4;
    return of(event) as any;
  }
}

describe('QuickOrderService', () => {
  let service: QuickOrderService;
  let productAdapter: ProductAdapter;
  let activeCartService: ActiveCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QuickOrderService,
        {
          provide: ActiveCartService,
          useClass: MockActiveCartService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        { provide: ProductAdapter, useClass: MockProductAdapter },
      ],
    });

    service = TestBed.inject(QuickOrderService);
    productAdapter = TestBed.inject(ProductAdapter);
    activeCartService = TestBed.inject(ActiveCartService);
  });

  beforeEach(() => {
    service.clearList();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should clear timeout subscriptions on service destroy', () => {
    spyOn(service, 'clearDeletedEntries').and.callThrough();
    service.ngOnDestroy();

    expect(service.clearDeletedEntries).toHaveBeenCalled();
  });

  it('should return an empty list of entries', (done) => {
    service
      .getEntries()
      .pipe(take(1))
      .subscribe((entries) => {
        expect(entries).toEqual([]);
        done();
      });
  });

  it('should load and return list of entries', (done) => {
    service.loadEntries(mockEntries);
    service
      .getEntries()
      .pipe(take(1))
      .subscribe((entries) => {
        expect(entries).toEqual(mockEntries);
        done();
      });
  });

  it('should clear list of entries', (done) => {
    service.loadEntries(mockEntries);
    service.clearList();
    service
      .getEntries()
      .pipe(take(1))
      .subscribe((entries) => {
        expect(entries).toEqual([]);
        done();
      });
  });

  it('should trigger search', () => {
    spyOn(productAdapter, 'load');

    service.search(mockProduct1Code);
    expect(productAdapter.load).toHaveBeenCalledWith(mockProduct1Code);
  });

  it('should update entry quantity', (done) => {
    service.loadEntries([mockEntry1]);
    service.updateEntryQuantity(0, 4);

    service
      .getEntries()
      .pipe(take(1))
      .subscribe((entries) => {
        expect(entries).toEqual([mockEntry1AfterUpdate]);
        done();
      });
  });

  it('should delete entry', (done) => {
    service.loadEntries([mockEntry1, mockEntry2]);
    service.softDeleteEntry(0);

    service
      .getEntries()
      .pipe(take(1))
      .subscribe((entries) => {
        expect(entries).toEqual([mockEntry2]);
        done();
      });
  });

  // TODO: Fully check this method behavior
  it('should add products to the cart', (done) => {
    spyOn(activeCartService, 'addEntries').and.callThrough();
    spyOn(activeCartService, 'isStable').and.callThrough();
    spyOn(service, 'clearList').and.callThrough();

    service.loadEntries([mockEntry1]);
    service
      .addToCart()
      .pipe(take(1))
      .subscribe(() => {
        expect(activeCartService.addEntries).toHaveBeenCalled();
        expect(activeCartService.isStable).toHaveBeenCalled();
        expect(service.clearList).toHaveBeenCalled();
        done();
      });
  });

  it('should add product to the quick order list', (done) => {
    service.addProduct(mockProduct1);

    service
      .getEntries()
      .pipe(take(1))
      .subscribe((entries) => {
        expect(entries).toEqual([
          {
            product: mockProduct1,
            quantity: 1,
            basePrice: {
              value: 1,
            },
            totalPrice: {
              value: 1,
            },
          },
        ]);
        done();
      });
  });

  it('should add product to the quick order list by increasing current existing product quantity', (done) => {
    service.addProduct(mockProduct1);
    service.addProduct(mockProduct1);

    service
      .getEntries()
      .pipe(take(1))
      .subscribe((entries) => {
        expect(entries).toEqual([
          {
            product: mockProduct1,
            quantity: 2,
            basePrice: {
              value: 1,
            },
            totalPrice: {
              value: 1,
            },
          },
        ]);
        done();
      });
  });

  it('should set added product', (done) => {
    service.setProductAdded(mockProduct1Code);

    service.getProductAdded().subscribe((result) => {
      expect(result).toEqual(mockProduct1Code);
    });
    done();
  });

  it('should add deleted entry and after 5s delete it', (done) => {
    service.loadEntries(mockEntries);
    service.softDeleteEntry(0);

    service
      .getSoftDeletedEntries()
      .pipe(
        tap((softDeletedEntries) => {
          expect(softDeletedEntries).toEqual({ mockCode1: mockEntry1 });
        }),
        delay(5000),
        switchMap(() => service.getSoftDeletedEntries())
      )
      .subscribe((result) => {
        expect(result).toEqual({});
      });
    done();
  });

  it('should not add deleted entry', (done) => {
    service.loadEntries([mockEmptyEntry]);
    service.softDeleteEntry(0);

    service
      .getSoftDeletedEntries()
      .pipe(take(1))
      .subscribe((result) => {
        expect(result).toEqual({});
        done();
      });
  });

  it('should return deleted entries', (done) => {
    service.loadEntries([mockEntry1]);
    service.softDeleteEntry(0);

    service
      .getSoftDeletedEntries()
      .pipe(take(1))
      .subscribe((result) => {
        expect(result).toEqual({ mockCode1: mockEntry1 });
        done();
      });
  });

  it('should undo deleted entry', (done) => {
    service.loadEntries([mockEntry1]);
    service.softDeleteEntry(0);

    service
      .getSoftDeletedEntries()
      .pipe(
        observeOn(queueScheduler),
        take(1),
        tap((softDeletedEntries) => {
          expect(softDeletedEntries).toEqual({ mockCode1: mockEntry1 });
        }),
        tap(() => service.restoreSoftDeletedEntry(mockProduct1Code))
      )
      .subscribe((result) => {
        expect(result).toEqual({});
        done();
      });
  });

  it('should clear deleted entry', (done) => {
    service.loadEntries([mockEntry1]);
    service.softDeleteEntry(0);
    service.hardDeleteEntry(mockProduct1Code);
    service
      .getSoftDeletedEntries()
      .pipe(take(1))
      .subscribe((result) => {
        expect(result).toEqual({});
        done();
      });
  });
});
