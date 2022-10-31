/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Provider } from '@angular/core';
import { AsmBindCartFacade, AsmCustomerListFacade } from '@spartacus/asm/root';
import { AsmBindCartService } from './asm-bind-cart.service';
import { AsmCustomerListService } from './asm-customer-list.service';

export const facadeProviders: Provider[] = [
  AsmCustomerListService,
  {
    provide: AsmCustomerListFacade,
    useExisting: AsmCustomerListService,
  },
  AsmBindCartService,
  {
    provide: AsmBindCartFacade,
    useExisting: AsmBindCartService,
  },
];
