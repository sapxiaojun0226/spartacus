import { TestBed } from '@angular/core/testing';
import { CartEventBuilder } from './cart-event.builder';
import { CartEventModule } from './cart-event.module';

describe('CartEventModule', () => {
  let cartEventBuilderFactory;

  beforeEach(() => {
    cartEventBuilderFactory = jest.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CartEventBuilder,
          useFactory: cartEventBuilderFactory,
        },
      ],
      imports: [CartEventModule],
    });

    TestBed.inject(CartEventModule);
  });

  it('should initialize CartEventBuilder', () => {
    expect(cartEventBuilderFactory).toHaveBeenCalled();
  });
});
