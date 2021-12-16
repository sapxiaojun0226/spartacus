import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationPreferenceComponent } from './notification-preference.component';
import {
  I18nTestingModule,
  NotificationPreference,
  UserNotificationPreferenceService,
} from '@spartacus/core';
import { of } from 'rxjs';
import { DebugElement, Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { cold, getTestScheduler } from 'jasmine-marbles';

@Component({
  selector: 'cx-spinner',
  template: ` <div>spinner</div> `,
})
class MockCxSpinnerComponent {}

describe('NotificationPreferenceComponent', () => {
  let component: NotificationPreferenceComponent;
  let fixture: ComponentFixture<NotificationPreferenceComponent>;
  let el: DebugElement;

  const notificationPreferenceService = {
    getPreferences: jest.fn(),
    loadPreferences: jest.fn(),
    getPreferencesLoading: jest.fn(),
    updatePreferences: jest.fn(),
    getUpdatePreferencesResultLoading: jest.fn(),
    resetNotificationPreferences: jest.fn(),
  };

  const notificationPreference: NotificationPreference[] = [
    {
      channel: 'EMAIL',
      enabled: true,
      value: 'test.user@sap.com',
      visible: true,
    },
    {
      channel: 'SMS',
      enabled: false,
      value: '01234567890',
      visible: true,
    },
  ];

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [I18nTestingModule],
        declarations: [NotificationPreferenceComponent, MockCxSpinnerComponent],
        providers: [
          {
            provide: UserNotificationPreferenceService,
            useValue: notificationPreferenceService,
          },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationPreferenceComponent);
    el = fixture.debugElement;
    component = fixture.componentInstance;

    notificationPreferenceService.loadPreferences.mockImplementation();
    notificationPreferenceService.updatePreferences.mockImplementation();
    notificationPreferenceService.getPreferences.mockReturnValue(
      of(notificationPreference)
    );
    notificationPreferenceService.getPreferencesLoading.mockReturnValue(
      of(false)
    );
    notificationPreferenceService.getUpdatePreferencesResultLoading.mockReturnValue(
      of(false)
    );
    notificationPreferenceService.resetNotificationPreferences.mockImplementation();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show channels', () => {
    fixture.detectChanges();
    expect(el.query(By.css('.pref-header'))).toBeTruthy();
    expect(el.query(By.css('.pref-note'))).toBeTruthy();
    expect(
      el.queryAll(By.css('.form-check-input')).length ===
        notificationPreference.length
    ).toBeTruthy();
    expect(
      el.queryAll(By.css('.pref-channel')).length ===
        notificationPreference.length
    ).toBeTruthy();
  });

  it('should show spinner when loading', () => {
    notificationPreferenceService.getPreferences.mockReturnValue(of([]));
    fixture.detectChanges();
    expect(el.query(By.css('cx-spinner'))).toBeTruthy();
  });

  it('should be able to disable a channel when get loading', () => {
    notificationPreferenceService.getUpdatePreferencesResultLoading.mockReturnValue(
      of(false)
    );
    notificationPreferenceService.getPreferencesLoading.mockReturnValue(
      cold('-a|', { a: true })
    );
    fixture.detectChanges();

    const cheboxies = el.queryAll(By.css('.form-check-input'));
    expect(cheboxies.length).toEqual(notificationPreference.length);
    const chx = cheboxies[0].nativeElement;
    chx.click();

    getTestScheduler().flush();
    fixture.detectChanges();

    expect(notificationPreferenceService.updatePreferences).toHaveBeenCalled();
    expect(chx.disabled).toEqual(true);
  });

  it('should be able to disable a channel when update loading', () => {
    notificationPreferenceService.getPreferencesLoading.mockReturnValue(
      of(false)
    );
    notificationPreferenceService.getUpdatePreferencesResultLoading.mockReturnValue(
      cold('-a|', { a: true })
    );
    fixture.detectChanges();

    const cheboxies = el.queryAll(By.css('.form-check-input'));
    expect(cheboxies.length).toEqual(notificationPreference.length);
    const chx = cheboxies[0].nativeElement;
    chx.click();

    getTestScheduler().flush();
    fixture.detectChanges();

    expect(notificationPreferenceService.updatePreferences).toHaveBeenCalled();
    expect(chx.disabled).toEqual(true);
  });
});
