/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, isDevMode } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BreakpointService } from '../../../layout/breakpoint/breakpoint.service';
import { BREAKPOINT } from '../../../layout/config/layout-config';
import {
  ResponsiveTableConfiguration,
  TableConfig,
} from './config/table.config';
import { TableStructure, TableStructureConfiguration } from './table.model';

/**
 * Responsive table service.
 *
 * The `TableService` is used to build a `TableStructure` by configuration. The configuration
 * allows for breakpoint specific configuration, so that the table can differentiate for
 * various screen sizes.
 *
 * While there are some global options, the configuration is mainly driven by the table _type_.
 *
 * If there is no table configuration for the given type found, a table header structure
 * is generated based on the actual data (if available) or randomly by generating 5 random headers.
 */
@Injectable({
  providedIn: 'root',
})
export class TableService {
  constructor(
    protected breakpointService: BreakpointService,
    protected config: TableConfig
  ) {}

  /**
   * Builds the table structure.
   *
   * @param tableType The table type is used  to find the specific table configuration.
   * @param defaultStructure (optional) Default table structure that contains fallback options. More specific options are merged with the default structure.
   * @param data$ (optional) The actual data can be passed in to generate the table structure based on actual data.
   */
  buildStructure(
    tableType: string,
    defaultStructure?: ResponsiveTableConfiguration
  ): Observable<TableStructure> {
    if (this.hasTableConfig(tableType)) {
      return this.buildStructureFromConfig(tableType, defaultStructure);
    } else {
      return this.buildRandomStructure(tableType);
    }
  }

  /**
   * Returns the table structure by configuration. The configuration can be
   * breakpoint-driven, which means that an alternative header structure can
   * be created per screen size.
   *
   * The breakpoint is resolved by teh `BreakpointService`.
   */
  protected buildStructureFromConfig(
    type: string,
    defaultStructure?: ResponsiveTableConfiguration
  ): Observable<TableStructure> {
    return this.breakpointService.breakpoint$.pipe(
      map((breakpoint) => ({
        ...this.getTableConfig(type, breakpoint, defaultStructure),
        type,
      }))
    );
  }

  /**
   * Finds all applicable table configuration for the given type and breakpoint.
   * The default table configuration is merged with all relevant breakpoint
   * configurations.
   *
   * This allows to have some default configurations that apply to all screens, and
   * add configuration options for some screens.
   */
  protected getTableConfig(
    type: string,
    breakpoint: BREAKPOINT,
    defaultStructure?: ResponsiveTableConfiguration
  ): TableStructureConfiguration | null {
    if (!this.config.table?.[type]) {
      return null;
    }

    const relevant = this.findRelevantBreakpoints(breakpoint);

    const closestBreakpoint = [...relevant]
      .reverse()
      .find((br) => !!this.config.table?.[type][br]?.cells);
    const cells =
      (closestBreakpoint &&
        this.config.table[type][closestBreakpoint]?.cells) ||
      this.config.table[type].cells ||
      defaultStructure?.cells;

    // add all default table configurations
    let options = {
      ...defaultStructure?.options,
      ...this.config.table[type].options,
    };

    // We merge all table options for smaller breakpoints into the global
    // options, so we inherit options.
    relevant.forEach((br) => {
      options = {
        ...options,
        ...defaultStructure?.[br]?.options,
        ...this.config.table?.[type]?.[br]?.options,
      };
    });

    return { cells, options };
  }

  /**
   * Generates the table structure by the help of the first data row.
   */
  protected buildStructureFromData(
    type: string,
    data$: Observable<any>
  ): Observable<TableStructure> {
    this.logWarning(
      `No table configuration found to render table with type "${type}". The table header for "${type}" is generated by the help of the first data item`
    );
    return data$.pipe(
      map((data: any[]) => {
        const cells = Object.keys(data?.[0]).map((key) => key);
        return { type, cells } as TableStructure;
      })
    );
  }

  /**
   * As a last resort, the table structure is randomly created. The random structure
   * contains 5 headers, so that some of the unknown data is visualized.
   */
  protected buildRandomStructure(type: string): Observable<TableStructure> {
    this.logWarning(
      `No data available for "${type}", a random structure is generated (with hidden table headers).`
    );
    return of({
      type,
      cells: ['unknown', 'unknown', 'unknown', 'unknown', 'unknown'],
    });
  }

  /**
   * Finds all the breakpoints can contribute to the table configuration, from small
   * to current.
   *
   * For example, if the current breakpoint is `MD`, this returns `[XS, SM, MD]`.
   */
  protected findRelevantBreakpoints(breakpoint: BREAKPOINT): BREAKPOINT[] {
    const current = this.breakpointService.breakpoints.indexOf(breakpoint);
    return this.breakpointService.breakpoints.slice(0, current + 1);
  }

  /**
   * Indicates if the there is a configuration for the table available.
   */
  protected hasTableConfig(tableType: string): boolean {
    return !!this.config.table?.[tableType];
  }

  /**
   * Logs a message in the console to increase developer experience.
   *
   * The message is only logged in dev mode.
   */
  private logWarning(message: string) {
    if (isDevMode()) {
      console.warn(message);
    }
  }
}
