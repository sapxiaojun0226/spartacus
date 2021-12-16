import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CartEntryAdapter } from './cart-entry.adapter';
import { CartEntryConnector } from './cart-entry.connector';

describe('CartEntryConnector', () => {
  class MockCartEntryAdapter implements CartEntryAdapter {
    add = jest.fn().mockReturnValue(of({}));
    update = jest.fn().mockReturnValue(of({}));
    remove = jest.fn().mockReturnValue(of({}));
  }

  let service: CartEntryConnector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CartEntryAdapter, useClass: MockCartEntryAdapter },
      ],
    });

    service = TestBed.inject(CartEntryConnector);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('add should call adapter', () => {
    const adapter = TestBed.inject(CartEntryAdapter);
    service.add('1', '2', '3').subscribe();
    expect(adapter.add).toHaveBeenCalledWith('1', '2', '3', undefined);
  });

  it('update should call adapter', () => {
    const adapter = TestBed.inject(CartEntryAdapter);
    service.update('1', '2', '3', 4).subscribe();
    expect(adapter.update).toHaveBeenCalledWith('1', '2', '3', 4, undefined);
  });

  it('remove should call adapter', () => {
    const adapter = TestBed.inject(CartEntryAdapter);
    service.remove('1', '2', '3').subscribe();
    expect(adapter.remove).toHaveBeenCalledWith('1', '2', '3');
  });
});
