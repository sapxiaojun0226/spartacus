/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OccEndpointsService } from '@spartacus/core';
import { Observable, of } from 'rxjs';
import { switchMapTo } from 'rxjs/operators';
import { CdsBackendNotificationAdapter } from './cds-backend-notification-adapter';

@Injectable()
export class OccBackendNotification implements CdsBackendNotificationAdapter {
  constructor(
    private http: HttpClient,
    private occEndpoints: OccEndpointsService
  ) {}
  notifySuccessfulLogin(): Observable<void> {
    return this.http
      .post<{}>(
        `${this.occEndpoints.getBaseUrl()}/users/current/loginnotification`,
        {}
      )
      .pipe(switchMapTo(of()));
  }
}
