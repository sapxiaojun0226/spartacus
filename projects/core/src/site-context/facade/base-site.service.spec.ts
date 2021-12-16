import { TestBed } from '@angular/core/testing';
import { EffectsModule } from '@ngrx/effects';
import * as ngrxStore from '@ngrx/store';
import { Store, StoreModule } from '@ngrx/store';
import {
  SiteConnector,
  SiteContextConfig,
  StateWithSiteContext,
} from '@spartacus/core';
import { of } from 'rxjs';
import { SiteAdapter } from '../connectors/site.adapter';
import { SiteContextActions } from '../store/actions/index';
import { SiteContextStoreModule } from '../store/site-context-store.module';
import { BaseSiteService } from './base-site.service';

const mockActiveBaseSiteUid = 'mock-active-base-site-uid';
const mockActiveBaseSiteUidSelect = jest.fn().mockReturnValue(() =>
  of(mockActiveBaseSiteUid)
);
const mockBaseSitesSelect = jest.fn().mockReturnValue(() =>
  of([{ uid: 'mock-active-base-site-uid' }, { uid: 'test-baseSite' }])
);

const mockSiteContextConfig: SiteContextConfig = {
  context: {
    baseSite: ['electronics-spa'],
  },
};

describe('BaseSiteService', () => {
  let service: BaseSiteService;
  let store: Store<StateWithSiteContext>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        SiteContextStoreModule,
      ],
      providers: [
        BaseSiteService,
        {
          provide: SiteAdapter,
          useValue: {},
        },
        { provide: SiteContextConfig, useValue: mockSiteContextConfig },
      ],
    });
    store = TestBed.inject(Store);
    jest.spyOn(store, 'dispatch').mockImplementation();
    service = TestBed.inject(BaseSiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getActive should return active baseSite uid', () => {
    jest.spyOn(ngrxStore, 'select').and.returnValues(
      mockActiveBaseSiteUidSelect
    );

    let result;
    service.getActive().subscribe((res) => (result = res));

    expect(result).toEqual(mockActiveBaseSiteUid);
  });

  it('getAll should return all base sites data', () => {
    jest.spyOn(ngrxStore, 'select').and.returnValues(mockBaseSitesSelect);

    let result;
    service.getAll().subscribe((res) => (result = res));
    expect(result.length).toEqual(2);
  });

  it('getAll should load all base sites data if they do not exist', () => {
    jest.spyOn(ngrxStore, 'select').mockImplementation(
      jest.fn().mockReturnValue(() => of(null))
    );

    service.getAll().subscribe();
    expect(store.dispatch).toHaveBeenCalledWith(
      new SiteContextActions.LoadBaseSites()
    );
  });

  describe('setActive', () => {
    it('should dispatch SetActiveBaseSite action', () => {
      jest.spyOn(ngrxStore, 'select').mockReturnValue(
        mockActiveBaseSiteUidSelect
      );
      const connector = TestBed.inject(SiteConnector);
      jest.spyOn(connector, 'getBaseSite').mockReturnValue(of({}));
      service.setActive('my-base-site');
      expect(store.dispatch).toHaveBeenCalledWith(
        new SiteContextActions.SetActiveBaseSite('my-base-site')
      );
    });

    it('should not dispatch SetActiveBaseSite action if not changed', () => {
      jest.spyOn(ngrxStore, 'select').mockReturnValue(
        mockActiveBaseSiteUidSelect
      );
      service.setActive(mockActiveBaseSiteUid);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  it('get should return active baseSite data if no siteUid given', () => {
    jest.spyOn(ngrxStore, 'select').mockReturnValueOnce(mockActiveBaseSiteUidSelect).mockReturnValueOnce(mockBaseSitesSelect);

    let result;
    service.get().subscribe((res) => (result = res));
    expect(result).toEqual({ uid: 'mock-active-base-site-uid' });
  });

  it('get should return baseSite data based on the siteUid', () => {
    jest.spyOn(ngrxStore, 'select').mockReturnValue(mockBaseSitesSelect);

    let result;
    service.get('test-baseSite').subscribe((res) => (result = res));
    expect(result).toEqual({ uid: 'test-baseSite' });
  });

  describe('isInitialized', () => {
    it('should return TRUE if a base site is initialized', () => {
      jest.spyOn(ngrxStore, 'select').mockReturnValue(mockBaseSitesSelect);
      expect(service.isInitialized()).toBeTruthy();
    });
  });

  describe('isValid', () => {
    it('should return TRUE if the base site is valid', () => {
      expect(service['isValid']('electronics-spa')).toBeTruthy();
    });
    it('should return FALSE if the base site is not valid', () => {
      expect(service['isValid']('something-else')).toBeFalsy();
    });
  });
});
