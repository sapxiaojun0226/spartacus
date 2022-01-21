// import { DebugElement } from '@angular/core';
// import { Renderer2 } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  EventService,
  I18nTestingModule,
  Product,
  ProductService,
  WindowRef,
} from '@spartacus/core';
import { UrlTestingModule } from 'projects/core/src/routing/configurable-routes/url-translation/testing/url-testing.module';
import { Observable, of, Subject } from 'rxjs';
import { AddedToCartToastConfig } from '../../added-to-cart-toast-config';
import { CartToastItem, CART_TOAST_STATE } from '../../core/models';
import { AddedToCartToastService } from '../../core/services';
import { AddedToCartToastComponent } from './added-to-cart-toast.component';

class MockWindowRef {
  nativeWindow = window;
  document = document;
}
const mockCartToastItem: CartToastItem = {
  productName: 'Test Product',
  quantity: 1,
  baseClass: 'toast-container on-header close-toast',
  unitPrice: '$3.45',
  images: {},
};
const mockCartToastItems: CartToastItem[] = [mockCartToastItem];

const mockAddedToCartToastConfig: AddedToCartToastConfig = {
  addedToCartToast: {
    enabled: true,
    timeout: 5000,
  },
};

class MockAddedToCartToastService implements Partial<AddedToCartToastService> {
  addToast(
    quantityAdded: number,
    product: Product,
    containerClass: string
  ): CartToastItem {
    const cartToastItem: CartToastItem = {
      baseClass: containerClass,
      productName: product.name,
      quantity: quantityAdded,
      images: product.images,
      unitPrice: product.price?.formattedValue,
    };
    mockCartToastItems.push(cartToastItem);
    return cartToastItem;
  }
  getToasts(): Observable<CartToastItem[]> {
    return of(mockCartToastItems);
  }
  setPosition(_className: string): void {}
  removeToast(): void {}
}

const mockCartAddEntrySuccess$ = new Subject();
const mockCartAddEntrySuccess = {
  productCode: '779841',
  quantity: 1,
  quantityAdded: 1,
};
class MockEventService implements Partial<EventService> {
  get(): Observable<any> {
    return mockCartAddEntrySuccess$.asObservable();
  }
}

const mockProduct: Partial<Product> = {
  name: 'Test Product',
  price: {
    formattedValue: '$4.20',
  },
  images: {},
};

class MockProductService implements Partial<ProductService> {
  get(): Observable<any> {
    return of(mockProduct);
  }
}

fdescribe('AddedToCartToastComponent', () => {
  let component: AddedToCartToastComponent;
  let fixture: ComponentFixture<AddedToCartToastComponent>;
  let service: AddedToCartToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule, UrlTestingModule],
      declarations: [AddedToCartToastComponent],
      providers: [
        { provide: WindowRef, useClass: MockWindowRef },
        {
          provide: AddedToCartToastConfig,
          useValue: mockAddedToCartToastConfig,
        },
        {
          provide: AddedToCartToastService,
          useClass: MockAddedToCartToastService,
        },
        {
          provide: EventService,
          useClass: MockEventService,
        },
        {
          provide: ProductService,
          useClass: MockProductService,
        },
      ],
    }).compileComponents();

    service = TestBed.inject(AddedToCartToastService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddedToCartToastComponent);
    component = fixture.componentInstance;
    component.scrollEventUnlistener = () => {};
    mockCartAddEntrySuccess$.next({ mockCartAddEntrySuccess });
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the class on init', () => {
    component.ngOnInit();
    expect(component.baseClass).toBe('cx-added-to-cart-toast');
  });

  it('should have the product name', () => {
    component.ngOnInit();
    const el = fixture.debugElement.query(By.css('h3'));
    expect(el.nativeElement.innerHTML).toContain(mockCartToastItem.productName);
  });

  it('should have the quantity added', () => {
    component.ngOnInit();
    const el = fixture.debugElement.query(
      By.css('div.added-to-cart-toast-title')
    );
    expect(el.nativeElement.innerHTML).toContain(mockCartToastItem.quantity);
  });

  it('should have the unit price', () => {
    component.ngOnInit();
    const el = fixture.debugElement.query(By.css('span.price'));
    expect(el.nativeElement.innerHTML).toContain(mockCartToastItem.unitPrice);
  });

  describe('isHeaderFixed', () => {
    it('should be fixed', () => {
      component.headerElement = document.createElement('header');
      component.headerElement.style.position = 'fixed';
      const res = component.isHeaderFixed();
      expect(res).toBeTruthy();
    });

    it('should not be fixed', () => {
      component.headerElement = document.createElement('header');
      component.headerElement.style.position = 'absolute';
      const res = component.isHeaderFixed();
      expect(res).not.toBeTruthy();
    });
  });

  describe('isHeaderInView', () => {
    it('should be in view', () => {
      component.headerElement = document.createElement('header');
      spyOn(component.headerElement, 'getBoundingClientRect').and.returnValue(
        new DOMRect(100, 2000, 100, 100)
      );
      const res = component.isHeaderInView();
      expect(res).toBeTruthy();
    });
    it('should not be in view', () => {
      component.headerElement = document.createElement('header');
      spyOn(component.headerElement, 'getBoundingClientRect').and.returnValue(
        new DOMRect(100, -2000, 100, 100)
      );
      const res = component.isHeaderInView();
      expect(res).not.toBeTruthy();
    });
  });

  describe('Toast Positions', () => {
    describe('Toast Opening', () => {
      it('should be fixed when the header is fixed', () => {
        spyOn(component, 'isHeaderFixed').and.returnValue(true);
        let positionClasses = component.getToastStyles(
          CART_TOAST_STATE.OPENING
        );
        expect(positionClasses).toBe('toast-container on-fixed-header');
      });

      it('should be on the header when the header is in view', () => {
        spyOn(component, 'isHeaderFixed').and.returnValue(false);
        spyOn(component, 'isHeaderInView').and.returnValue(true);
        let positionClasses = component.getToastStyles(
          CART_TOAST_STATE.OPENING
        );
        expect(positionClasses).toBe('toast-container on-header');
      });

      it('should be off the header when the header is not in view', () => {
        spyOn(component, 'isHeaderFixed').and.returnValue(false);
        spyOn(component, 'isHeaderInView').and.returnValue(false);
        let positionClasses = component.getToastStyles(
          CART_TOAST_STATE.OPENING
        );
        expect(positionClasses).toBe('toast-container off-header');
      });
    });

    describe('Toast Opened', () => {
      it('should not animate when the toast is opened', () => {
        spyOn(component, 'isHeaderFixed').and.returnValue(false);
        spyOn(component, 'isHeaderInView').and.returnValue(false);
        let positionClasses = component.getToastStyles(CART_TOAST_STATE.OPENED);
        expect(positionClasses).toBe(
          'toast-container off-header transition-none'
        );
      });

      it('should set the toast position through the service', () => {
        const setPositionSpy = spyOn(service, 'setPosition').and.stub();
        component._setPosition();
        expect(setPositionSpy).toHaveBeenCalled();
      });
    });

    describe('Toast Closing', () => {
      it('should trigger the toast close animation', () => {
        let positionClasses = component.getToastStyles(
          CART_TOAST_STATE.CLOSING
        );
        expect(positionClasses).toBe(' close-toast');
      });

      it('should call the service to remove the toast', fakeAsync(() => {
        const removeSpy = spyOn(service, 'removeToast').and.stub();
        component._closeToast(mockCartToastItem);
        tick(500);
        expect(removeSpy).toHaveBeenCalled();
      }));
    });
  });
});
