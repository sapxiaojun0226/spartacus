/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { TranslationChunksConfig, TranslationResources } from '@spartacus/core';
import { en } from './en/index';

export const userAccountTranslations: TranslationResources = {
  en,
};

export const userAccountTranslationChunksConfig: TranslationChunksConfig = {
  userAccount: ['loginForm', 'miniLogin'],
};
