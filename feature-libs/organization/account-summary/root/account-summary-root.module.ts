/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  CmsConfig,
  provideDefaultConfig,
  provideDefaultConfigFactory,
} from '@spartacus/core';
import { CmsPageGuard, PageLayoutComponent } from '@spartacus/storefront';
import { defaultAccountSummaryRoutingConfig } from './config';
import { ORGANIZATION_ACCOUNT_SUMMARY_FEATURE } from './feature-name';

// TODO: Inline this factory when we start releasing Ivy compiled libraries
export function defaultAccountSummaryComponentsConfig(): CmsConfig {
  const config: CmsConfig = {
    featureModules: {
      [ORGANIZATION_ACCOUNT_SUMMARY_FEATURE]: {
        cmsComponents: [
          'ManageAccountSummaryListComponent',
          'AccountSummaryHeaderComponent',
          'AccountSummaryDocumentComponent',
        ],
      },
    },
  };

  return config;
}

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        // @ts-ignore
        path: null,
        canActivate: [CmsPageGuard],
        component: PageLayoutComponent,
        data: { cxRoute: 'orgAccountSummaryDetails' },
      },
    ]),
  ],
  providers: [
    provideDefaultConfig(defaultAccountSummaryRoutingConfig),
    provideDefaultConfigFactory(defaultAccountSummaryComponentsConfig),
  ],
})
export class AccountSummaryRootModule {}
