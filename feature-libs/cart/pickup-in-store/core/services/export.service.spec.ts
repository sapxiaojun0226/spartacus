import { TestBed } from '@angular/core/testing';
import { PickupInStoreConfig } from '../config/pickup-in-store-config';
import { ExportService } from './export.service';

const mockImportExportConfig: PickupInStoreConfig = {
  importExport: {
    file: { separator: ',' },
  },
};

const mockEntries = [
  {
    sku: 'Sku',
    quantity: 'Quantity',
    name: 'Name',
    price: 'Price',
  },
  {
    sku: '4567133',
    quantity: 1,
    name: 'PSM 80 A',
    price: '$12.00',
  },
  {
    sku: '3881027',
    quantity: 1,
    name: 'Screwdriver BT-SD 3,6/1 Li',
    price: '$26.00',
  },
  {
    sku: '3794609',
    quantity: 1,
    name: '2.4V Şarjli Tornavida, Tüp Ambalaj',
    price: '$30,200.00',
  },
];

const mockCsvString =
  'Sku,Quantity,Name,Price\r\n4567133,1,PSM 80 A,$12.00\r\n3881027,1,"Screwdriver BT-SD 3,6/1 Li",$26.00\r\n3794609,1,"2.4V Şarjli Tornavida, Tüp Ambalaj","$30,200.00"\r\n';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ImportExportConfig, useValue: mockImportExportConfig },
      ],
    });
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert array to csv string', () => {
    expect(service.dataToCsv(mockEntries)).toBe(mockCsvString);
  });
});
