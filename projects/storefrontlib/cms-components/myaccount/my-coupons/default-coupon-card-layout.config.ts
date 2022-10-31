/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { DIALOG_TYPE, LayoutConfig } from '../../../layout/index';
import { CouponDialogComponent } from './coupon-card/coupon-dialog/coupon-dialog.component';

export const defaultCouponLayoutConfig: LayoutConfig = {
  launch: {
    COUPON: {
      inline: true,
      component: CouponDialogComponent,
      dialogType: DIALOG_TYPE.DIALOG,
    },
  },
};
