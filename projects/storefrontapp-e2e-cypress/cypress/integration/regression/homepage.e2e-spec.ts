context('Homepage', () => {
  before(() => {
    cy.visit('/');
  });

  it('should display title', () => {
    cy.title().should('not.be.empty');
  });

  it('should have site logo', () => {
    cy.get('cx-page-slot.SiteLogo').should('be.visible');
  });

  it('should have splash banner', () => {
    cy.get('cx-page-slot.Section1 cx-banner');
  });

  it('should have consent preferences', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.btn-primary').click();
    cy.get('.btn').should('contain.text', 'Consent');
    cy.get('.btn').click();
    
    cy.get('.cx-dialog-header > h3').should('contain.text', 'Consent Management');
    cy.get('.close > span > .cx-icon').click();
    /* ==== End Cypress Studio ==== */
  });
  
  it('should have footer with footer navigation and notice', () => {
    cy.get('cx-page-slot.Footer').within(() => {
      cy.get('cx-navigation-ui > nav').should('have.length', 3);
      cy.get('span').should('have.length', 3);
      cy.get('cx-generic-link').should('have.length', 8);
    });
    cy.get('cx-paragraph .cx-notice').should(
      'contain',
      'SAP SE or an SAP affiliate company. All rights reserved.'
    );
  });

  it('should validate main navigation', () => {
    /* ==== Generated with Cypress Studio ==== */
    // Brands
    cy.get('.flyout > :nth-child(2) > [tabindex="0"]').click();
    cy.get('nav.is-open > :nth-child(2) > cx-generic-link.all > .all').click();
    cy.url().should('contain', 'brands');
    cy.visit('/');

    // Digital Cameras
    cy.get('.flyout > :nth-child(3) > span').click();
    //cy.get('nav.is-open > :nth-child(3) > cx-generic-link.all > .all').click();
    cy.get('nav.is-open > .wrapper > cx-generic-link.all > .all').click();
    cy.url().should('contain', 'Digital');
    cy.visit('/');

    // Film Cameras
    cy.get('.flyout > :nth-child(4) > cx-generic-link > a').click();
    cy.url().should('contain', 'Film');
    cy.visit('/');
        
    // Camcorders
    cy.get('.flyout > :nth-child(5) > cx-generic-link > a').click();
    cy.url().should('contain', 'Camcorders');
    cy.visit('/');

    // Webcams
    cy.get('.flyout > :nth-child(6) > cx-generic-link > a').click();
    cy.url().should('contain', 'Webcams');
    cy.visit('/');

    // Accessories
    cy.get(':nth-child(7) > [tabindex="0"]').click();
    //cy.get('nav.is-open > :nth-child(7) > cx-generic-link.all > .all').click();
    cy.get('nav.is-open > .wrapper > cx-generic-link.all > .all').click();
    cy.url().should('contain', 'Accessories');
    cy.visit('/');
    /* ==== End Cypress Studio ==== */
  
  });

  it('should validate carrousels', () => {
    // Our Bestselling Products. Via arrows. Forward Navigation.
    /* ==== Generated with Cypress Studio ==== */
    cy.get(':nth-child(1) > cx-carousel > .carousel-panel > .slides > .slide.active > :nth-child(1) > a > .is-initialized > img').click();
    cy.visit('/');
    cy.get(':nth-child(1) > cx-carousel > .carousel-panel > .next > .cx-icon').click();
    cy.get(':nth-child(1) > cx-carousel > .carousel-panel > .slides > .slide.active > :nth-child(1) > a > .is-initialized > img').click();
    cy.visit('/');
    cy.get(':nth-child(1) > cx-carousel > .carousel-panel > .next > .cx-icon').click();
    cy.get(':nth-child(1) > cx-carousel > .carousel-panel > .next > .cx-icon').click();
    cy.get(':nth-child(1) > cx-carousel > .carousel-panel > .next > .cx-icon').click();
    cy.get(':nth-child(1) > cx-carousel > .carousel-panel > .slides > .slide.active > :nth-child(1) > a > .is-initialized > img').click();
    cy.visit('/');
    /* ==== End Cypress Studio ==== */

    // What's new. Via buttons. Forward Navigation
    
    /* ==== Generated with Cypress Studio ==== */
    cy.get(':nth-child(2) > cx-carousel > .carousel-panel > .slides > .slide.active > :nth-child(1) > a > .is-initialized > img').click();
    //cy.get('a > .is-initialized > img').click();
    cy.visit('/');
    cy.get(':nth-child(2) > cx-carousel > .indicators > [aria-label="Slide 2"] > .cx-icon').click();
    cy.get(':nth-child(2) > cx-carousel > .carousel-panel > .slides > .slide.active > :nth-child(1) > a > .is-initialized > img').click();
    //cy.get('cx-generic-link > a > .is-initialized > img').click();
    cy.visit('/');
    cy.get(':nth-child(2) > cx-carousel > .indicators > [aria-label="Slide 3"] > .cx-icon').click();
    cy.get(':nth-child(2) > cx-carousel > .carousel-panel > .slides > .slide.active > .item > a > .is-initialized > img').click();
    //cy.get('a > .is-initialized > img').click();
    cy.visit('/');
    /* ==== End Cypress Studio ==== */

  });

  it('should validate category slots', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.Section2A > :nth-child(1) > cx-generic-link > a > .is-initialized > img').click();
    cy.get('nav > :nth-child(2) > a').should('contain', 'Digital');
    cy.visit('/');

    cy.get('.Section2A > :nth-child(2) > cx-generic-link > a > .is-initialized > img').click();
    cy.get('nav > :nth-child(2) > a').should('contain', 'Lenses');
    cy.visit('/');

    cy.get('.Section2B > :nth-child(1) > cx-generic-link > a > .is-initialized > img').click();
    cy.get('nav > :nth-child(2) > a').should('contain', 'Camcorders');
    cy.visit('/');

    cy.get('.Section2B > :nth-child(2) > cx-generic-link > a > .is-initialized > img').click();
    cy.get('nav > :nth-child(2) > a').should('contain', 'Supplies');
    cy.visit('/');
    /* ==== End Cypress Studio ==== */


  });

  it('should validate products visibility', () =>{
    // Check first and last specific product in slot near footer. 
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.Section4 > :nth-child(1) > cx-generic-link > a > .is-initialized > img').click();
    cy.get('h1').should('contain', 'Web Camera');
    cy.visit('/');

    cy.get(':nth-child(4) > cx-generic-link > a > .is-initialized > img').click();
    cy.get('h1').should('contain', 'Light');
        cy.visit('/');
    /* ==== End Cypress Studio ==== */
  });

  it('should validate all header components', () => {
    /* ==== Generated with Cypress Studio ==== */
    // Quick Order
    cy.get('.SiteLinks > :nth-child(1) > cx-generic-link > a').click();
    cy.url().should('contain', 'quick-order');
    
    cy.visit('/');

    // Find a Store
    cy.get('.SiteLinks > :nth-child(2) > cx-generic-link > a').click();
    cy.url().should('contain', 'store-finder');
    cy.get('.SiteLogo > cx-banner > cx-generic-link > a > .is-initialized > img').click();
    
    // Contact Us
    cy.get('.SiteLinks > :nth-child(3) > cx-generic-link > a').click();
    cy.url().should('contain', 'contact');
    cy.visit('/');
    
    // Help
    cy.get('.SiteLinks > :nth-child(4) > cx-generic-link > a').click();
    cy.url().should('contain', 'faq');
    cy.visit('/');
    
    // Change language
    cy.get(':nth-child(1) > label > .small').click();
    cy.get(':nth-child(1) > label > select').select('de');
    cy.url().should('contain', 'de');
    cy.get(':nth-child(1) > label > select').select('en');
    cy.url().should('contain', 'en');

    // Change currency
    cy.get(':nth-child(2) > label > select').select('JPY');
    cy.url().should('contain', 'JPY');
    cy.get(':nth-child(2) > label > select').select('USD');
    cy.url().should('contain', 'USD');

    // Visit login page
    cy.get('cx-login > a').click();
    cy.url().should('contain', 'login');
    cy.visit('/');
    
    // Visit empty cart
    cy.get('.count').click();
    cy.url().should('contain', 'cart');
    cy.visit('/');

    // Search box should be visible
    cy.get('.searchbox').should('be.visible');
    /* ==== End Cypress Studio ==== */

  });
});
