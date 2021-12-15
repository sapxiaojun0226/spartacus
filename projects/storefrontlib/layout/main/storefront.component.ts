import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RoutingService } from '@spartacus/core';
import { ICON_TYPE } from '@spartacus/storefront';
import { Observable, Subscription } from 'rxjs';
import {
  FocusConfig,
  KeyboardFocusService,
} from '../a11y/keyboard-focus/index';
import { SkipLinkComponent } from '../a11y/skip-link/index';
import { HamburgerMenuService } from '../header/hamburger-menu/hamburger-menu.service';
import { StorefrontOutlets } from './storefront-outlets.model';

@Component({
  selector: 'cx-storefront',
  templateUrl: './storefront.component.html',
})
export class StorefrontComponent implements OnInit, OnDestroy {
  navigateSubscription: Subscription;
  isExpanded$: Observable<boolean> = this.hamburgerMenuService.isExpanded;

  mode: string;
  html: HTMLElement | null;
  matchMediaPrefDark: MediaQueryList;

  readonly StorefrontOutlets = StorefrontOutlets;
  iconTypes = ICON_TYPE;

  @HostBinding('class.start-navigating') startNavigating;
  @HostBinding('class.stop-navigating') stopNavigating;

  // required by esc focus
  @HostBinding('tabindex') tabindex = '0';

  @ViewChild(SkipLinkComponent) child: SkipLinkComponent;

  private keyboardFocusConfig: FocusConfig = {
    focusOnEscape: true,
    focusOnDoubleEscape: true,
  };

  @HostListener('keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent): void {
    this.keyboardFocusService.handleEscape(
      this.elementRef.nativeElement,
      this.keyboardFocusConfig,
      event
    );
  }

  constructor(
    private hamburgerMenuService: HamburgerMenuService,
    private routingService: RoutingService,
    protected elementRef: ElementRef<HTMLElement>,
    protected keyboardFocusService: KeyboardFocusService
  ) {}

  ngOnInit(): void {
    this.setTheme();

    this.navigateSubscription = this.routingService
      .isNavigating()
      .subscribe((val) => {
        this.startNavigating = val === true;
        this.stopNavigating = val === false;
      });
  }

  setTheme(): void {
    this.matchMediaPrefDark = window.matchMedia('(prefers-color-scheme: dark)');

    const prefersDarkMode = this.matchMediaPrefDark.matches;

    const theme = localStorage.getItem('theme');
    this.html = document.querySelector('html');

    if (this.html) {
      this.html.dataset.theme =
        theme ?? (prefersDarkMode ? `theme-dark` : `theme-light`);
      this.mode = this.html.dataset.theme;
    }
  }

  setThemeAuto(): void {
    this.matchMediaPrefDark.addEventListener('change', (event) => {
      this.onSystemThemeChange(event);
    });
    const prefersDarkMode = this.matchMediaPrefDark.matches;
    if (this.html) {
      this.html.dataset.theme = prefersDarkMode ? `theme-dark` : `theme-light`;
      localStorage.setItem('theme', this.html.dataset.theme);
      this.mode = this.html.dataset.theme;
    }
    this.themeOptionsMenuToggle();
  }

  collapseMenuIfClickOutside(event: any): void {
    const element = event.target;
    if (
      element.nodeName.toLowerCase() === 'header' &&
      element.className.includes('is-expanded')
    ) {
      this.collapseMenu();
    }
  }

  onSystemThemeChange(e: MediaQueryListEvent): void {
    const isDark = e.matches;

    if (isDark) {
      this.switchTheme(`theme-dark`);
    } else {
      this.switchTheme(`theme-light`);
    }
  }

  themeOptionsMenuToggle(): void {
    const elm = document.querySelector<HTMLElement>('.theme-switcher-options')!;
    elm.style.display === 'block'
      ? (elm.style.display = 'none')
      : (elm.style.display = 'block');
  }

  switchTheme(theme?: string, turnOffAuto = false): void {
    if (this.html) {
      if (theme && theme !== 'auto') {
        this.html.dataset.theme = theme;
        localStorage.setItem('theme', theme);
        this.mode = theme;
      } else {
        if (this.html.dataset.theme === `theme-dark`) {
          this.html.dataset.theme = `theme-light`;
          localStorage.setItem('theme', `theme-light`);
          this.mode = `theme-light`;
        } else {
          this.html.dataset.theme = `theme-dark`;
          localStorage.setItem('theme', `theme-dark`);
          this.mode = `theme-dark`;
        }
      }
    }

    if (turnOffAuto) {
      this.matchMediaPrefDark.removeEventListener('change', (event) => {
        this.onSystemThemeChange(event);
      });
      this.themeOptionsMenuToggle();
    }
  }

  collapseMenu(): void {
    this.hamburgerMenuService.toggle(true);
  }

  ngOnDestroy(): void {
    this.matchMediaPrefDark.removeEventListener('change', (event) => {
      this.onSystemThemeChange(event);
    });
    if (this.navigateSubscription) {
      this.navigateSubscription.unsubscribe();
    }
  }
}
