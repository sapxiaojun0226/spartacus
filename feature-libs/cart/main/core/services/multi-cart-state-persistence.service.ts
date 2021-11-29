import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { CartPersistentStorageChangeEvent } from '@spartacus/cart/main/root';
import {
  BASE_SITE_CONTEXT_ID,
  EventService,
  SiteContextParamsService,
  StatePersistenceService,
} from '@spartacus/core';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilKeyChanged, filter, map } from 'rxjs/operators';
import { CartActions, MultiCartSelectors } from '../store';
import { StateWithMultiCart } from '../store/multi-cart-state';

@Injectable({
  providedIn: 'root',
})
export class MultiCartStatePersistenceService implements OnDestroy {
  protected subscription = new Subscription();

  constructor(
    protected statePersistenceService: StatePersistenceService,
    protected store: Store<StateWithMultiCart>,
    protected siteContextParamsService: SiteContextParamsService,
    protected eventService: EventService
  ) {}

  public initSync() {
    this.subscription.add(
      this.statePersistenceService.syncWithStorage({
        key: 'cart',
        state$: this.getCartState(),
        context$: this.siteContextParamsService.getValues([
          BASE_SITE_CONTEXT_ID,
        ]),
        onRead: (state) => this.onRead(state),
        onPersist: (state) => this.onPersist(state),
      })
    );
  }

  protected getCartState(): Observable<{ active: string }> {
    return this.store.pipe(
      // Since getCartState() may be called while the module is lazy loded
      // The cart state slice may not exist yet in the first store emissions.
      filter((store) => !!store.cart),
      select(MultiCartSelectors.getMultiCartState),
      filter((state) => !!state),
      distinctUntilKeyChanged('active'),
      map((state) => {
        return {
          active: state.active ?? '',
        };
      })
    );
  }

  protected onRead(state: { active: string } | undefined) {
    this.store.dispatch(new CartActions.ClearCartState());
    if (state) {
      this.store.dispatch(new CartActions.SetActiveCartId(state.active));
    } else {
      this.store.dispatch(new CartActions.SetActiveCartId(''));
    }
  }

  protected onPersist(state: { active: string } | undefined) {
    const event = new CartPersistentStorageChangeEvent();
    event.state = state;
    this.eventService.dispatch(event);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
