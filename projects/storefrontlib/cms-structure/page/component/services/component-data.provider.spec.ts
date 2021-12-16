import { TestBed } from '@angular/core/testing';
import { CmsComponent, CmsService } from '@spartacus/core';
import { BehaviorSubject, of } from 'rxjs';
import { CmsComponentsService } from '../../../services/cms-components.service';
import { ComponentDataProvider } from './component-data.provider';

class MockCmsComponentsService {
  getStaticData() {
    return of({});
  }
}

class MockCmsService {
  getComponentData() {
    return of({});
  }
}

describe('ComponentDataProvider', () => {
  let service: ComponentDataProvider;
  let cmsComponentsService: CmsComponentsService;
  let cmsService: CmsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CmsComponentsService,
          useClass: MockCmsComponentsService,
        },
        {
          provide: CmsService,
          useClass: MockCmsService,
        },
      ],
    });
    service = TestBed.inject(ComponentDataProvider);
    cmsComponentsService = TestBed.inject(CmsComponentsService);
    cmsService = TestBed.inject(CmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load data from cms service', () => {
    jest.spyOn(cmsService, 'getComponentData').mockImplementation(() => {});
    service.get('123').subscribe().unsubscribe();
    expect(cmsService.getComponentData).toHaveBeenCalledWith('123');
  });

  it('should not load data from cms service if uid is not probvided', () => {
    jest.spyOn(cmsService, 'getComponentData').mockImplementation(() => {});
    service.get('', 'BannerComponent').subscribe().unsubscribe();
    expect(cmsService.getComponentData).not.toHaveBeenCalled();
  });

  it('should return component data', () => {
    jest
      .spyOn(cmsService, 'getComponentData')
      .mockReturnValue(of({ foo: 'bar' } as any));
    let result;
    service
      .get('123')
      .subscribe((data) => (result = data))
      .unsubscribe();
    expect(result.foo).toEqual('bar');
  });

  it('should load static data for component type', () => {
    jest
      .spyOn(cmsComponentsService, 'getStaticData')
      .mockImplementation(() => {});
    service.get('123', 'BannerComponent').subscribe().unsubscribe();
    expect(cmsComponentsService.getStaticData).toHaveBeenCalledWith(
      'BannerComponent'
    );
  });

  it('should load static data for component type when uid is not provided', () => {
    jest
      .spyOn(cmsComponentsService, 'getStaticData')
      .mockImplementation(() => {});
    service.get('', 'BannerComponent').subscribe().unsubscribe();
    expect(cmsComponentsService.getStaticData).toHaveBeenCalledWith(
      'BannerComponent'
    );
  });

  it('should not load static data when type is not provided', () => {
    jest
      .spyOn(cmsComponentsService, 'getStaticData')
      .mockImplementation(() => {});
    service.get('123').subscribe().unsubscribe();
    expect(cmsComponentsService.getStaticData).not.toHaveBeenCalled();
  });

  it('should return static data', () => {
    jest.spyOn(cmsComponentsService, 'getStaticData').mockReturnValue({
      foo: 'bar',
    } as any);
    let result;
    service
      .get('123', 'BannerComponent')
      .subscribe((data) => (result = data))
      .unsubscribe();
    expect(result.foo).toEqual('bar');
  });

  it('should complete the stream if uid and static data is not provided', () => {
    jest
      .spyOn(cmsComponentsService, 'getStaticData')
      .mockReturnValue(undefined);
    let result;
    let complete = false;
    service
      .get('', 'BannerComponent')
      .subscribe(
        (data) => (result = data),
        undefined,
        () => (complete = true)
      )
      .unsubscribe();
    expect(result).toEqual(undefined);
    expect(complete).toEqual(true);
  });

  it('should merge static and component data', () => {
    jest.spyOn(cmsComponentsService, 'getStaticData').mockReturnValue({
      foo: 'bar',
    } as any);
    jest
      .spyOn(cmsService, 'getComponentData')
      .mockReturnValue(of({ bar: 'foo' } as any));
    let result;
    service
      .get('123', 'BannerComponent')
      .subscribe((data) => (result = data))
      .unsubscribe();
    expect(result.foo).toEqual('bar');
    expect(result.bar).toEqual('foo');
  });

  it('should override static data with component data', () => {
    jest
      .spyOn(cmsService, 'getComponentData')
      .mockReturnValue(of({ foo: 'not-bar' } as any));
    jest.spyOn(cmsComponentsService, 'getStaticData').mockReturnValue({
      foo: 'bar',
    } as any);
    let result;
    service
      .get('123', 'BannerComponent')
      .subscribe((data) => (result = data))
      .unsubscribe();
    expect(result.foo).toEqual('not-bar');
  });

  it('should start with static data', () => {
    const data$: BehaviorSubject<CmsComponent> = new BehaviorSubject(null);
    jest
      .spyOn(cmsService, 'getComponentData')
      .and.returnValues(data$.asObservable());
    jest.spyOn(cmsComponentsService, 'getStaticData').mockReturnValue({
      foo: 'bar',
    } as any);
    let result;
    const sub = service
      .get('123', 'BannerComponent')
      .subscribe((data) => (result = data));

    expect(result.foo).toEqual('bar');
    data$.next({ foo: 'not-bar' } as CmsComponent);
    expect(result.foo).toEqual('not-bar');

    sub.unsubscribe();
  });
});
