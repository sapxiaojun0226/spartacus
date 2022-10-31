import { TestBed } from '@angular/core/testing';
import {
  B2BUserRole,
  GlobalMessageService,
  GlobalMessageType,
  RoutingService,
  User,
} from '@spartacus/core';
import { UserAccountFacade } from '@spartacus/user/account/root';
import { of } from 'rxjs';
import { ApproverGuard } from './approver.guard';
import createSpy = jasmine.createSpy;

const mockUserDetails: User = {
  roles: [],
};

class MockUserAccountFacade implements Partial<UserAccountFacade> {
  get = createSpy('get').and.returnValue(of(mockUserDetails));
}

class MockRoutingService implements Partial<RoutingService> {
  go = createSpy('go');
}

class MockGlobalMessageService implements Partial<GlobalMessageService> {
  add = createSpy('add');
}

describe('ApproverGuard', () => {
  let guard: ApproverGuard;
  let routingService: RoutingService;
  let globalMessageService: GlobalMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApproverGuard,
        {
          provide: UserAccountFacade,
          useClass: MockUserAccountFacade,
        },
        {
          provide: RoutingService,
          useClass: MockRoutingService,
        },
        {
          provide: GlobalMessageService,
          useClass: MockGlobalMessageService,
        },
      ],
    });
    guard = TestBed.inject(ApproverGuard);
    routingService = TestBed.inject(RoutingService);
    globalMessageService = TestBed.inject(GlobalMessageService);
  });

  it('should return true when approver role found', () => {
    let result: boolean | undefined;
    mockUserDetails.roles = [B2BUserRole.APPROVER];

    guard
      .canActivate()
      .subscribe((value) => (result = value))
      .unsubscribe();

    expect(result).toEqual(true);
  });

  it('should return true when admin role found', () => {
    let result: boolean | undefined;
    mockUserDetails.roles = [B2BUserRole.ADMIN];

    guard
      .canActivate()
      .subscribe((value) => (result = value))
      .unsubscribe();

    expect(result).toEqual(true);
  });

  it('should return false when admin role not found', () => {
    let result: boolean | undefined;
    mockUserDetails.roles = [B2BUserRole.CUSTOMER];

    guard
      .canActivate()
      .subscribe((value) => (result = value))
      .unsubscribe();

    expect(result).toEqual(false);
  });

  it('should make redirect and show global message when no roles', () => {
    let result: boolean | undefined;
    mockUserDetails.roles = [];

    guard
      .canActivate()
      .subscribe((value) => (result = value))
      .unsubscribe();

    expect(routingService.go).toHaveBeenCalledWith({ cxRoute: 'home' });

    expect(globalMessageService.add).toHaveBeenCalledWith(
      { key: 'orderApprovalGlobal.notification.noSufficientPermissions' },
      GlobalMessageType.MSG_TYPE_WARNING
    );
    expect(result).toEqual(false);
  });
});
