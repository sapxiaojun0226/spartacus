import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { CouponClaimComponent } from './coupon-claim.component';
import {
  RoutingService,
  GlobalMessageService,
  PageContext,
  PageType,
  GlobalMessageType,
  CustomerCouponService,
} from '@spartacus/core';
import { of } from 'rxjs';

const params = {
  ['couponCode']: 'customerCoupon1',
};

const context: PageContext = {
  id: 'couponClaim',
  type: PageType.CONTENT_PAGE,
};

const mockRouterState = {
  state: {
    cmsRequired: true,
    context,
    params,
  },
};

describe('CouponClaimComponent', () => {
  let component: CouponClaimComponent;
  let fixture: ComponentFixture<CouponClaimComponent>;

  const couponService = {
    claimCustomerCoupon: jest.fn(),
    getClaimCustomerCouponResultSuccess: jest.fn(),
  };
  const routingService = {
    getRouterState: jest.fn(),
    go: jest.fn(),
  };
  const globalMessageService = {
    add: jest.fn(),
  };
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CouponClaimComponent],
        providers: [
          { provide: CustomerCouponService, useValue: couponService },
          { provide: RoutingService, useValue: routingService },
          { provide: GlobalMessageService, useValue: globalMessageService },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    couponService.claimCustomerCoupon.mockImplementation();
    couponService.getClaimCustomerCouponResultSuccess.mockReturnValue(of(true));
    routingService.getRouterState.mockReturnValue(of(mockRouterState));
    routingService.go.mockImplementation();
    globalMessageService.add.mockImplementation();

    fixture = TestBed.createComponent(CouponClaimComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should add global message and navigate to coupons page when claim success', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(globalMessageService.add).toHaveBeenCalledWith(
      { key: 'myCoupons.claimCustomerCoupon' },
      GlobalMessageType.MSG_TYPE_CONFIRMATION
    );
    expect(routingService.go).toHaveBeenCalledWith({ cxRoute: 'coupons' });
  });

  it('should navigate to coupons page when claim fail', () => {
    couponService.getClaimCustomerCouponResultSuccess.mockReturnValue(
      of(false)
    );
    component.ngOnInit();
    fixture.detectChanges();
    expect(routingService.go).toHaveBeenCalledWith({ cxRoute: 'coupons' });
  });

  it('should navigate to not-found page when no coupon code claimed', () => {
    component.ngOnInit();
    fixture.detectChanges();

    routingService.getRouterState.mockReturnValue(
      of({
        state: {
          cmsRequired: true,
          context,
          params: {
            couponCode: null,
          },
        },
      })
    );
    component.ngOnInit();
    fixture.detectChanges();
    expect(routingService.go).toHaveBeenCalledWith({ cxRoute: 'notFound' });
  });
});
