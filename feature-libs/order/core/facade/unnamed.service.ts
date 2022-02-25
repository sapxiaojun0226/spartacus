import { Injectable } from '@angular/core';
import { ActiveCartFacade, RemoveCartEvent } from '@spartacus/cart/base/root';
import {
  Command,
  CommandService,
  CommandStrategy,
  EventService,
  OCC_USER_ID_ANONYMOUS,
  UserIdService,
} from '@spartacus/core';
import {
  CheckoutOrderPlacedEvent,
  Order,
  UnnamedFacade,
} from '@spartacus/order/root';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { UnnamedConnector } from '../connectors/unnamed.connector';

@Injectable()
export class UnnamedService implements UnnamedFacade {
  protected order$ = new BehaviorSubject<Partial<Order> | undefined>({
    code: 'test',
  });

  protected placeOrderCommand: Command<boolean, Order> =
    this.commandService.create<boolean, Order>(
      (payload) =>
        this.checkoutPreconditions().pipe(
          switchMap(([userId, cartId]) =>
            this.checkoutConnector.placeOrder(userId, cartId, payload).pipe(
              tap((order) => {
                console.log('ordered');
                this.order$.next(order);
                this.eventService.dispatch(
                  {
                    userId,
                    cartId,
                    /**
                     * As we know the cart is not anonymous (precondition checked),
                     * we can safely use the cartId, which is actually the cart.code.
                     */
                    cartCode: cartId,
                  },
                  RemoveCartEvent
                );
                this.eventService.dispatch(
                  {
                    userId,
                    cartId,
                    order,
                  },
                  CheckoutOrderPlacedEvent
                );
              })
            )
          )
        ),
      {
        strategy: CommandStrategy.CancelPrevious,
      }
    );

  constructor(
    protected activeCartFacade: ActiveCartFacade,
    protected userIdService: UserIdService,
    protected commandService: CommandService,
    protected checkoutConnector: UnnamedConnector,
    protected eventService: EventService
  ) {
    console.log('unnamed service instantiate');
  }

  /**
   * Performs the necessary checkout preconditions.
   */
  protected checkoutPreconditions(): Observable<[string, string]> {
    console.log('1 precondi');
    return combineLatest([
      this.userIdService.takeUserId(),
      this.activeCartFacade.takeActiveCartId(),
      this.activeCartFacade.isGuestCart(),
    ]).pipe(
      take(1),
      map(([userId, cartId, isGuestCart]) => {
        console.log('2 precondi');
        if (
          !userId ||
          !cartId ||
          (userId === OCC_USER_ID_ANONYMOUS && !isGuestCart)
        ) {
          console.log('3 error precondi');
          throw new Error('Checkout conditions not met');
        }
        console.log('last precondi');
        return [userId, cartId];
      })
    );
  }

  placeOrder(termsChecked: boolean): Observable<Order> {
    console.log('unnamed called place order');
    return this.placeOrderCommand.execute(termsChecked);
  }

  getCurrentOrderDetails(): Observable<Order | undefined> {
    return this.order$.asObservable();
  }

  clearCurrentOrder(): void {
    this.order$.next(undefined);
  }

  setCurrentOrder(order: Order): void {
    this.order$.next(order);
  }
}
