import * as AngularCore from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { i18n } from 'i18next';
import { first, take } from 'rxjs/operators';
import { I18nConfig } from '../config/i18n-config';
import { TranslationChunkService } from '../translation-chunk.service';
import { I18NEXT_INSTANCE } from './i18next-instance';
import { I18nextTranslationService } from './i18next-translation.service';

const testKey = 'testKey';
const testOptions = 'testOptions';
const nonBreakingSpace = String.fromCharCode(160);

describe('I18nextTranslationService', () => {
  let service: I18nextTranslationService;
  let i18next: i18n;

  beforeEach(() => {
    const mockTranslationChunk = {
      getChunkNameForKey: jest.fn(() => 'testChunk'),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: I18nConfig, useValue: { production: false } },
        {
          provide: TranslationChunkService,
          useValue: mockTranslationChunk,
        },
        I18nextTranslationService,
      ],
    });

    service = TestBed.inject(I18nextTranslationService);
    i18next = TestBed.inject(I18NEXT_INSTANCE);
  });

  describe('loadChunks', () => {
    it('should return result of i18next.loadChunks', () => {
      const expectedResult = new Promise(() => {});
      jest.spyOn(i18next, 'loadNamespaces').mockReturnValue(expectedResult as any);
      const chunks = ['chunk1', 'chunk2'];
      const result = service.loadChunks(chunks);
      expect(i18next.loadNamespaces).toHaveBeenCalledWith(chunks);
      expect(result).toBe(expectedResult);
    });
  });

  describe('translate', () => {
    beforeEach(() => {
      i18next.isInitialized = true;
    });

    describe(', when key exists,', () => {
      beforeEach(() => {
        jest.spyOn(i18next, 'exists').mockReturnValue(true);
      });

      it('should emit result of i18next.t', () => {
        jest.spyOn(i18next, 't').mockReturnValue('value');
        let result;
        service
          .translate(testKey, testOptions)
          .pipe(first())
          .subscribe((x) => (result = x));

        expect(i18next.t).toHaveBeenCalledWith(
          'testChunk:testKey',
          testOptions
        );
        expect(result).toBe('value');
      });
    });

    describe(', when key does NOT exist,', () => {
      beforeEach(() => {
        jest.spyOn(i18next, 'exists').mockReturnValue(false);
        jest.spyOn(i18next, 'loadNamespaces').mockReturnValue(new Promise(() => {}));
      });

      it('should emit non-breaking space if whitespaceUntilLoaded is true', () => {
        let result;
        service
          .translate(testKey, testOptions, true)
          .pipe(first())
          .subscribe((x) => (result = x));
        expect(result).toBe(nonBreakingSpace);
      });

      it('should NOT emit any value if whitespaceUntilLoaded is false', () => {
        let result = 'initial value';
        service
          .translate(testKey, testOptions, false)
          .pipe(first())
          .subscribe((x) => (result = x));
        expect(result).toBe('initial value');
      });

      it('should load chunk of key', () => {
        service.translate(testKey, testOptions).pipe(first()).subscribe();

        expect(i18next.loadNamespaces).toHaveBeenCalledWith(
          'testChunk',
          expect.any(Function)
        );
      });
    });

    describe(', when key does NOT exist even after chunk was loaded,', () => {
      beforeEach(() => {
        jest.spyOn(i18next, 'exists').and.returnValues(false, false);
        jest.spyOn(i18next, 'loadNamespaces').mockImplementation(((
          _namespaces,
          onChunkLoad
        ) => onChunkLoad()) as any);
      });

      it('should emit key in brackets for non-production', () => {
        let result;
        service
          .translate(testKey, testOptions)
          .pipe(first())
          .subscribe((x) => (result = x));
        expect(result).toBe(`[testChunk:testKey]`);
      });

      it('should return non-breaking space for production', () => {
        jest.spyOn(AngularCore, 'isDevMode').mockImplementation(() => false);
        let result;
        service
          .translate(testKey, testOptions)
          .pipe(first())
          .subscribe((x) => (result = x));
        expect(result).toBe(nonBreakingSpace);
      });
    });

    describe(', when key does NOT exist firstly, but it comes with loaded chunk,', () => {
      beforeEach(() => {
        jest.spyOn(i18next, 'exists').and.returnValues(false, true);
        jest.spyOn(i18next, 'loadNamespaces').mockImplementation(((
          _namespaces,
          onChunkLoad
        ) => onChunkLoad()) as any);
      });

      it('should emit result of i18next.t', () => {
        jest.spyOn(i18next, 't').mockReturnValue('value');
        let result;
        service
          .translate(testKey, testOptions)
          .pipe(first())
          .subscribe((x) => (result = x));
        expect(i18next.t).toHaveBeenCalledWith(
          'testChunk:testKey',
          testOptions
        );
        expect(result).toBe('value');
      });
    });

    describe(', when language changed,', () => {
      it('should emit result of i18next.t in new language', () => {
        let languageChangedCallback;
        jest.spyOn(i18next, 'off').mockImplementation(() => {});
        jest.spyOn(i18next, 'on').mockImplementation(
          (_event, callback) => (languageChangedCallback = callback)
        );
        jest.spyOn(i18next, 'exists').mockReturnValue(true);
        jest.spyOn(i18next, 't').and.returnValues('value1', 'value2');

        let result;
        service
          .translate(testKey, testOptions)
          .pipe(take(2))
          .subscribe((x) => (result = x));
        expect(result).toBe('value1');

        languageChangedCallback();
        expect(result).toBe('value2');

        expect(i18next.off).toHaveBeenCalledWith(
          'languageChanged',
          languageChangedCallback
        );
      });
    });
  });
});
