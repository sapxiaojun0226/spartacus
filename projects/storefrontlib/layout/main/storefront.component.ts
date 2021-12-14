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

  readonly StorefrontOutlets = StorefrontOutlets;

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
    const matchMediaPrefDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );
    const prefersDarkMode = matchMediaPrefDark.matches;

    const theme = localStorage.getItem('theme');
    const html = document.querySelector('html');

    if (html) {
      html.dataset.theme =
        theme ?? (prefersDarkMode ? `theme-dark` : `theme-light`);
    }

    this.navigateSubscription = this.routingService
      .isNavigating()
      .subscribe((val) => {
        this.startNavigating = val === true;
        this.stopNavigating = val === false;
      });
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

  switchTheme(): void {
    const html = document.querySelector('html');
    if (html) {
      if (html.dataset.theme === `theme-dark`) {
        html.dataset.theme = `theme-light`;
        localStorage.setItem('theme', 'theme-light');
      } else {
        html.dataset.theme = `theme-dark`;
        localStorage.setItem('theme', 'theme-dark');
      }
    }
  }

  collapseMenu(): void {
    this.hamburgerMenuService.toggle(true);
  }

  ngOnDestroy(): void {
    if (this.navigateSubscription) {
      this.navigateSubscription.unsubscribe();
    }
  }
}
