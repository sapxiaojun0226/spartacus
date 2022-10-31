/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { RoutingConfig } from '@spartacus/core';

export const defaultCheckoutB2BRoutingConfig: RoutingConfig = {
  routing: {
    routes: {
      checkoutPaymentType: { paths: ['checkout/payment-type'] },
    },
  },
};
