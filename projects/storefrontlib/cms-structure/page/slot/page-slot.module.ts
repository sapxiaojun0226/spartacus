import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OutletModule } from '../../outlet/outlet.module';
import { PageComponentModule } from '../component/page-component.module';
import { PageSlotComponent } from './page-slot.component';
import { PageSlotService } from './page-slot.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  imports: [CommonModule, OutletModule, PageComponentModule, MatGridListModule, FlexLayoutModule],
  declarations: [PageSlotComponent],
  exports: [PageSlotComponent],
})
export class PageSlotModule {
  // instantiate PageSlotService ASAP, so it can examine SSR pre-rendered DOM
  constructor(_pageSlot: PageSlotService) {}
}
