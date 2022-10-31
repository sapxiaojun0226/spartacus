/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO: Move from product to more generic place
export interface SearchConfig {
  pageSize?: number;
  currentPage?: number;
  sort?: string;
}
