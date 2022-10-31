/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import {
  GlobalMessageService,
  GlobalMessageType,
} from '../../../global-message/index';
import { Address } from '../../../model/address.model';
import { normalizeHttpError } from '../../../util/normalize-http-error';
import { UserAddressConnector } from '../../connectors/address/user-address.connector';
import { UserAddressService } from '../../facade/user-address.service';
import { UserActions } from '../actions/index';

@Injectable()
export class UserAddressesEffects {
  loadUserAddresses$: Observable<UserActions.UserAddressesAction> =
    createEffect(() =>
      this.actions$.pipe(
        ofType(UserActions.LOAD_USER_ADDRESSES),
        map((action: UserActions.LoadUserAddresses) => action.payload),
        mergeMap((payload) => {
          return this.userAddressConnector.getAll(payload).pipe(
            map((addresses: Address[]) => {
              return new UserActions.LoadUserAddressesSuccess(addresses);
            }),
            catchError((error) =>
              of(
                new UserActions.LoadUserAddressesFail(normalizeHttpError(error))
              )
            )
          );
        })
      )
    );

  addUserAddress$: Observable<UserActions.UserAddressesAction> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.ADD_USER_ADDRESS),
        map((action: UserActions.AddUserAddress) => action.payload),
        mergeMap((payload) => {
          return this.userAddressConnector
            .add(payload.userId, payload.address)
            .pipe(
              map((data: any) => {
                return new UserActions.AddUserAddressSuccess(data);
              }),
              catchError((error) =>
                of(
                  new UserActions.AddUserAddressFail(normalizeHttpError(error))
                )
              )
            );
        })
      )
  );

  updateUserAddress$: Observable<UserActions.UserAddressesAction> =
    createEffect(() =>
      this.actions$.pipe(
        ofType(UserActions.UPDATE_USER_ADDRESS),
        map((action: UserActions.UpdateUserAddress) => action.payload),
        mergeMap((payload) => {
          return this.userAddressConnector
            .update(payload.userId, payload.addressId, payload.address)
            .pipe(
              map((data) => {
                // don't show the message if just setting address as default
                if (
                  payload.address &&
                  Object.keys(payload.address).length === 1 &&
                  payload.address.defaultAddress
                ) {
                  return new UserActions.LoadUserAddresses(payload.userId);
                } else {
                  return new UserActions.UpdateUserAddressSuccess(data);
                }
              }),
              catchError((error) =>
                of(
                  new UserActions.UpdateUserAddressFail(
                    normalizeHttpError(error)
                  )
                )
              )
            );
        })
      )
    );

  deleteUserAddress$: Observable<UserActions.UserAddressesAction> =
    createEffect(() =>
      this.actions$.pipe(
        ofType(UserActions.DELETE_USER_ADDRESS),
        map((action: UserActions.DeleteUserAddress) => action.payload),
        mergeMap((payload) => {
          return this.userAddressConnector
            .delete(payload.userId, payload.addressId)
            .pipe(
              map((data) => {
                return new UserActions.DeleteUserAddressSuccess(data);
              }),
              catchError((error) =>
                of(
                  new UserActions.DeleteUserAddressFail(
                    normalizeHttpError(error)
                  )
                )
              )
            );
        })
      )
    );

  /**
   *  Reload addresses and notify about add success
   */

  showGlobalMessageOnAddSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.ADD_USER_ADDRESS_SUCCESS),
        tap(() => {
          this.loadAddresses();
          this.showGlobalMessage('addressForm.userAddressAddSuccess');
        })
      ),
    { dispatch: false }
  );

  /**
   *  Reload addresses and notify about update success
   */

  showGlobalMessageOnUpdateSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.UPDATE_USER_ADDRESS_SUCCESS),
        tap(() => {
          this.loadAddresses();
          this.showGlobalMessage('addressForm.userAddressUpdateSuccess');
        })
      ),
    { dispatch: false }
  );

  /**
   *  Reload addresses and notify about delete success
   */

  showGlobalMessageOnDeleteSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UserActions.DELETE_USER_ADDRESS_SUCCESS),
        tap(() => {
          this.loadAddresses();
          this.showGlobalMessage('addressForm.userAddressDeleteSuccess');
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private userAddressConnector: UserAddressConnector,
    private userAddressService: UserAddressService,
    private messageService: GlobalMessageService
  ) {}

  /**
   * Show global confirmation message with provided text
   */
  private showGlobalMessage(text: string) {
    this.messageService.add(
      { key: text },
      GlobalMessageType.MSG_TYPE_CONFIRMATION
    );
  }

  private loadAddresses() {
    this.userAddressService.loadAddresses();
  }
}
