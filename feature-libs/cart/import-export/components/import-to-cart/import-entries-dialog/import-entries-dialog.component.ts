import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AddOrderEntriesContext,
  OrderEntriesSource,
  ProductData,
  ProductImportInfo,
  ProductImportStatus,
  ProductImportSummary,
} from '@spartacus/cart/base/root';
import {
  FocusConfig,
  ICON_TYPE,
  LaunchDialogService,
} from '@spartacus/storefront';
import { SavedCartFacade } from 'feature-libs/cart/saved-cart/root';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, pluck } from 'rxjs/operators';

@Component({
  selector: 'cx-import-entries-dialog',
  templateUrl: './import-entries-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportEntriesDialogComponent {
  iconTypes = ICON_TYPE;
  focusConfig: FocusConfig = {
    trap: true,
    block: true,
    autofocus: 'button',
    focusOnEscape: true,
  };

  formState: boolean = true;
  summary$ = new BehaviorSubject<ProductImportSummary>({
    cartId: '',
    loading: false,
    cartName: '',
    count: 0,
    total: 0,
    successesCount: 0,
    warningMessages: [],
    errorMessages: [],
  });

  context$: Observable<AddOrderEntriesContext> =
    this.launchDialogService.data$.pipe(pluck('orderEntriesContext'));

  constructor(
    protected launchDialogService: LaunchDialogService,
    protected savedCartService: SavedCartFacade
  ) {}

  isNewCartForm(context: AddOrderEntriesContext) {
    return context.type === OrderEntriesSource.NEW_SAVED_CART;
  }

  close(reason: string): void {
    this.launchDialogService.closeDialog(reason);
  }

  importProducts(
    context: AddOrderEntriesContext,
    {
      products,
      savedCartInfo,
    }: {
      products: ProductData[];
      savedCartInfo?: {
        name: string;
        description: string;
      };
    }
  ): void {
    this.formState = false;
    this.summary$.next({
      ...this.summary$.value,
      loading: true,
      total: products.length,
      cartName: savedCartInfo?.name,
    });
    context
      .addEntries(products, savedCartInfo)
      .pipe(
        // tap(()=> this.savedCartService.deleteSavedCart(this.summary$.value.cartId)),
        finalize(() => {
          this.summary$.next({
            ...this.summary$.value,
            loading: false,
          });
          console.log(
            '**** import-entries-dialog.component.ts: finalize' +
              this.summary$.value.cartId
          );
          if (
            this.summary$.value.successesCount === 0 &&
            this.summary$.value.cartId
          ) {
            console.log('**** all failed: ' + this.summary$.value.cartId);
            // remove cart
            this.savedCartService.deleteSavedCart(this.summary$.value.cartId);
          }
        })
      )
      .subscribe((action: ProductImportInfo) => {
        console.log('**** addEntries subscribe');
        this.populateSummary(action);
      });
  }

  protected populateSummary(action: ProductImportInfo): void {
    if (action.statusCode === ProductImportStatus.SUCCESS) {
      this.summary$.next({
        ...this.summary$.value,
        cartId: action.cartId,
        count: this.summary$.value.count + 1,
        successesCount: this.summary$.value.successesCount + 1,
      });
    } else if (action.statusCode === ProductImportStatus.LOW_STOCK) {
      this.summary$.next({
        ...this.summary$.value,
        cartId: action.cartId,
        count: this.summary$.value.count + 1,
        warningMessages: [...this.summary$.value.warningMessages, action],
      });
    } else {
      this.summary$.next({
        ...this.summary$.value,
        cartId: action.cartId,
        count: this.summary$.value.count + 1,
        errorMessages: [...this.summary$.value.errorMessages, action],
      });
    }
  }
}
