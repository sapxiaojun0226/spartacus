/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartModificationList } from '@spartacus/cart/base/root';
import { Observable } from 'rxjs';

export abstract class CartValidationAdapter {
  abstract validate(
    cartId: string,
    userId: string
  ): Observable<CartModificationList>;
}
