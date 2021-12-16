import { Component, Input } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActiveCartService,
  Cart,
  CmsService,
  FeaturesConfigModule,
  I18nTestingModule,
  OrderEntry,
  PromotionLocation,
  SelectiveCartService,
} from '@spartacus/core';
import { Observable, of } from 'rxjs';
import { CartItemComponentOptions } from '../cart-shared/cart-item/cart-item.component';
import { SaveForLaterComponent } from './save-for-later.component';

@Component({
  template: '',
  selector: 'cx-cart-item-list',
})
class MockCartItemListComponent {
  @Input() readonly = false;
  @Input() items: OrderEntry[];
  @Input() cartIsLoading: Observable<boolean>;
  @Input() options: CartItemComponentOptions = {
    isSaveForLater: false,
    optionalBtn: null,
  };
  @Input() promotionLocation: PromotionLocation = PromotionLocation.ActiveCart;
}

describe('SaveForLaterComponent', () => {
  let component: SaveForLaterComponent;
  let fixture: ComponentFixture<SaveForLaterComponent>;

  const mockActiveCartService = {
    addEntry: jest.fn(),
    isStable: jest.fn(),
    getActive: jest.fn(),
  };

  const mockSelectiveCartService = {
    getCart: jest.fn(),
    isStable: jest.fn(),
    removeEntry: jest.fn(),
    getEntries: jest.fn(),
  };

  const mockCmsService = {
    getComponentData: jest.fn(),
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SaveForLaterComponent, MockCartItemListComponent],
        imports: [FeaturesConfigModule, I18nTestingModule],
        providers: [
          { provide: CmsService, useValue: mockCmsService },
          { provide: ActiveCartService, useValue: mockActiveCartService },
          { provide: SelectiveCartService, useValue: mockSelectiveCartService },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveForLaterComponent);
    component = fixture.componentInstance;

    mockSelectiveCartService.isStable.mockReturnValue(of(true));
    mockActiveCartService.isStable.mockReturnValue(of(true));
    mockActiveCartService.getActive.mockReturnValue(
      of<Cart>({ code: '00001', totalItems: 0 })
    );
    mockCmsService.getComponentData.mockReturnValue(of({ content: 'content' }));
    mockSelectiveCartService.getCart.mockReturnValue(of<Cart>({ code: '123' }));
    mockSelectiveCartService.getEntries.mockReturnValue(of<OrderEntry[]>([{}]));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display save for later text with items', () => {
    mockSelectiveCartService.getCart.mockReturnValue(
      of<Cart>({
        code: '123',
        totalItems: 5,
      })
    );
    fixture.detectChanges();
    const el = fixture.debugElement.query(By.css('.cx-total'));
    const cartHead = el.nativeElement.textContent;
    expect(cartHead).toEqual('saveForLaterItems.itemTotal count:5');
  });

  it('should display empty cart info when cart is empty and save for later has items', () => {
    mockSelectiveCartService.getCart.mockReturnValue(
      of<Cart>({
        code: '123',
        totalItems: 5,
      })
    );
    fixture.detectChanges();
    expect(
      fixture.debugElement.query(By.css('.cx-empty-cart-info')).nativeElement
        .textContent
    ).toEqual('content');
  });

  it('should move to cart', () => {
    const mockItem = {
      quantity: 5,
      product: {
        code: 'PR0000',
      },
    };
    component.moveToCart(mockItem);
    expect(mockSelectiveCartService.removeEntry).toHaveBeenCalledWith(mockItem);
    expect(mockActiveCartService.addEntry).toHaveBeenCalledWith(
      mockItem.product.code,
      mockItem.quantity
    );
  });
});
