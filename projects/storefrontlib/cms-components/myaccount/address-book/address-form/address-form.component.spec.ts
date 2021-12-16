import { ChangeDetectionStrategy, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  Address,
  AddressValidation,
  Country,
  GlobalMessageService,
  I18nTestingModule,
  Region,
  Title,
  UserAddressService,
  UserService,
} from '@spartacus/core';
import { Observable, of, Subscription } from 'rxjs';
import { ModalService } from '../../../../shared/components/modal/index';
import { FormErrorsModule } from '../../../../shared/index';
import { AddressFormComponent } from './address-form.component';
import createSpy = jest.fn;

class MockUserService {
  getTitles(): Observable<Title[]> {
    return of();
  }

  loadTitles(): void {}
}

class MockUserAddressService {
  getDeliveryCountries(): Observable<Country[]> {
    return of();
  }

  loadDeliveryCountries(): void {}

  getRegions(): Observable<Region[]> {
    return of();
  }

  getAddresses(): Observable<Address[]> {
    return of([]);
  }
  verifyAddress(): Observable<AddressValidation> {
    return of({});
  }
}

const mockTitles: Title[] = [
  {
    code: 'mr',
    name: 'Mr.',
  },
  {
    code: 'mrs',
    name: 'Mrs.',
  },
];
const expectedTitles: Title[] = [
  { code: '', name: 'addressForm.defaultTitle' },
  ...mockTitles,
];
const mockCountries: Country[] = [
  {
    isocode: 'AD',
    name: 'Andorra',
  },
  {
    isocode: 'RS',
    name: 'Serbia',
  },
];

const mockRegions: Region[] = [
  {
    isocode: 'CA-ON',
    name: 'Ontario',
  },
  {
    isocode: 'CA-QC',
    name: 'Quebec',
  },
];

const mockAddress: Address = {
  firstName: 'John',
  lastName: 'Doe',
  titleCode: 'mr',
  line1: 'Toyosaki 2 create on cart',
  line2: 'line2',
  town: 'town',
  region: { isocode: 'JP-27' },
  postalCode: 'zip',
  country: { isocode: 'JP' },
  phone: '123123123',
  defaultAddress: false,
};

const mockSuggestedAddressModalRef: any = {
  componentInstance: {
    enteredAddress: '',
    suggestedAddresses: '',
  },
  result: new Promise((resolve) => {
    return resolve(true);
  }),
};

class MockModalService {
  open(): any {
    return mockSuggestedAddressModalRef;
  }
}

