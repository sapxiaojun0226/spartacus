/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SmartEditLauncherService } from '../services/smart-edit-launcher.service';

@Injectable({ providedIn: 'root' })
export class CmsTicketInterceptor implements HttpInterceptor {
  constructor(private service: SmartEditLauncherService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.service.cmsTicketId && request.url.includes('/cms/')) {
      request = request.clone({
        setParams: {
          cmsTicketId: this.service.cmsTicketId,
        },
      });
    }

    return next.handle(request);
  }
}
