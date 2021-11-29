import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { facadeFactory } from '@spartacus/core';
import { Observable } from 'rxjs';
import { CHECKOUT_GUARDS } from '../feature-name';

@Injectable({
  providedIn: 'root',
  useFactory: () =>
    facadeFactory({
      facade: CheckoutStepsSetGuardFacade,
      feature: CHECKOUT_GUARDS,
      methods: ['canActivate'],
    }),
})
export abstract class CheckoutStepsSetGuardFacade {
  /**
   * Returns boolean or UrlTree if guard can activate
   */
  abstract canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree>;
}
