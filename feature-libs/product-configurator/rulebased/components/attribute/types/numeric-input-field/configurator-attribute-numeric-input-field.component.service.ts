/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  formatNumber,
  getLocaleNumberSymbol,
  NumberSymbol,
} from '@angular/common';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { Configurator } from '../../../../core/model/configurator.model';

export interface ConfiguratorAttributeNumericInterval {
  minValue?: number;
  maxValue?: number;
  minValueIncluded: boolean;
  maxValueIncluded: boolean;
}

/**
 * Provides validation and formatting of numeric input
 */
@Injectable({ providedIn: 'root' })
export class ConfiguratorAttributeNumericInputFieldService {
  /**
   * Validates numeric input according to settings that are not derived from the locale but from the attribute
   * meta data like the total number of digits and the maximum number of decimal places.
   *
   * @param input Numeric user input, formatted according to session locale
   * @param groupingSeparator Separator for grouping, e.g. ',' for 'en' locale. We allow the grouping separator but
   *   do not check exactly on the position of it in the numerical input. This e.g. is ok: '12,12,12', will be converted
   *   to '121,212' after the next roundtrip
   * @param decimalSeparator  Decimal separator, e.g. '.' for 'en' locale. Must not occur more that 1 time in the input.
   * @param numberTotalPlaces  Total number of places e.g. 10
   * @param numberDecimalPlaces  Number of decimal places e.g. 2
   *  @returns {boolean} Did we see a validation error?
   */
  performValidationAccordingToMetaData(
    input: string,
    groupingSeparator: string,
    decimalSeparator: string,
    numberTotalPlaces: number,
    numberDecimalPlaces: number
  ): boolean {
    const escape = '\\';
    const search: RegExp = new RegExp(escape + groupingSeparator, 'g');
    const woGrouping = input.replace(search, '');
    const splitParts = woGrouping.split(decimalSeparator);

    if (splitParts.length > 2) {
      return true;
    }
    if (splitParts.length === 1) {
      return woGrouping.length > numberTotalPlaces - numberDecimalPlaces;
    }

    return (
      splitParts[0].length > numberTotalPlaces - numberDecimalPlaces ||
      splitParts[1].length > numberDecimalPlaces
    );
  }

  formatIntervalValue(
    intervalValue: number,
    decimalPlaces: number | undefined,
    locale: string
  ): string {
    if (decimalPlaces === undefined) {
      decimalPlaces = 0;
    }
    const formatted = formatNumber(
      intervalValue,
      locale,
      '1.' + decimalPlaces + '-' + decimalPlaces
    );
    return formatted;
  }

  /**
   * Parses the value names and returns the intervals.
   *
   * @param values values of the attribute
   * @returns {ConfiguratorAttributeNumericInterval[]} parsed intervals
   */
  getIntervals(
    values: Configurator.Value[] | undefined
  ): ConfiguratorAttributeNumericInterval[] {
    const intervals: ConfiguratorAttributeNumericInterval[] = [];
    if (values && values.length > 0) {
      values.forEach((value) => {
        const interval = this.getInterval(value);
        if (interval && Object.keys(interval).length !== 0) {
          intervals.push(interval);
        }
      });
    }
    return intervals;
  }

  /**
   * Parses the value name and returns the interval structure.
   * Valid interval strings:
   * Standard Interval
   * 5 - 10
   * 5 - <10
   * >5 - 10
   * >5 - <10
   * -10 - -5
   * 1.25 - 1.35
   *
   * Infinite Interval
   * >5
   * >=5
   * <5
   * <=5
   * >-5
   *
   * @param value value which will be parsed
   * @returns {ConfiguratorAttributeNumericInterval} parsed interval
   */
  getInterval(
    value: Configurator.Value
  ): ConfiguratorAttributeNumericInterval | undefined {
    const interval: ConfiguratorAttributeNumericInterval = {
      minValue: undefined,
      maxValue: undefined,
      minValueIncluded: false,
      maxValueIncluded: false,
    };
    if (!value || !value.name || value.selected) {
      return undefined;
    }

    let minVal: string = '';
    let maxVal: string = '';

    // standard interval a - b
    if (value.name.includes(' - ')) {
      ({ minVal, maxVal } = this.handleStandardInterval(
        value.name,
        minVal,
        maxVal,
        interval
      ));

      // infinite interval or single value
    } else {
      ({ minVal, maxVal } = this.handleSingleOrInfinite(
        value.name,
        minVal,
        interval,
        maxVal
      ));
    }

    if (minVal && minVal.length > 0) {
      interval.minValue = +minVal;
    }
    if (maxVal && maxVal.length > 0) {
      interval.maxValue = +maxVal;
    }

    return interval;
  }

