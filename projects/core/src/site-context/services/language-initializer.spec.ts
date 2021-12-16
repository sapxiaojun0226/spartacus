import { TestBed } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { ConfigInitializerService } from '../../config';
import { SiteContextConfig } from '../config/site-context-config';
import { LanguageService } from '../facade/language.service';
import { LanguageInitializer } from './language-initializer';
import { LanguageStatePersistenceService } from './language-state-persistence.service';

const mockSiteContextConfig: SiteContextConfig = {
  context: {
    language: ['ja'],
  },
};

class MockLanguageService implements Partial<LanguageService> {
  isInitialized() {
    return false;
  }
  setActive = jest.fn().mockImplementation();
}

class MockLanguageStatePersistenceService
  implements Partial<LanguageStatePersistenceService>
{
  initSync = jest.fn().mockReturnValue(of(EMPTY));
}

class MockConfigInitializerService
  implements Partial<ConfigInitializerService>
{
  getStable = () => of(mockSiteContextConfig);
}

describe('LanguageInitializer', () => {
  let initializer: LanguageInitializer;
  let languageService: LanguageService;
  let languageStatePersistenceService: LanguageStatePersistenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LanguageInitializer,
        { provide: LanguageService, useClass: MockLanguageService },
        {
          provide: LanguageStatePersistenceService,
          useClass: MockLanguageStatePersistenceService,
        },
        {
          provide: ConfigInitializerService,
          useClass: MockConfigInitializerService,
        },
      ],
    });

    languageStatePersistenceService = TestBed.inject(
      LanguageStatePersistenceService
    );
    languageService = TestBed.inject(LanguageService);
    initializer = TestBed.inject(LanguageInitializer);
  });

  it('should be created', () => {
    expect(initializer).toBeTruthy();
  });

  describe('initialize', () => {
    it('should call LanguageStatePersistenceService initSync()', () => {
      jest.spyOn<any>(initializer, 'setFallbackValue').mockReturnValue(of(null));
      initializer.initialize();
      expect(languageStatePersistenceService.initSync).toHaveBeenCalled();
      expect(initializer['setFallbackValue']).toHaveBeenCalled();
    });

    it('should set default from config is the language is NOT initialized', () => {
      initializer.initialize();
      expect(languageService.setActive).toHaveBeenCalledWith('ja');
    });

    it('should NOT set default from config is the language is initialized', () => {
      jest.spyOn(languageService, 'isInitialized').mockReturnValue(true);
      initializer.initialize();
      expect(languageService.setActive).not.toHaveBeenCalled();
    });
  });
});
