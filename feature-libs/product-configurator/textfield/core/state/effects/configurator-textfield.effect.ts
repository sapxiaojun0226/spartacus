/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CartActions } from '@spartacus/cart/base/core';
import { normalizeHttpError } from '@spartacus/core';
import { CommonConfigurator } from '@spartacus/product-configurator/common';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ConfiguratorTextfieldConnector } from '../../connectors/configurator-textfield.connector';
import { ConfiguratorTextfield } from '../../model/configurator-textfield.model';
import { ConfiguratorTextfieldActions } from '../actions/index';

@Injectable()
export class ConfiguratorTextfieldEffects {
  createConfiguration$: Observable<
    | ConfiguratorTextfieldActions.CreateConfigurationSuccess
    | ConfiguratorTextfieldActions.CreateConfigurationFail
  > = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfiguratorTextfieldActions.CREATE_CONFIGURATION),
      map(
        (action: ConfiguratorTextfieldActions.CreateConfiguration) =>
          action.payload
      ),
      switchMap((payload) => {
        return this.configuratorTextfieldConnector
          .createConfiguration(payload.productCode, payload.owner)
          .pipe(
            switchMap((configuration: ConfiguratorTextfield.Configuration) => {
              return [
                new ConfiguratorTextfieldActions.CreateConfigurationSuccess(
                  configuration
                ),
              ];
            }),
            catchError((error) =>
              of(
                new ConfiguratorTextfieldActions.CreateConfigurationFail(
                  normalizeHttpError(error)
                )
              )
            )
          );
      })
    )
  );

  addToCart$: Observable<
    | ConfiguratorTextfieldActions.RemoveConfiguration
    | ConfiguratorTextfieldActions.AddToCartFail
    | CartActions.LoadCart
  > = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfiguratorTextfieldActions.ADD_TO_CART),
      map((action: ConfiguratorTextfieldActions.AddToCart) => action.payload),
      switchMap((payload) => {
        return this.configuratorTextfieldConnector.addToCart(payload).pipe(
          switchMap(() => {
            return [
              new ConfiguratorTextfieldActions.RemoveConfiguration(),
              new CartActions.LoadCart({
                cartId: payload.cartId,
                userId: payload.userId,
              }),
            ];
          }),
          catchError((error) =>
            of(
              new ConfiguratorTextfieldActions.AddToCartFail(
                normalizeHttpError(error)
              )
            )
          )
        );
      })
    )
  );

  updateCartEntry$: Observable<
    | ConfiguratorTextfieldActions.RemoveConfiguration
    | ConfiguratorTextfieldActions.UpdateCartEntryConfigurationFail
    | CartActions.LoadCart
  > = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfiguratorTextfieldActions.UPDATE_CART_ENTRY_CONFIGURATION),
      map(
        (action: ConfiguratorTextfieldActions.UpdateCartEntryConfiguration) =>
          action.payload
      ),
      switchMap((payload) => {
        return this.configuratorTextfieldConnector
          .updateConfigurationForCartEntry(payload)
          .pipe(
            switchMap(() => {
              return [
                new ConfiguratorTextfieldActions.RemoveConfiguration(),
                new CartActions.LoadCart({
                  cartId: payload.cartId,
                  userId: payload.userId,
                }),
              ];
            }),
            catchError((error) =>
              of(
                new ConfiguratorTextfieldActions.UpdateCartEntryConfigurationFail(
                  normalizeHttpError(error)
                )
              )
            )
          );
      })
    )
  );

  readConfigurationForCartEntry$: Observable<
    | ConfiguratorTextfieldActions.ReadCartEntryConfigurationSuccess
    | ConfiguratorTextfieldActions.ReadCartEntryConfigurationFail
  > = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfiguratorTextfieldActions.READ_CART_ENTRY_CONFIGURATION),
      switchMap(
        (action: ConfiguratorTextfieldActions.ReadCartEntryConfiguration) => {
          const parameters: CommonConfigurator.ReadConfigurationFromCartEntryParameters =
            action.payload;

          return this.configuratorTextfieldConnector
            .readConfigurationForCartEntry(parameters)
            .pipe(
              switchMap((result: ConfiguratorTextfield.Configuration) => [
                new ConfiguratorTextfieldActions.ReadCartEntryConfigurationSuccess(
                  result
                ),
              ]),
              catchError((error) => [
                new ConfiguratorTextfieldActions.ReadCartEntryConfigurationFail(
                  normalizeHttpError(error)
                ),
              ])
            );
        }
      )
    )
  );

  readConfigurationForOrderEntry$: Observable<
    | ConfiguratorTextfieldActions.ReadOrderEntryConfigurationSuccess
    | ConfiguratorTextfieldActions.ReadOrderEntryConfigurationFail
  > = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfiguratorTextfieldActions.READ_ORDER_ENTRY_CONFIGURATION),
      switchMap(
        (action: ConfiguratorTextfieldActions.ReadOrderEntryConfiguration) => {
          const parameters: CommonConfigurator.ReadConfigurationFromOrderEntryParameters =
            action.payload;

          return this.configuratorTextfieldConnector
            .readConfigurationForOrderEntry(parameters)
            .pipe(
              switchMap((result: ConfiguratorTextfield.Configuration) => [
                new ConfiguratorTextfieldActions.ReadOrderEntryConfigurationSuccess(
                  result
                ),
              ]),
              catchError((error) => [
                new ConfiguratorTextfieldActions.ReadOrderEntryConfigurationFail(
                  normalizeHttpError(error)
                ),
              ])
            );
        }
      )
    )
  );

  constructor(
    private actions$: Actions,
    private configuratorTextfieldConnector: ConfiguratorTextfieldConnector
  ) {}
}
