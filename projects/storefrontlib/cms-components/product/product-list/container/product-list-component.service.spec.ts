import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ActivatedRouterStateSnapshot,
  CurrencyService,
  LanguageService,
  ProductSearchPage,
  ProductSearchService,
  provideDefaultConfig,
  RoutingService,
} from '@spartacus/core';
import { defaultViewConfig, ViewConfig } from '@spartacus/storefront';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { ProductListComponentService } from './product-list-component.service';

class MockRouter {
  navigate = jest.fn();
}

class MockProductSearchService {
  getResults = jest.fn(() => new BehaviorSubject({ products: [] }));
  search = jest.fn();
  clearResults = jest.fn();
}

class MockRoutingService {
  getRouterState = jest.fn(() => mockRoutingState$);
}

const mockDefaultRouterState = {
  url: '/',
  params: {},
  queryParams: {},
} as ActivatedRouterStateSnapshot;

const mockRoutingState$ = new BehaviorSubject({
  state: mockDefaultRouterState,
});

class MockCurrencyService {
  getActive() {
    return of(true);
  }
}
class MockLanguageService {
  getActive() {
    return of(true);
  }
}

describe('ProductListComponentService', () => {
  let service: ProductListComponentService;
  let activatedRoute: ActivatedRoute;
  let productSearchService: ProductSearchService;
  let router: Router;

  function mockRoutingState(state: {
    url?: string;
    params?: object;
    queryParams?: object;
  }) {
    mockRoutingState$.next({
      state: {
        url: state.url || '/',
        params: state.params || {},
        queryParams: state.queryParams || {},
      } as ActivatedRouterStateSnapshot,
    });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductListComponentService,
        { provide: RoutingService, useClass: MockRoutingService },
        { provide: Router, useClass: MockRouter },
        { provide: ActivatedRoute, useValue: 'ActivatedRoute' },
        { provide: ProductSearchService, useClass: MockProductSearchService },
        { provide: CurrencyService, useClass: MockCurrencyService },
        { provide: LanguageService, useClass: MockLanguageService },
        provideDefaultConfig(<ViewConfig>defaultViewConfig),
      ],
    });

    service = TestBed.inject(ProductListComponentService);
    router = TestBed.inject(Router);
    activatedRoute = TestBed.inject(ActivatedRoute);
    productSearchService = TestBed.inject(ProductSearchService);
  });

  it('sort should set query param "sortCode" in the url', () => {
    service.sort('testSortCode');
    expect(router.navigate).toHaveBeenCalledWith([], {
      queryParams: { sortCode: 'testSortCode' },
      queryParamsHandling: 'merge',
      relativeTo: activatedRoute,
    });
  });

  it('should emit new route state when url changes', fakeAsync(() => {
    const mockNewActivatedRouteState = {
      ...mockDefaultRouterState,
      url: '/newRoute',
    };

    let activatedRouteState: ActivatedRouterStateSnapshot;
    const subscription: Subscription = service['searchByRouting$'].subscribe(
      (res) => (activatedRouteState = res)
    );

    tick();
    expect(activatedRouteState).toEqual(mockDefaultRouterState);

    mockRoutingState(mockNewActivatedRouteState);

    tick();
    expect(activatedRouteState).toEqual(mockNewActivatedRouteState);

    subscription.unsubscribe();
  }));

  describe('model$', () => {
    it('should return search results', fakeAsync(() => {
      let result: ProductSearchPage;
      const subscription: Subscription = service.model$.subscribe(
        (res) => (result = res)
      );

      tick();

      subscription.unsubscribe();

      expect(result).toEqual({ products: [] });
    }));

    describe('should perform search on change of routing', () => {
      it('with default "pageSize" 12', fakeAsync(() => {
        const subscription: Subscription = service.model$.subscribe();

        tick();

        subscription.unsubscribe();

        expect(productSearchService.search).toHaveBeenCalledWith(undefined, {
          pageSize: 12,
        });
      }));

      it('param "categoryCode"', fakeAsync(() => {
        mockRoutingState({
          params: { categoryCode: 'testCategory' },
        });

        const subscription: Subscription = service.model$.subscribe();

        tick();

        subscription.unsubscribe();

        expect(productSearchService.search).toHaveBeenCalledWith(
          ':relevance:allCategories:testCategory',
          expect.any(Object)
        );
      }));

      it('param "brandCode"', fakeAsync(() => {
        mockRoutingState({
          params: { brandCode: 'testBrand' },
        });

        const subscription: Subscription = service.model$.subscribe();

        tick();

        subscription.unsubscribe();

        expect(productSearchService.search).toHaveBeenCalledWith(
          ':relevance:allCategories:testBrand',
          expect.any(Object)
        );
      }));

      it('param "query"', fakeAsync(() => {
        mockRoutingState({
          params: { query: 'testQuery' },
        });

        const subscription: Subscription = service.model$.subscribe();

        tick();

        subscription.unsubscribe();

        expect(productSearchService.search).toHaveBeenCalledWith(
          'testQuery',
          expect.any(Object)
        );
      }));

      it('query param "query"', fakeAsync(() => {
        mockRoutingState({
          queryParams: { query: 'testQuery' },
        });

        const subscription: Subscription = service.model$.subscribe();

        tick();

        subscription.unsubscribe();

        expect(productSearchService.search).toHaveBeenCalledWith(
          'testQuery',
          expect.any(Object)
        );
      }));

      it('param "query" and query param "query"', fakeAsync(() => {
        mockRoutingState({
          params: { query: 'testQuery1' },
          queryParams: { query: 'testQuery2' },
        });

        const subscription: Subscription = service.model$.subscribe();

        tick();

        subscription.unsubscribe();

        expect(productSearchService.search).toHaveBeenCalledWith(
          'testQuery2',
          expect.any(Object)
        );
      }));

      it('query param "currentPage"', fakeAsync(() => {
        mockRoutingState({
          params: { query: 'testQuery' },
          queryParams: { currentPage: 123 },
        });

        const subscription: Subscription = service.model$.subscribe();

        tick();

        subscription.unsubscribe();

        expect(productSearchService.search).toHaveBeenCalledWith(
          'testQuery',
          expect.objectContaining({ currentPage: 123 })
        );
      }));

      it('query param "pageSize"', fakeAsync(() => {
        mockRoutingState({
          params: { query: 'testQuery' },
          queryParams: { pageSize: 20 },
        });

        const subscription: Subscription = service.model$.subscribe();

        tick();

        subscription.unsubscribe();

        expect(productSearchService.search).toHaveBeenCalledWith(
          'testQuery',
          expect.objectContaining({ pageSize: 20 })
        );
      }));

      it('query param "sortCode"', fakeAsync(() => {
        mockRoutingState({
          params: { query: 'testQuery' },
          queryParams: { sortCode: 'name-asc' },
        });

        const subscription: Subscription = service.model$.subscribe();

        tick();

        subscription.unsubscribe();

        expect(productSearchService.search).toHaveBeenCalledWith(
          'testQuery',
          expect.objectContaining({ sort: 'name-asc' })
        );
      }));
    });
  });
});
