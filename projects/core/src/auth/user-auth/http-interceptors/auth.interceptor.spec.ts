import {
  HttpClient,
  HttpParams,
  HttpRequest,
  HttpUserEvent,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable, of, Subscription } from 'rxjs';
import { AuthToken } from '../models/auth-token.model';
import { AuthConfigService } from '../services/auth-config.service';
import { AuthHttpHeaderService } from '../services/auth-http-header.service';
import { AuthInterceptor } from './auth.interceptor';

class MockAuthHeaderService implements Partial<AuthHttpHeaderService> {
  alterRequest(req) {
    return req;
  }
  getStableToken() {
    return of(undefined);
  }
  shouldCatchError() {
    return true;
  }
  shouldAddAuthorizationHeader() {
    return true;
  }
  handleExpiredAccessToken() {
    return of() as Observable<HttpUserEvent<AuthToken>>;
  }
  handleExpiredRefreshToken() {}
}

class MockAuthConfigService implements Partial<AuthConfigService> {
  getTokenEndpoint() {
    return '/authorizationserver/token';
  }
}

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let authHeaderService: AuthHttpHeaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthHttpHeaderService, useClass: MockAuthHeaderService },
        { provide: AuthConfigService, useClass: MockAuthConfigService },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    authHeaderService = TestBed.inject(AuthHttpHeaderService);
    http = TestBed.inject(HttpClient);
  });

  it('should not add header when the request should does not need it', (done) => {
    jest.spyOn(authHeaderService, 'shouldAddAuthorizationHeader').mockReturnValue(
      false
    );
    jest.spyOn(authHeaderService, 'alterRequest').mockReturnValue(
      new HttpRequest('GET', '/test')
    );
    jest.spyOn(authHeaderService, 'getStableToken').mockReturnValue(
      of({ access_token: 'test' } as AuthToken)
    );

    const sub: Subscription = http.get('/xxx').subscribe((result) => {
      expect(result).toBeTruthy();
      expect(authHeaderService.alterRequest).toHaveBeenCalledWith(
        expect.anything(),
        undefined
      );
      done();
    });

    const mockReq: TestRequest = httpMock.expectOne((req) => {
      return req.method === 'GET' && req.url === '/test';
    });

    mockReq.flush('someData');
    sub.unsubscribe();
  });

  it(`Should operate on request returned from AuthHeaderService alterRequest method`, (done) => {
    jest.spyOn(authHeaderService, 'alterRequest').mockReturnValue(
      new HttpRequest('GET', '/test')
    );
    const token = { access_token: 'test' } as AuthToken;
    jest.spyOn(authHeaderService, 'getStableToken').mockReturnValue(of(token));

    const sub: Subscription = http.get('/xxx').subscribe((result) => {
      expect(result).toBeTruthy();
      expect(authHeaderService.alterRequest).toHaveBeenCalledWith(
        expect.anything(),
        token
      );
      done();
    });

    const mockReq: TestRequest = httpMock.expectOne((req) => {
      return req.method === 'GET' && req.url === '/test';
    });

    mockReq.flush('someData');
    sub.unsubscribe();
  });

  it(`Should handle 401 error for expired token occ calls`, (done) => {
    jest.spyOn(authHeaderService, 'handleExpiredAccessToken').mockImplementation(
      (_, next) => next.handle(new HttpRequest('GET', '/test'))
    );
    const sub: Subscription = http.get('/occ').subscribe((result) => {
      expect(result).toEqual('someText');
      done();
    });

    const mockReq: TestRequest = httpMock.expectOne((req) => {
      return req.method === 'GET' && req.url === '/occ';
    });

    mockReq.flush(
      { errors: [{ type: 'InvalidTokenError' }] },
      { status: 401, statusText: 'Unauthorized' }
    );

    const mockReq2: TestRequest = httpMock.expectOne((req) => {
      return req.method === 'GET' && req.url === '/test';
    });
    mockReq2.flush('someText');
    sub.unsubscribe();
  });

  it(`Should not handle 401 error for expired token non-occ calls`, (done) => {
    jest.spyOn(authHeaderService, 'shouldCatchError').mockReturnValue(false);

    const sub: Subscription = http.get('/occ').subscribe(
      () => {},
      (err) => {
        expect(err.status).toEqual(401);
        expect(err.error.errors[0].type).toEqual('InvalidTokenError');
        done();
      }
    );

    const mockReq: TestRequest = httpMock.expectOne((req) => {
      return req.method === 'GET' && req.url === '/occ';
    });

    mockReq.flush(
      { errors: [{ type: 'InvalidTokenError' }] },
      { status: 401, statusText: 'Unauthorized' }
    );

    sub.unsubscribe();
  });

  it(`Should not handle 401 error for non expired token occ calls`, (done) => {
    const sub: Subscription = http.get('/occ').subscribe(
      () => {},
      (err) => {
        expect(err.status).toEqual(401);
        expect(err.error.errors[0].type).toEqual('Different error');
        done();
      }
    );

    const mockReq: TestRequest = httpMock.expectOne((req) => {
      return req.method === 'GET' && req.url === '/occ';
    });

    mockReq.flush(
      { errors: [{ type: 'Different error' }] },
      { status: 401, statusText: 'Unauthorized' }
    );

    sub.unsubscribe();
  });

  it(`Should handle 401 error invalid_token calls`, (done) => {
    jest.spyOn(authHeaderService, 'handleExpiredRefreshToken');
    const sub: Subscription = http.get('/authorizationserver/token').subscribe(
      () => {},
      () => {},
      () => {
        expect(authHeaderService.handleExpiredRefreshToken).toHaveBeenCalled();
        done();
      }
    );

    const mockReq: TestRequest = httpMock.expectOne((req) => {
      return req.method === 'GET' && req.url === '/authorizationserver/token';
    });

    mockReq.flush(
      { error: 'invalid_token' },
      { status: 401, statusText: 'Unauthorized' }
    );
    sub.unsubscribe();
  });

  it(`Should not handle 401 error invalid_token calls for non token endpoints`, (done) => {
    jest.spyOn(authHeaderService, 'handleExpiredRefreshToken');
    const sub: Subscription = http.get('/custom-url').subscribe(
      () => {},
      (err) => {
        expect(err.status).toEqual(401);
        expect(err.error.error).toEqual('invalid_token');
        done();
      }
    );

    const mockReq: TestRequest = httpMock.expectOne((req) => {
      return req.method === 'GET' && req.url === '/custom-url';
    });

    mockReq.flush(
      { error: 'invalid_token' },
      { status: 401, statusText: 'Unauthorized' }
    );
    sub.unsubscribe();
  });

  it(`Should handle 400 error invalid_grant calls`, (done) => {
    jest.spyOn(authHeaderService, 'handleExpiredRefreshToken');
    const params = new HttpParams().set('grant_type', 'refresh_token');
    const sub: Subscription = http
      .post('/authorizationserver/token', params)
      .subscribe(
        () => {},
        (err) => {
          expect(err.status).toEqual(400);
          expect(err.error.error).toEqual('invalid_grant');
          expect(
            authHeaderService.handleExpiredRefreshToken
          ).toHaveBeenCalled();
          done();
        },
        () => {}
      );

    const mockReq: TestRequest = httpMock.expectOne((req) => {
      return req.method === 'POST' && req.url === '/authorizationserver/token';
    });

    mockReq.flush(
      { error: 'invalid_grant' },
      { status: 400, statusText: 'Bad request' }
    );
    sub.unsubscribe();
  });

  it(`Should not handle 400 error invalid_grant calls for non token endpoints`, (done) => {
    jest.spyOn(authHeaderService, 'handleExpiredRefreshToken');
    const params = new HttpParams().set('grant_type', 'refresh_token');
    const sub: Subscription = http.post('/custom-url', params).subscribe(
      () => {},
      (err) => {
        expect(err.status).toEqual(400);
        expect(err.error.error).toEqual('invalid_grant');
        expect(
          authHeaderService.handleExpiredRefreshToken
        ).not.toHaveBeenCalled();
        done();
      },
      () => {}
    );

    const mockReq: TestRequest = httpMock.expectOne((req) => {
      return req.method === 'POST' && req.url === '/custom-url';
    });

    mockReq.flush(
      { error: 'invalid_grant' },
      { status: 400, statusText: 'Bad request' }
    );
    sub.unsubscribe();
  });

  it(`Should not handle 400 error invalid_grant calls for non refresh_token grant types`, (done) => {
    jest.spyOn(authHeaderService, 'handleExpiredRefreshToken');
    const params = new HttpParams().set('grant_type', 'code');
    const sub: Subscription = http
      .post('/authorizationserver/token', params)
      .subscribe(
        () => {},
        (err) => {
          expect(err.status).toEqual(400);
          expect(err.error.error).toEqual('invalid_grant');
          expect(
            authHeaderService.handleExpiredRefreshToken
          ).not.toHaveBeenCalled();
          done();
        },
        () => {}
      );

    const mockReq: TestRequest = httpMock.expectOne((req) => {
      return req.method === 'POST' && req.url === '/authorizationserver/token';
    });

    mockReq.flush(
      { error: 'invalid_grant' },
      { status: 400, statusText: 'Bad request' }
    );
    sub.unsubscribe();
  });
});
