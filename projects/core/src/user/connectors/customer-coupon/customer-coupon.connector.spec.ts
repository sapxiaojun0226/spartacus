import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CustomerCouponAdapter } from './customer-coupon.adapter';
import { CustomerCouponConnector } from './customer-coupon.connector';

const PAGE_SIZE = 5;
const currentPage = 1;
const sort = 'byDate';

class MockUserAdapter implements CustomerCouponAdapter {
  getCustomerCoupons = jest.fn().mockImplementation((userId) =>
    of(`loadList-${userId}`)
  );
  turnOnNotification = jest.fn().mockImplementation((userId) =>
    of(`subscribe-${userId}`)
  );
  turnOffNotification = jest.fn().mockReturnValue(
    of({})
  );
  claimCustomerCoupon = jest.fn().mockImplementation(
    (userId) => of(`claim-${userId}`)
  );
}

describe('CustomerCouponConnector', () => {
  let service: CustomerCouponConnector;
  let adapter: CustomerCouponAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CustomerCouponAdapter, useClass: MockUserAdapter },
      ],
    });

    service = TestBed.inject(CustomerCouponConnector);
    adapter = TestBed.inject(CustomerCouponAdapter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getCustomerCoupons should call adapter', () => {
    let result;
    service
      .getCustomerCoupons('user-id', PAGE_SIZE, currentPage, sort)
      .subscribe((res) => (result = res));
    expect(result).toEqual('loadList-user-id');
    expect(adapter.getCustomerCoupons).toHaveBeenCalledWith(
      'user-id',
      PAGE_SIZE,
      currentPage,
      sort
    );
  });

  it('turnOnNotification should call adapter', () => {
    let result;
    service
      .turnOnNotification('userId', 'couponCode')
      .subscribe((res) => (result = res));
    expect(result).toEqual('subscribe-userId');
    expect(adapter.turnOnNotification).toHaveBeenCalledWith(
      'userId',
      'couponCode'
    );
  });

  it('turnOffNotification should call adapter', () => {
    let result;
    service
      .turnOffNotification('userId', 'couponCode')
      .subscribe((res) => (result = res));
    expect(result).toEqual({});
    expect(adapter.turnOffNotification).toHaveBeenCalledWith(
      'userId',
      'couponCode'
    );
  });

  it('claimCustomerCoupon should call adapter', () => {
    let result;
    service
      .claimCustomerCoupon('userId', 'couponCode')
      .subscribe((res) => (result = res));
    expect(result).toEqual('claim-userId');
    expect(adapter.claimCustomerCoupon).toHaveBeenCalledWith(
      'userId',
      'couponCode'
    );
  });
});