describe('AddressFormComponent', () => {
  let component: AddressFormComponent;
  let fixture: ComponentFixture<AddressFormComponent>;
  let controls: FormGroup['controls'];

  let userAddressService: UserAddressService;
  let userService: UserService;
  let mockGlobalMessageService: any;

  const defaultAddressCheckbox = (): DebugElement =>
    fixture.debugElement.query(By.css('[formcontrolname=defaultAddress]'));

  beforeEach(
    waitForAsync(() => {
      mockGlobalMessageService = {
        add: createSpy(),
      };

      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          NgSelectModule,
          I18nTestingModule,
          FormErrorsModule,
        ],
        declarations: [AddressFormComponent],
        providers: [
          { provide: ModalService, useValue: { open: () => {} } },
          { provide: UserService, useClass: MockUserService },
          { provide: UserAddressService, useClass: MockUserAddressService },
          { provide: GlobalMessageService, useValue: mockGlobalMessageService },
          { provide: ModalService, useClass: MockModalService },
        ],
      })
        .overrideComponent(AddressFormComponent, {
          set: { changeDetection: ChangeDetectionStrategy.Default },
        })
        .compileComponents();

      userService = TestBed.inject(UserService);
      userAddressService = TestBed.inject(UserAddressService);
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressFormComponent);
    component = fixture.componentInstance;
    controls = component.addressForm.controls;
    component.showTitleCode = true;

    jest.spyOn(component.submitAddress, 'emit');
    jest.spyOn(component.backToAddress, 'emit');
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnInit to get countries data even when they not exist', (done) => {
    jest
      .spyOn(userAddressService, 'getDeliveryCountries')
      .mockReturnValue(of([]));
    jest
      .spyOn(userAddressService, 'loadDeliveryCountries')
      .mockImplementation();

    jest.spyOn(userAddressService, 'getRegions').mockReturnValue(of([]));

    jest.spyOn(userAddressService, 'getAddresses').mockReturnValue(of([]));

    component.ngOnInit();

    component.countries$
      .subscribe(() => {
        expect(userAddressService.loadDeliveryCountries).toHaveBeenCalled();
        done();
      })
      .unsubscribe();
  });

  it('should call ngOnInit to get countries, titles and regions data when data exist', () => {
    jest
      .spyOn(userAddressService, 'getDeliveryCountries')
      .mockReturnValue(of(mockCountries));
    jest.spyOn(userService, 'getTitles').mockReturnValue(of(mockTitles));
    jest
      .spyOn(userAddressService, 'getRegions')
      .mockReturnValue(of(mockRegions));

    component.ngOnInit();

    let countries: Country[];
    component.countries$
      .subscribe((data) => {
        countries = data;
      })
      .unsubscribe();
    let titles: Title[];
    component.titles$
      .subscribe((data) => {
        titles = data;
      })
      .unsubscribe();
    let regions: Region[];
    component.regions$
      .subscribe((data) => {
        regions = data;
      })
      .unsubscribe();

    expect(countries).toBe(mockCountries);
    expect(titles).toEqual(expectedTitles);
    expect(regions).toBe(mockRegions);
  });

  it('should add address with address verification result "accept"', () => {
    jest
      .spyOn(userAddressService, 'getDeliveryCountries')
      .mockReturnValue(of([]));
    jest.spyOn(userService, 'getTitles').mockReturnValue(of([]));
    jest.spyOn(userAddressService, 'getRegions').mockReturnValue(of([]));

    const mockAddressVerificationResult: AddressValidation = {
      decision: 'ACCEPT',
    };

    jest.spyOn(component, 'openSuggestedAddress').mockImplementation(() => {});
    component.ngOnInit();
    component['handleAddressVerificationResults'](
      mockAddressVerificationResult
    );
    expect(component.submitAddress.emit).toHaveBeenCalledWith(
      component.addressForm.value
    );
  });

  it('should dispplay error message on address verification result "reject"', () => {
    jest
      .spyOn(userAddressService, 'getDeliveryCountries')
      .mockReturnValue(of([]));
    jest.spyOn(userService, 'getTitles').mockReturnValue(of([]));
    jest.spyOn(userAddressService, 'getRegions').mockReturnValue(of([]));

    const mockAddressVerificationResult: AddressValidation = {
      decision: 'REJECT',
      errors: {
        errors: [{ subject: 'No' }],
      },
    };
    component['handleAddressVerificationResults'](
      mockAddressVerificationResult
    );

    jest.spyOn(component, 'openSuggestedAddress').mockImplementation(() => {});
    component.ngOnInit();
    mockAddressVerificationResult.errors.errors = [{ subject: 'titleCode' }];
    component.ngOnInit();
    expect(mockGlobalMessageService.add).toHaveBeenCalled();
  });

  it('should open suggested address with address verification result "review"', () => {
    jest
      .spyOn(userAddressService, 'getDeliveryCountries')
      .mockReturnValue(of([]));
    jest.spyOn(userService, 'getTitles').mockReturnValue(of([]));
    jest.spyOn(userAddressService, 'getRegions').mockReturnValue(of([]));

    const mockAddressVerificationResult: AddressValidation = {
      decision: 'REVIEW',
    };

    jest.spyOn(component, 'openSuggestedAddress').mockImplementation(() => {});
    component.ngOnInit();
    component['handleAddressVerificationResults'](
      mockAddressVerificationResult
    );
    expect(component.openSuggestedAddress).toHaveBeenCalledWith(
      mockAddressVerificationResult
    );
  });

  it('should call verifyAddress() when address has some changes', () => {
    jest.spyOn(userAddressService, 'verifyAddress').mockReturnValue(
      of({
        decision: 'ACCEPT',
      })
    );
    component.ngOnInit();
    component.addressForm.setValue(mockAddress);
    component.addressForm.markAsDirty();
    component.verifyAddress();

    expect(userAddressService.verifyAddress).toHaveBeenCalled();
  });

  it('should not call verifyAddress() when address does not have change', () => {
    jest.spyOn(userAddressService, 'verifyAddress').mockImplementation();
    component.ngOnInit();
    component.addressForm.setValue(mockAddress);
    component.verifyAddress();
    expect(userAddressService.verifyAddress).not.toHaveBeenCalled();
  });

  it('should call back()', () => {
    component.back();
    expect(component.backToAddress.emit).toHaveBeenCalledWith();
  });

  it('should toggleDefaultAddress() adapt control value', () => {
    component.setAsDefaultField = true;
    jest
      .spyOn(userAddressService, 'getAddresses')
      .mockReturnValue(of([mockAddress]));

    fixture.detectChanges();
    defaultAddressCheckbox().nativeElement.click();

    expect(component.addressForm.value.defaultAddress).toBeTruthy();
  });

  it('should call countrySelected()', () => {
    jest.spyOn(userAddressService, 'getRegions').mockReturnValue(of([]));
    const mockCountryIsocode = 'test country isocode';
    component.countrySelected({ isocode: mockCountryIsocode });
    component.ngOnInit();
    component.regions$.subscribe();
    expect(
      component.addressForm['controls'].country['controls'].isocode.value
    ).toEqual(mockCountryIsocode);
    expect(userAddressService.getRegions).toHaveBeenCalledWith(
      mockCountryIsocode
    );
  });

  it('should call verifyAddress', () => {
    jest.spyOn(component, 'verifyAddress');
    const mockCountryIsocode = 'test country isocode';
    component.regionSelected({ isocode: mockCountryIsocode });
    component.ngOnInit();
    component.regions$.subscribe();
    component.verifyAddress();
    expect(
      component.addressForm['controls'].region['controls'].isocode.value
    ).toEqual(mockCountryIsocode);
    expect(component.verifyAddress).toHaveBeenCalled();
  });

  describe('UI continue button', () => {
    const getContinueBtn = () =>
      fixture.debugElement.query(By.css('.btn-primary'));

    it('should call "verifyAddress" function when being clicked and when form is valid', () => {
      jest
        .spyOn(userAddressService, 'getDeliveryCountries')
        .mockReturnValue(of([]));
      jest.spyOn(userService, 'getTitles').mockReturnValue(of([]));
      jest.spyOn(userAddressService, 'getRegions').mockReturnValue(of([]));
      jest.spyOn(component, 'verifyAddress').mockImplementation(() => {});

      fixture.detectChanges();

      getContinueBtn().nativeElement.click();
      expect(component.verifyAddress).toHaveBeenCalledTimes(1);

      controls['titleCode'].setValue('test titleCode');
      controls['firstName'].setValue('test firstName');
      controls['lastName'].setValue('test lastName');
      controls['line1'].setValue('test line1');
      controls['town'].setValue('test town');
      controls.region['controls'].isocode.setValue('test region isocode');
      controls.country['controls'].isocode.setValue('test country isocode');
      controls['postalCode'].setValue('test postalCode');
      fixture.detectChanges();

      getContinueBtn().nativeElement.click();
      expect(component.verifyAddress).toHaveBeenCalledTimes(2);
    });
  });

  describe('UI cancel button', () => {
    it('should show the "Back to cart", if it is provided as an input', () => {
      component.cancelBtnLabel = 'Back to cart';
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.btn-action').textContent.trim()
      ).toEqual('Back to cart');
    });

    it('should show the "Choose Address", if there is no "cancelBtnLabel" input provided', () => {
      component.cancelBtnLabel = undefined;
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.btn-action').textContent.trim()
      ).toEqual('addressForm.chooseAddress');
    });
  });

  describe('UI back button', () => {
    const getBackBtn = () => fixture.debugElement.query(By.css('.btn-action'));

    it('should default "showCancelBtn" to true and create button', () => {
      fixture.detectChanges();
      expect(getBackBtn()).toBeDefined();
    });

    it('should not create back button when "showCancelBtn" is false', () => {
      component.showCancelBtn = false;
      fixture.detectChanges();
      expect(getBackBtn()).toBeNull();
    });

    it('should create back button when "showCancelBtn" is true', () => {
      component.showCancelBtn = true;
      fixture.detectChanges();
      expect(getBackBtn()).toBeDefined();
    });

    it('should call "back" function after being clicked', () => {
      fixture.detectChanges();
      jest.spyOn(component, 'back').mockImplementation(() => {});
      getBackBtn().nativeElement.click();
      expect(component.back).toHaveBeenCalled();
    });
  });

  it('should unsubscribe from any subscriptions when destroyed', () => {
    component.regionsSub = new Subscription();
    jest
      .spyOn(component.regionsSub, 'unsubscribe')
      .mockImplementation(() => {});
    component.ngOnDestroy();
    expect(component.regionsSub.unsubscribe).toHaveBeenCalled();
  });

  it('should show the "Set as default" checkbox when there is one or more saved addresses', () => {
    jest
      .spyOn(userAddressService, 'getAddresses')
      .mockReturnValue(of([mockAddress]));

    fixture.detectChanges();

    expect(defaultAddressCheckbox().nativeElement).toBeTruthy();
  });

  it('should not show the "Set as default" checkbox when there no saved addresses', () => {
    jest.spyOn(userAddressService, 'getAddresses').mockReturnValue(of([]));

    fixture.detectChanges();

    expect(defaultAddressCheckbox()).toBe(null);
  });
});
