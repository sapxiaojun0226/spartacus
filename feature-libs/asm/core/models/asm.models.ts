/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { PaginationModel, SortModel, User } from '@spartacus/core';

export interface CustomerSearchPage {
  entries: User[];
  pagination?: PaginationModel;
  sorts?: SortModel[];
}

export interface CustomerSearchOptions {
  query?: string;
  pageSize?: number;
  customerListId?: string;
  currentPage?: number;
  sort?: string;
}

export interface AsmUi {
  collapsed?: boolean;
}
