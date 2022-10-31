/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export const orgAccountSummary = {
  header: 'All Account Summaries ({{count}})',
  name: 'Unit',
  details: {
    header: 'Account Summary Details',
    uid: 'Unit ID',
    name: 'Unit Name',
    address: 'Address',
    creditRep: 'Credit Rep',
    creditLine: 'Credit Line',
    currentBalance: 'Current Balance',
    openBalance: 'Open Balance',
    pastDueBalance: 'Past Due Balance',
    dayRange: '{{minBoundary}}-{{maxBoundary}} Days',
    dayPlus: '{{minBoundary}}+ Days',
    notApplicable: 'n/a',
  },
  document: {
    header: 'Documents',
    id: 'Document Number',
    type: 'Document Type',
    date: 'Created On',
    dueDate: 'Due On',
    originalAmount: 'Original Amount',
    openAmount: 'Open Amount',
    status: 'Status',
    attachment: 'Attachment',
    download: 'Download',
    attachmentDescription: 'Download attachment for {{type}} {{id}}.',
    noneFound: 'No Documents Found',
  },
  sorts: {
    byCreatedAtDateAsc: 'Created On Ascending',
    byCreatedAtDateDesc: 'Created On Descending',
    byDueAtDateAsc: 'Due On Ascending',
    byDueAtDateDesc: 'Due On Descending',
    byOriginalAmountAsc: 'Original Amount Ascending',
    byOriginalAmountDesc: 'Original Amount Descending',
    byOpenAmountAsc: 'Open Amount Ascending',
    byOpenAmountDesc: 'Open Amount Descending',
    byOrgDocumentTypeAsc: 'Document Type Ascending',
    byOrgDocumentTypeDesc: 'Document Type Descending',
    byStatusAsc: 'Status Ascending',
    byStatusDesc: 'Status Descending',
    byOrgDocumentIdAsc: 'Document Number Ascending',
    byOrgDocumentIdDesc: 'Document Number Descending',
  },
  statuses: {
    open: 'Open',
    closed: 'Closed',
    all: 'All',
  },
  filterByOptions: {
    orgDocumentId: 'Document Number',
    orgDocumentIdRange: 'Document Number Range',
    orgDocumentType: 'Document Type',
    createdAtDateRange: 'Created On Range',
    dueAtDateRange: 'Due On Range',
    amountRange: 'Original Amount Range',
    openAmountRange: 'Open Amount Range',
  },
  sortBy: 'Sort By',
  sortDocuments: 'Sort documents',
  filter: {
    status: 'Status',
    filterBy: 'Filter By',
    documentNumber: 'Document Number',
    documentType: 'Document Type',
    startRange: 'From',
    endRange: 'To',
    clear: 'Clear All',
    search: 'Search',
    errors: {
      toDateMustComeAfterFrom:
        "Choose an end date that's later than the start date.",
      toAmountMustBeLargeThanFrom:
        "Choose an end range value that's smaller than the start value.",
    },
  },
  hint: 'Account summaries allow you to review general information about a unit, including balances and aging summary of invoices. Here, you can also browse through a list of transaction documents for a unit.',
};

export const orgAccountSummaryList = {
  breadcrumbs: {
    list: 'Account Summaries',
    details: '{{name}}',
  },
};

export const accountSummary = {
  orgAccountSummary,
  orgAccountSummaryList,
};
