import { RoutingConfig } from '@spartacus/core';

export const defaultCheckoutScheduledReplenishmentRoutingConfig: RoutingConfig =
  // TODO: remove BRIAN
  {
    routing: {
      routes: {
        replenishmentConfirmation: { paths: ['replenishment/confirmation'] },
      },
    },
  };
