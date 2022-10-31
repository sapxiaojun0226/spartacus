/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function deepMerge(
  target: Record<string, unknown> = {},
  ...sources: any[]
): any {
  if (!sources.length) {
    return target;
  }
  const source = sources.shift() || {};

  if (isObject(source)) {
    for (const key in source) {
      if (source[key] instanceof Date) {
        target[key] = source[key];
      } else if (isObject(source[key])) {
        if (!target[key] || !isObject(target[key])) {
          target[key] = {};
        }
        deepMerge(target[key] as Record<string, unknown>, source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  return deepMerge(target, ...sources);
}
