import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  AnonymousConsent,
  AnonymousConsentsConfig,
  AnonymousConsentsService,
  ANONYMOUS_CONSENT_STATUS,
  ConsentTemplate,
  I18nTestingModule,
} from '@spartacus/core';
import { KeyboardFocusTestingModule } from 'projects/storefrontlib/layout/a11y/keyboard-focus/focus-testing.module';
import { Observable, of } from 'rxjs';
import { LaunchDialogService } from '../../../layout/launch-dialog/index';
import { AnonymousConsentDialogComponent } from './anonymous-consent-dialog.component';

@Component({
  selector: 'cx-spinner',
  template: ` <div>spinner</div> `,
})
class MockCxSpinnerComponent {}

@Component({
  selector: 'cx-icon',
  template: ``,
})
class MockCxIconComponent {
  @Input() type: string;
}

@Component({
  selector: 'cx-consent-management-form',
  template: ``,
})
class MockConsentManagementFormComponent {
  @Input()
  consentTemplate: ConsentTemplate;
  @Input()
  requiredConsents: string[] = [];
  @Input()
  consent: AnonymousConsent;
}

class MockAnonymousConsentsService {
  getTemplates(): Observable<ConsentTemplate[]> {
    return of();
  }
  getConsents(): Observable<AnonymousConsent[]> {
    return of();
  }
  withdrawConsent(_templateCode: string): void {}
  giveConsent(_templateCode: string): void {}
  isConsentGiven(_consent: AnonymousConsent): boolean {
    return true;
  }
  isConsentWithdrawn(_consent: AnonymousConsent): boolean {
    return true;
  }
  getLoadTemplatesLoading(): Observable<boolean> {
    return of(false);
  }
}

class MockLaunchDialogService {
  closeDialog() {}
}

const mockTemplates: ConsentTemplate[] = [
  { id: 'MARKETING' },
  { id: 'PERSONALIZATION' },
];

