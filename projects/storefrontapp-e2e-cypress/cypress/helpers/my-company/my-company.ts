import { CONTEXT_URL_EN_USD } from '../site-context-selector';
import { MyCompanyRowConfig, MyCompanyConfig } from './models/index';
import { testListFromConfig } from './my-company-list';
import { testDetailsFromConfig } from './my-company-details';
import { testCreateUpdateFromConfig } from './my-company-form';
import { testAssignmentFromConfig } from './my-company-assign';
import { nextPage } from '../product-search';

export function testMyCompanyFeatureFromConfig(config: MyCompanyConfig) {
  describe(`My Company - ${config.name}`, () => {
    testListFromConfig(config);
    testDetailsFromConfig(config);
    testCreateUpdateFromConfig(config);
    testAssignmentFromConfig(config);
  });
}

export function checkRowHeaders(rowConfigs: any): void {
  rowConfigs.forEach((config: any) => {
    cy.get('th').should('contain.text', config.label);
  });
}

export function checkRows(rows): void {
  let j = 1; // Skip header table row at 0
  rows.forEach((row: any) => {
    if (row.text.length) {
      cy.get('tr')
        .eq(j)
        .within(() => {
          for (let i = 0; i < row.text.length; i++) {
            if (row.text[i]) {
              cy.get('td').eq(i).should('contain.text', row.text[i]);
              if (row.links && row.links[i]) {
                cy.get('td')
                  .eq(i)
                  .should(
                    'contain.html',
                    `href="${CONTEXT_URL_EN_USD}${row.links[i]}`
                  );
              }
            }
          }
        });
      j++;
    }
  });
}

export function getListRowsFromBody(
  body,
  objectType,
  rows: MyCompanyRowConfig[]
) {
  return body[objectType].map((data) => {
    const table = { text: [], links: [] };
    rows.map((row) => {
      // if (!data.hasOwnProperty('selected') || data.selected) {
      const foundText = row.variableName
        .split('.')
        .reduce((p, c) => (p && p[c]) || null, data);
      table.text.push(foundText);
      table.links.push(row.link ? row.link : null);
      // }
    });
    return table;
  });
}

export function waitForData(thenCommand, waitForCommand?): void {
  waitForCommand;
  cy.wait('@getData').then((xhr: any) => {
    if (xhr.aborted) {
      waitForData(thenCommand);
    } else {
      thenCommand(xhr?.response?.body);
    }
  });
}

export function verifyList(rows, rowConfig): void {
  cy.get('cx-table').within(() => {
    checkRowHeaders(rowConfig);
    checkRows(rows);
  });
}

export function loginAsMyCompanyAdmin(): void {
  cy.requireLoggedIn({
    user: 'linda.wolf@rustic-hw.com',
    registrationData: {
      firstName: 'Linda',
      lastName: 'Wolf',
      titleCode: '',
      password: '12341234',
      email: 'linda.wolf@rustic-hw.com',
    },
  });
}

export function ngSelect(sortKey: string): void {
  cy.get('.ng-select').click();
  cy.get('.ng-select .ng-dropdown-panel-items')
    .contains(new RegExp(`^${sortKey}$`, 'g'))
    .click({ force: true });
}

export function scanTablePagesForText(text: string, config): void {
  cy.get('cx-table').then(($table) => {
    if ($table.text().indexOf(text) === -1) {
      cy.server();
      cy.route('GET', `**/${config.apiEndpoint}**`).as('getData');
      nextPage();
      cy.wait('@getData');
      scanTablePagesForText(text, config);
    }
  });
}
