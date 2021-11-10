import * as checkout from '../../../helpers/checkout-flow';
import { viewportContext } from '../../../helpers/viewport-context';
import { getSampleUser } from '../../../sample-data/checkout-flow';

context('Checkout flow', () => {
  viewportContext(['mobile', 'desktop'], () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.sessionStorage.clear();
      });
    });

    it('should perform checkout', () => {
      const user = getSampleUser();
      checkout.visitHomePage();

      checkout.clickHamburger();

      checkout.registerUser(false, user);
      checkout.goToCheapProductDetailsPage();
      checkout.addCheapProductToCartAndLogin(user);
      checkout.fillAddressFormWithCheapProduct(user);
      checkout.verifyDeliveryMethod();
      checkout.fillPaymentFormWithCheapProduct(user);
      checkout.placeOrderWithCheapProduct(user);
      checkout.verifyOrderConfirmationPageWithCheapProduct(user);

      // Cypress Studio stuff: 
      /* ==== Generated with Cypress Studio ==== */
      //cy.get('.searchbox > input').clear();
      //cy.get('.searchbox > input').type('video');
      //cy.get(':nth-child(1) > .has-media > .name').click();
      cy.visit('http://localhost:4200/electronics-spa/en/USD/product/266685/battery-video-light');
      cy.get('[aria-label="Add one more"]').click();
      cy.get('form.ng-untouched > .btn').click();
      cy.get('.cx-dialog-buttons > .btn-primary').click();
      cy.get('.cx-progress-button-container').click();
      cy.get('.cx-card-link').click();
      cy.get(':nth-child(2) > .cx-btn').click();
      cy.get(':nth-child(3) > .cx-delivery-label > .cx-delivery-mode').click();
      cy.get('#deliveryMode-premium-gross').check();
      cy.get(':nth-child(2) > .btn').click();
      cy.get(':nth-child(3) > .col-md-12 > .btn').click();
      cy.get('.form-group.ng-untouched > :nth-child(1) > label > .ng-select > .ng-select-container').click();
      cy.get('.form-group.ng-untouched > :nth-child(1) > label > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click();
      cy.get('#a26b90c06f49-3').click();
      cy.get('.form-group.ng-touched > :nth-child(1) > label > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click();
      cy.get('.col-md-12 > :nth-child(2) > label > .form-control').clear();
      cy.get('.col-md-12 > :nth-child(2) > label > .form-control').type('Jack Daniels');
      cy.get(':nth-child(3) > label > .form-control').clear();
      cy.get(':nth-child(3) > label > .form-control').type('4111111111111111');
      cy.get(':nth-child(2) > .ng-select > .ng-select-container > .ng-arrow-wrapper').click();
      cy.get(':nth-child(2) > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click();
      cy.get('#a26948c8c47d-1').click();
      cy.get(':nth-child(2) > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click();
      cy.get(':nth-child(3) > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click();
      cy.get('#af09bf200622-2').click();
      cy.get(':nth-child(3) > .ng-select > .ng-select-container > .ng-value-container > .ng-input > input').click();
      cy.get('#cVVNumber').clear();
      cy.get('#cVVNumber').type('234');
      cy.get('.SideContent').click();
      cy.get(':nth-child(5) > .form-check > label > .form-check-label').click();
      cy.get(':nth-child(5) > .form-check > label > .form-check-input').check();
      cy.get(':nth-child(2) > .btn').click();
      cy.get('cx-mini-cart > a').click();
      cy.get('.flyout > :nth-child(4) > cx-generic-link > a').click();
      cy.get(':nth-child(2) > :nth-child(1) > :nth-child(2) > .row > .col-md-4 > cx-add-to-cart > .ng-untouched > .btn').click();
      cy.get('.cx-dialog-buttons > .btn-primary').click();
      cy.get('.cx-progress-button-container').click();
      cy.get('.cx-card-link').click();
      cy.get(':nth-child(2) > .cx-btn').click();
      cy.get(':nth-child(3) > .cx-delivery-label > .cx-delivery-mode').click();
      cy.get('#deliveryMode-premium-gross').check();
      cy.get(':nth-child(2) > .btn').click();
      cy.get(':nth-child(1) > .cx-payment-card-inner > cx-card > .cx-card > .card-body > .cx-card-actions > :nth-child(1) > div > .cx-card-link').click();
      cy.get(':nth-child(2) > .btn').click();
      cy.get('.scaled-input').check();
      cy.get('.cx-place-order-form > .btn').click();
      /* ==== End Cypress Studio ==== */

    });
  });
});