describe('AnonymousConsentsDialogComponent', () => {
  let component: AnonymousConsentDialogComponent;
  let fixture: ComponentFixture<AnonymousConsentDialogComponent>;
  let anonymousConsentsService: AnonymousConsentsService;
  let anonymousConsentsConfig: AnonymousConsentsConfig;
  let launchDialogService: LaunchDialogService;

  beforeEach(
    waitForAsync(() => {
      const mockConfig: AnonymousConsentsConfig = {
        anonymousConsents: { showLegalDescriptionInDialog: true },
      };

      TestBed.configureTestingModule({
        imports: [I18nTestingModule, KeyboardFocusTestingModule],
        declarations: [
          AnonymousConsentDialogComponent,
          MockCxIconComponent,
          MockConsentManagementFormComponent,
          MockCxSpinnerComponent,
        ],
        providers: [
          {
            provide: AnonymousConsentsService,
            useClass: MockAnonymousConsentsService,
          },
          {
            provide: AnonymousConsentsConfig,
            useValue: mockConfig,
          },
          {
            provide: LaunchDialogService,
            useClass: MockLaunchDialogService,
          },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AnonymousConsentDialogComponent);
    component = fixture.componentInstance;
    anonymousConsentsService = TestBed.inject(AnonymousConsentsService);
    anonymousConsentsConfig = TestBed.inject(AnonymousConsentsConfig);
    launchDialogService = TestBed.inject(LaunchDialogService);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set templates$ and consents$', () => {
      jest.spyOn(anonymousConsentsService, 'getTemplates').mockImplementation();
      jest.spyOn(anonymousConsentsService, 'getConsents').mockImplementation();

      component.ngOnInit();
      expect(anonymousConsentsService.getTemplates).toHaveBeenCalled();
      expect(anonymousConsentsService.getConsents).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should call modalService.closeActiveModal', () => {
      jest
        .spyOn(launchDialogService, 'closeDialog')
        .mockImplementation(() => {});

      component.close('xxx');

      expect(launchDialogService.closeDialog).toHaveBeenCalledWith('xxx');
    });
  });

  describe('rejectAll', () => {
    const mockConsent: AnonymousConsent[] = [
      {
        templateCode: mockTemplates[0].id,
        consentState: ANONYMOUS_CONSENT_STATUS.GIVEN,
      },
      {
        templateCode: mockTemplates[1].id,
        consentState: ANONYMOUS_CONSENT_STATUS.GIVEN,
      },
    ];
    describe('when a required consent is present', () => {
      it('should skip it', () => {
        anonymousConsentsConfig.anonymousConsents.requiredConsents = [
          mockTemplates[0].id,
        ];
        jest.spyOn(component, 'close').mockImplementation();
        jest
          .spyOn(anonymousConsentsService, 'isConsentGiven')
          .and.returnValues(true, true);
        jest
          .spyOn(anonymousConsentsService, 'withdrawConsent')
          .mockImplementation();
        jest
          .spyOn(anonymousConsentsService, 'getTemplates')
          .mockReturnValue(of(mockTemplates));
        jest
          .spyOn(anonymousConsentsService, 'getConsents')
          .mockReturnValue(of(mockConsent));

        component.ngOnInit();
        component.rejectAll();

        expect(anonymousConsentsService.withdrawConsent).toHaveBeenCalledTimes(
          1
        );
        expect(component.close).toHaveBeenCalledWith('rejectAll');
      });
    });
    describe('when no required consent is present', () => {
      it('should call withdrawAllConsents and close the modal dialog', () => {
        jest.spyOn(component, 'close').mockImplementation();
        jest
          .spyOn(anonymousConsentsService, 'isConsentGiven')
          .and.returnValues(true, true);
        jest
          .spyOn(anonymousConsentsService, 'withdrawConsent')
          .mockImplementation();
        jest
          .spyOn(anonymousConsentsService, 'getTemplates')
          .mockReturnValue(of(mockTemplates));
        jest
          .spyOn(anonymousConsentsService, 'getConsents')
          .mockReturnValue(of(mockConsent));

        component.ngOnInit();
        component.rejectAll();

        expect(anonymousConsentsService.withdrawConsent).toHaveBeenCalledTimes(
          mockTemplates.length
        );
        expect(component.close).toHaveBeenCalledWith('rejectAll');
      });
    });
  });

  describe('allowAll', () => {
    const mockConsents: AnonymousConsent[] = [
      {
        templateCode: mockTemplates[0].id,
        consentState: ANONYMOUS_CONSENT_STATUS.WITHDRAWN,
      },
      {
        templateCode: mockTemplates[1].id,
        consentState: ANONYMOUS_CONSENT_STATUS.WITHDRAWN,
      },
    ];
    describe('when a required consent is present', () => {
      it('should skip it', () => {
        anonymousConsentsConfig.anonymousConsents.requiredConsents = [
          mockTemplates[0].id,
        ];
        jest.spyOn(component, 'close').mockImplementation();
        jest
          .spyOn(anonymousConsentsService, 'isConsentWithdrawn')
          .and.returnValues(true, true);
        jest
          .spyOn(anonymousConsentsService, 'giveConsent')
          .mockImplementation();
        jest
          .spyOn(anonymousConsentsService, 'getTemplates')
          .mockReturnValue(of(mockTemplates));
        jest
          .spyOn(anonymousConsentsService, 'getConsents')
          .mockReturnValue(of(mockConsents));

        component.ngOnInit();
        component.allowAll();

        expect(anonymousConsentsService.giveConsent).toHaveBeenCalledTimes(1);
        expect(component.close).toHaveBeenCalledWith('allowAll');
      });
    });
    describe('when no required consent is present', () => {
      it('should call giveConsent for each consent and close the modal dialog', () => {
        jest.spyOn(component, 'close').mockImplementation();
        jest
          .spyOn(anonymousConsentsService, 'isConsentWithdrawn')
          .and.returnValues(true, true);
        jest
          .spyOn(anonymousConsentsService, 'giveConsent')
          .mockImplementation();
        jest
          .spyOn(anonymousConsentsService, 'getTemplates')
          .mockReturnValue(of(mockTemplates));
        jest
          .spyOn(anonymousConsentsService, 'getConsents')
          .mockReturnValue(of(mockConsents));

        component.ngOnInit();
        component.allowAll();

        expect(anonymousConsentsService.giveConsent).toHaveBeenCalledTimes(
          mockTemplates.length
        );
        expect(component.close).toHaveBeenCalledWith('allowAll');
      });
    });
    describe('when the consents have null state', () => {
      it('should be able to give consents and close the dialog', () => {
        const nullStateMockConsents: AnonymousConsent[] = [
          {
            templateCode: mockTemplates[0].id,
            consentState: null,
          },
          {
            templateCode: mockTemplates[1].id,
            consentState: null,
          },
        ];

        jest.spyOn(component, 'close').mockImplementation();
        jest
          .spyOn(anonymousConsentsService, 'isConsentWithdrawn')
          .and.returnValues(true, true);
        jest
          .spyOn(anonymousConsentsService, 'giveConsent')
          .mockImplementation();
        jest
          .spyOn(anonymousConsentsService, 'getTemplates')
          .mockReturnValue(of(mockTemplates));
        jest
          .spyOn(anonymousConsentsService, 'getConsents')
          .mockReturnValue(of(nullStateMockConsents));

        component.ngOnInit();
        component.allowAll();

        expect(anonymousConsentsService.giveConsent).toHaveBeenCalledTimes(
          mockTemplates.length
        );
        expect(component.close).toHaveBeenCalledWith('allowAll');
      });
    });
  });

  const isRequiredConsentMethod = 'isRequiredConsent';
  describe(isRequiredConsentMethod, () => {
    describe('when the requiredConsents is NOT configured', () => {
      it('should return false', () => {
        anonymousConsentsConfig.anonymousConsents.requiredConsents = undefined;
        const result = component[isRequiredConsentMethod](mockTemplates[0]);
        expect(result).toEqual(false);
      });
    });
    describe('when the requiredConsents is configured', () => {
      it('should return true', () => {
        anonymousConsentsConfig.anonymousConsents.requiredConsents = [
          mockTemplates[0].id,
        ];
        const result = component[isRequiredConsentMethod](mockTemplates[0]);
        expect(result).toEqual(true);
      });
    });
  });

  describe('onConsentChange', () => {
    describe('when the consent was given', () => {
      it('should call giveConsent', () => {
        jest
          .spyOn(anonymousConsentsService, 'giveConsent')
          .mockImplementation();
        component.onConsentChange({ given: true, template: mockTemplates[0] });
        expect(anonymousConsentsService.giveConsent).toHaveBeenCalledWith(
          mockTemplates[0].id
        );
      });
    });
    describe('when the consent was withdrawn', () => {
      it('should call withdrawConsent', () => {
        jest
          .spyOn(anonymousConsentsService, 'withdrawConsent')
          .mockImplementation();
        component.onConsentChange({ given: false, template: mockTemplates[0] });
        expect(anonymousConsentsService.withdrawConsent).toHaveBeenCalledWith(
          mockTemplates[0].id
        );
      });
    });
  });

  describe('getCorrespondingConsent', () => {
    it('should return null if no consent matches the provided template', () => {
      expect(component.getCorrespondingConsent(mockTemplates[0], [])).toEqual(
        null
      );
    });
    it('should return the corresponding consent', () => {
      const mockConsents: AnonymousConsent[] = [
        { templateCode: 'XXX' },
        { templateCode: 'MARKETING' },
      ];
      expect(
        component.getCorrespondingConsent(mockTemplates[0], mockConsents)
      ).toEqual(mockConsents[1]);
    });
  });

  describe('ngOnDestroy', () => {
    it('should call unsubscribe', () => {
      jest
        .spyOn<any>(component['subscriptions'], 'unsubscribe')
        .mockImplementation();
      component.ngOnDestroy();
      expect(component['subscriptions'].unsubscribe).toHaveBeenCalled();
    });
  });
});
