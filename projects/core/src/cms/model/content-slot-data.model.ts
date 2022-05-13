import { ContentSlotComponentData } from './content-slot-component-data.model';
import { ContentSlotLayoutData } from "./content-slot-layout-data.model";

export interface ContentSlotData {
  components?: ContentSlotComponentData[];
  layouts?: ContentSlotLayout;
  slotHeight?: number;
  slotCols?: number;
  properties?: any;
}

export interface ContentSlotLayout {
  layout?: ContentSlotLayoutData[]
}
