/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Environment {
  production: boolean;
  occBaseUrl: string;
  occApiPrefix: string;
  b2b: boolean;
  cds: boolean;
  cdc: boolean;
  cpq: boolean;
  digitalPayments: boolean;
  epdVisualization: boolean;
}
