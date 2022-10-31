/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

export const asm = {
  asm: {
    mainLogoLabel: 'SAP',
    mainTitle: 'Assisted Service Mode',
    logout: 'Sign Out',
    hideUi: 'Close ASM',
    customers: 'Customers',
    toggleUi: {
      collapse: 'Hide ASM',
      expand: 'Show ASM',
    },
    loginForm: {
      submit: 'Sign In',
      userId: {
        label: 'Agent ID',
        required: 'Agent ID is required',
      },
      password: {
        label: 'Password',
        required: 'Password is required',
      },
    },
    customerSearch: {
      searchTerm: {
        label: 'Customer Name/Email Address',
      },
      submit: 'Start Session',
      noMatch: 'No customer found.',
    },
    customerList: {
      title: 'Customer List',
      description: 'Select a customer from one of several provided lists.',
      tableHeader: {
        customer: 'Customer',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        cart: 'Cart',
        order: 'Order',
      },
      tableSort: {
        sortBy: 'Sort by',
        byNameAsc: 'Name (Asc)',
        byNameDesc: 'Name (Desc)',
        byDateAsc: 'Date (Asc)',
        byDateDesc: 'Date (Desc)',
        byOrderDateAsc: 'Order date (Asc)',
        byOrderDateDesc: 'Order date (Desc)',
      },
      page: {
        page: 'Page {{count}}',
        previous: 'Previous',
        next: 'Next',
      },
      noOfCustomers: '{{count}} Customers',
      noCustomers: 'There are currently no customers in this customer list.',
    },

    bindCart: {
      cartNumber: 'Cart Number',
      bindCartToCustomer: 'Assign Cart to Customer',
      success: 'Cart has been successfully assigned',
      assignCartId: 'Assign a cart id to customer',
      enterCartId: 'Enter cart id',
      resetCartId: 'Reset',
    },
    csagentTokenExpired: 'Your customer support agent session is expired.',
    endSession: 'End Session',
    agentSessionTimer: {
      label: 'Session Timeout',
      minutes: 'min',
      reset: 'Reset',
    },
    auth: {
      agentLoggedInError:
        'Cannot login as user when there is an active CS agent session. Please either emulate user or logout CS agent.',
    },
    error: {
      noCustomerId:
        'No customerId found for selected user. Session cannot be started.',
    },
  },
};
