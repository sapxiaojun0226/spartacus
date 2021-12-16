import { DebugElement, Pipe, PipeTransform } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import {
  GlobalMessageService,
  I18nTestingModule,
  NotificationPreference,
  NotificationType,
  OCC_USER_ID_ANONYMOUS,
  OCC_USER_ID_CURRENT,
  Product,
  ProductInterestSearchResult,
  TranslationService,
  UserIdService,
  UserInterestsService,
  UserNotificationPreferenceService,
} from '@spartacus/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ModalService } from '../../../shared/components/modal/modal.service';
import { SpinnerModule } from '../../../shared/components/spinner/spinner.module';
import { CurrentProductService } from '../current-product.service';
import { StockNotificationDialogComponent } from './stock-notification-dialog/stock-notification-dialog.component';
import { StockNotificationComponent } from './stock-notification.component';

describe('StockNotificationComponent', () => {
  let component: StockNotificationComponent;
  let fixture: ComponentFixture<StockNotificationComponent>;
  let el: DebugElement;

  const translationService = {
    translate: jest.fn(),
  };
  const modalService = {
    open: jest.fn(),
    dismissActiveModal: jest.fn(),
  };
  const globalMessageService = {
    add: jest.fn(),
  };
  const dialogComponent = jest.fn();
  const userIdService = {
    getUserId: jest.fn(),
  };
  const currentProductService = {
    getProduct: jest.fn(),
  };
  const notificationPrefService = {
    loadPreferences: jest.fn(),
    getEnabledPreferences: jest.fn(),
    clearPreferences: jest.fn(),
  };
  const interestsService = {
    getAddProductInterestSuccess: jest.fn(),
    getRemoveProdutInterestLoading: jest.fn(),
    getRemoveProdutInterestSuccess: jest.fn(),
    getAddProductInterestError: jest.fn(),
    resetRemoveInterestState: jest.fn(),
    resetAddInterestState: jest.fn(),
    addProductInterest: jest.fn(),
    removeProdutInterest: jest.fn(),
    getProductInterests: jest.fn(),
    clearProductInterests: jest.fn(),
    loadProductInterests: jest.fn(),
  };

  const preferences: NotificationPreference[] = [
    {
      channel: 'EMAIL',
      enabled: true,
      value: 'test@sap.com',
      visible: true,
    },
  ];
  const interests: ProductInterestSearchResult = {
    results: [
      {
        product: {
          code: '7566514',
        },
        productInterestEntry: [
          {
            interestType: NotificationType.BACK_IN_STOCK,
          },
        ],
      },
    ],
  };
  const product: Product = {
    code: '7566514',
    stock: {
      stockLevelStatus: 'outOfStock',
    },
  };
  const modalInstance: {
    componentInstance?: {
      subscribeSuccess$?: Observable<boolean>;
      enabledPrefs?: NotificationPreference[];
    };
  } = {
    componentInstance: {},
  };
  const removeSuccess = new BehaviorSubject<boolean>(false);
  const addFail = new BehaviorSubject<boolean>(false);

  @Pipe({
    name: 'cxUrl',
  })
  class MockUrlPipe implements PipeTransform {
    transform(): any {}
  }

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [I18nTestingModule, RouterTestingModule, SpinnerModule],
        declarations: [
          StockNotificationComponent,
          StockNotificationDialogComponent,
          MockUrlPipe,
        ],
        providers: [
          { provide: UserIdService, useValue: userIdService },
          { provide: CurrentProductService, useValue: currentProductService },
          { provide: GlobalMessageService, useValue: globalMessageService },
          { provide: TranslationService, useValue: translationService },
          { provide: ModalService, useValue: modalService },
          {
            provide: UserNotificationPreferenceService,
            useValue: notificationPrefService,
          },
          {
            provide: StockNotificationDialogComponent,
            useValue: dialogComponent,
          },
          { provide: UserInterestsService, useValue: interestsService },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    userIdService.getUserId.mockReturnValue(of(OCC_USER_ID_CURRENT));
    notificationPrefService.loadPreferences.mockImplementation();
    notificationPrefService.clearPreferences.mockImplementation();
    notificationPrefService.getEnabledPreferences.mockReturnValue(
      of(preferences)
    );
    currentProductService.getProduct.mockReturnValue(of(product));
    interestsService.getProductInterests.mockReturnValue(of(interests));
    interestsService.getAddProductInterestSuccess.mockReturnValue(of(false));
    interestsService.getAddProductInterestError.mockReturnValue(addFail);
    interestsService.getRemoveProdutInterestLoading.mockReturnValue(of(false));
    interestsService.getRemoveProdutInterestSuccess.mockReturnValue(
      removeSuccess
    );
    interestsService.addProductInterest.mockImplementation();
    interestsService.removeProdutInterest.mockImplementation();
    interestsService.clearProductInterests.mockImplementation();
    interestsService.resetRemoveInterestState.mockImplementation();
    interestsService.loadProductInterests.mockImplementation();
    modalService.open.mockReturnValue(modalInstance);
    translationService.translate.mockReturnValue(of(''));

    fixture = TestBed.createComponent(StockNotificationComponent);
    el = fixture.debugElement;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should not show element expcept out of stock product', () => {
    currentProductService.getProduct.mockReturnValue(
      of({
        ...product,
        stock: {
          stockLevelStatus: 'inStock',
          stockLevel: 10,
        },
      })
    );
    fixture.detectChanges();
    expect(el.query(By.css('button'))).toBeNull();
  });

  it('should show elements for anonymous specific', () => {
    interestsService.getProductInterests.mockReturnValue(of({}));
    notificationPrefService.getEnabledPreferences.mockReturnValue(of([]));
    userIdService.getUserId.mockReturnValue(of(OCC_USER_ID_ANONYMOUS));
    fixture.detectChanges();

    expect(el.query(By.css('a')).nativeElement).toBeTruthy();
    expect(
      el.query(By.css('.stock-notification-notes')).nativeElement
    ).toBeTruthy();
    expect(el.query(By.css('.btn-notify')).nativeElement.disabled).toEqual(
      true
    );
  });

  it('should show correct elements for active customer without enabled preferences', () => {
    interestsService.getProductInterests.mockReturnValue(of({}));
    notificationPrefService.getEnabledPreferences.mockReturnValue(of([]));
    fixture.detectChanges();

    expect(el.query(By.css('a')).nativeElement).toBeTruthy();
    expect(
      el.query(By.css('.stock-notification-notes')).nativeElement
    ).toBeTruthy();
    expect(el.query(By.css('.btn-notify')).nativeElement.disabled).toEqual(
      true
    );
  });

  it('should be able to show dialog for create stock notification for active user with channel set', () => {
    interestsService.getProductInterests.mockReturnValue(of({}));
    fixture.detectChanges();

    expect(
      el.query(By.css('.stock-notification-notes')).nativeElement
    ).toBeTruthy();
    const button = el.query(By.css('.btn-notify')).nativeElement;
    button.click();

    expect(modalService.open).toHaveBeenCalled();
    expect(interestsService.addProductInterest).toHaveBeenCalledWith(
      product.code,
      NotificationType.BACK_IN_STOCK
    );
  });

  it('should show global message when delete stock notification success for login user with channel set', () => {
    fixture.detectChanges();
    expect(
      el.query(By.css('.stock-notification-notes')).nativeElement
    ).toBeTruthy();
    const button = el.query(By.css('.btn-stop-notify')).nativeElement;
    button.click();
    removeSuccess.next(true);

    expect(globalMessageService.add).toHaveBeenCalled();
    expect(interestsService.removeProdutInterest).toHaveBeenCalled();
  });

  it('should be able to close dialog when adding interest fail', () => {
    interestsService.getProductInterests.mockReturnValue(of({}));
    fixture.detectChanges();
    expect(
      el.query(By.css('.stock-notification-notes')).nativeElement
    ).toBeTruthy();
    const button = el.query(By.css('.btn-notify')).nativeElement;
    button.click();
    addFail.next(true);

    expect(modalService.open).toHaveBeenCalled();
    expect(interestsService.addProductInterest).toHaveBeenCalledWith(
      product.code,
      NotificationType.BACK_IN_STOCK
    );
    expect(modalService.dismissActiveModal).toHaveBeenCalled();
    expect(interestsService.resetAddInterestState).toHaveBeenCalled();
  });

  it('should be able to unsubscribe in destory', () => {
    jest.spyOn(component['subscriptions'], 'unsubscribe').mockImplementation();
    component.ngOnDestroy();

    expect(component['subscriptions'].unsubscribe).toHaveBeenCalled();
    expect(interestsService.clearProductInterests).toHaveBeenCalled();
    expect(notificationPrefService.clearPreferences).toHaveBeenCalled();
  });
});
