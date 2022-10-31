/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Provider } from '@angular/core';
import {
  CheckoutCostCenterFacade,
  CheckoutPaymentTypeFacade,
} from '@spartacus/checkout/b2b/root';
import { CheckoutCostCenterService } from './checkout-cost-center.service';
import { CheckoutPaymentTypeService } from './checkout-payment-type.service';

export const facadeProviders: Provider[] = [
  CheckoutCostCenterService,
  {
    provide: CheckoutCostCenterFacade,
    useExisting: CheckoutCostCenterService,
  },
  CheckoutPaymentTypeService,
  {
    provide: CheckoutPaymentTypeFacade,
    useExisting: CheckoutPaymentTypeService,
  },
];
