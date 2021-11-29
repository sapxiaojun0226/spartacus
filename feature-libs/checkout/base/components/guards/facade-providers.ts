import { Provider } from '@angular/core';
import { CheckoutStepsSetGuardFacade } from '@spartacus/checkout/base/root';
import { CheckoutStepsSetGuard } from './checkout-steps-set.guard';

export const facadeProviders: Provider[] = [
  CheckoutStepsSetGuard,
  {
    provide: CheckoutStepsSetGuardFacade,
    useExisting: CheckoutStepsSetGuard,
  },
];
