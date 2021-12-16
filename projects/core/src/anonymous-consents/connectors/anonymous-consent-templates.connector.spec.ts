import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { AnonymousConsent, ConsentTemplate } from '../../model/index';
import { AnonymousConsentTemplatesAdapter } from './anonymous-consent-templates.adapter';
import { AnonymousConsentTemplatesConnector } from './anonymous-consent-templates.connector';

class MockAnonymousConsentTemplatesAdapter {
  loadAnonymousConsentTemplates(): Observable<ConsentTemplate[]> {
    return of();
  }
  loadAnonymousConsents(): Observable<AnonymousConsent[]> {
    return of();
  }
}

describe('AnonymousConsentTemplatesConnector', () => {
  let service: AnonymousConsentTemplatesConnector;
  let adapter: AnonymousConsentTemplatesAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AnonymousConsentTemplatesAdapter,
          useClass: MockAnonymousConsentTemplatesAdapter,
        },
      ],
    });

    adapter = TestBed.inject(AnonymousConsentTemplatesAdapter);
    service = TestBed.inject(AnonymousConsentTemplatesConnector);

    jest.spyOn(adapter, 'loadAnonymousConsentTemplates').mockReturnValue(of([]));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadAnonymousConsentTemplates', () => {
    it('should call adapter', () => {
      let result: ConsentTemplate[];
      service
        .loadAnonymousConsentTemplates()
        .subscribe((value) => (result = value))
        .unsubscribe();
      expect(result).toEqual([]);
      expect(adapter.loadAnonymousConsentTemplates).toHaveBeenCalled();
    });
  });

  describe('loadAnonymousConsentTemplates', () => {
    it('should call adapter', () => {
      const mockConsents: AnonymousConsent[] = [{ templateCode: 'test' }];
      jest.spyOn(adapter, 'loadAnonymousConsents').mockReturnValue(of(mockConsents));

      let result: AnonymousConsent[];
      service
        .loadAnonymousConsents()
        .subscribe((value) => (result = value))
        .unsubscribe();
      expect(result).toEqual(mockConsents);
      expect(adapter.loadAnonymousConsents).toHaveBeenCalled();
    });
  });
});
