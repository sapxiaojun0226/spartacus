/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import {
  GlobalMessageState,
  GLOBAL_MESSAGE_FEATURE,
  StateWithGlobalMessage,
} from '../global-message-state';

export const getGlobalMessageState: MemoizedSelector<
  StateWithGlobalMessage,
  GlobalMessageState
> = createFeatureSelector<GlobalMessageState>(GLOBAL_MESSAGE_FEATURE);