  protected handleSingleOrInfinite(
    valueName: string,
    minVal: string,
    interval: ConfiguratorAttributeNumericInterval,
    maxVal: string
  ) {
    if (valueName.includes('>')) {
      minVal = valueName;
      interval.minValueIncluded = false;
      minVal = minVal.replace('>', '');
    }
    if (valueName.includes('<')) {
      maxVal = valueName;
      interval.maxValueIncluded = false;
      maxVal = maxVal.replace('<', '');
    }
    if (valueName.includes('≥')) {
      minVal = valueName;
      interval.minValueIncluded = true;
      minVal = minVal.replace('≥', '');
    }
    if (valueName.includes('≤')) {
      maxVal = valueName;
      interval.maxValueIncluded = true;
      maxVal = maxVal.replace('≤', '');
    }
    if (
      !valueName.includes('>') &&
      !valueName.includes('<') &&
      !valueName.includes('≤') &&
      !valueName.includes('≥')
    ) {
      minVal = valueName;
      maxVal = valueName;
    }
    return { minVal, maxVal };
  }

  protected handleStandardInterval(
    valueName: string,
    minVal: string,
    maxVal: string,
    interval: ConfiguratorAttributeNumericInterval
  ) {
    let index = valueName.indexOf(' - ');
    minVal = valueName.substring(0, index);
    maxVal = valueName.substring(index + 3, valueName.length);
    interval.minValueIncluded = true;
    interval.maxValueIncluded = true;
    if (minVal.includes('>')) {
      interval.minValueIncluded = false;
      minVal = minVal.replace('>', '');
    }

    if (maxVal.includes('<')) {
      interval.maxValueIncluded = false;
      maxVal = maxVal.replace('<', '');
    }
    return { minVal, maxVal };
  }

  /**
   * Get pattern for the message that is displayed when the validation fails. This message e.g. looks like
   * 'Wrong format, this numerical attribute should be entered according to pattern ##,###,###.##'
   * for the 'en' locale for an attribute with total length of 10 and 2 decimal places.
   *
   * @param decimalPlaces Number of decimal places
   * @param totalLength Total number of digits
   * @param negativeAllowed Do we allow negative input?
   * @param locale  Locale
   *  @returns {string} The pattern that we display in the validation message
   */
  getPatternForValidationMessage(
    decimalPlaces: number,
    totalLength: number,
    negativeAllowed: boolean,
    locale: string
  ): string {
    let input: string = (10 ** totalLength - 1).toString();
    if (decimalPlaces > 0) {
      input =
        input.substring(0, totalLength - decimalPlaces) +
        '.' +
        input.substring(totalLength - decimalPlaces, totalLength);
    }
    const inputAsNumber: number = Number(input);
    let formatted = formatNumber(
      inputAsNumber,
      locale,
      '1.' + decimalPlaces + '-' + decimalPlaces
    ).replace(/9/g, '#');
    if (negativeAllowed) {
      formatted = '-' + formatted;
    }
    return formatted;
  }

  /**
   * Returns the validator for the input component that represents numeric input.
   * The validator only allows the grouping separator, the decimal separator, an optional '-' sign,
   * and the digits between 0..9. This validator does not support the scientific notation of
   * attributes.
   *
   * @param locale The locale
   * @param numberDecimalPlaces Number of decimal places
   * @param numberTotalPlaces  Total number of digits
   * @param negativeAllowed: Do we allow negative input?
   * @returns {ValidatorFn} The validator
   */

  getNumberFormatValidator(
    locale: string,
    numberDecimalPlaces: number,
    numberTotalPlaces: number,
    negativeAllowed: boolean
  ): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const input: string = control.value;
      if (input) {
        //allowed: only numbers and separators

        const groupingSeparator = getLocaleNumberSymbol(
          locale,
          NumberSymbol.Group
        );
        const decimalSeparator = getLocaleNumberSymbol(
          locale,
          NumberSymbol.Decimal
        );
        const expressionPrefix = negativeAllowed ? '^-?' : '^';
        const expressionOnlyNumericalInput: RegExp = new RegExp(
          expressionPrefix +
            '[0123456789' +
            groupingSeparator +
            decimalSeparator +
            ']*$'
        );

        if (!expressionOnlyNumericalInput.test(input)) {
          return this.createValidationError(true);
        }
        return this.createValidationError(
          this.performValidationAccordingToMetaData(
            input,
            groupingSeparator,
            decimalSeparator,
            numberTotalPlaces + (input.includes('-') ? 1 : 0),
            numberDecimalPlaces
          )
        );
      }
      return null;
    };
  }

  protected createValidationError(
    isError: boolean
  ): { [key: string]: any } | null {
    return isError ? { wrongFormat: {} } : null;
  }
}
