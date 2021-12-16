import { TestBed } from '@angular/core/testing';
import { OAuthService, TokenResponse } from 'angular-oauth2-oidc';
import { WindowRef } from 'projects/core/src/window';
import { AuthConfigService } from './auth-config.service';
import { OAuthLibWrapperService } from './oauth-lib-wrapper.service';

class MockAuthConfigService implements Partial<AuthConfigService> {
  getBaseUrl() {
    return 'base';
  }
  getTokenEndpoint() {
    return 'token';
  }
  getLoginUrl() {
    return 'login';
  }
  getClientId() {
    return 'client_id';
  }
  getClientSecret() {
    return 'dummySecret';
  }
  getRevokeEndpoint() {
    return 'revoke';
  }
  getLogoutUrl() {
    return 'logout';
  }
  getUserinfoEndpoint() {
    return 'userinfo';
  }
  getOAuthLibConfig() {
    return {
      clearHashAfterLogin: true,
      issuer: 'issuer',
      redirectUri: 'redUri',
    };
  }
}
class MockOAuthService implements Partial<OAuthService> {
  configure() {}
  fetchTokenUsingPasswordFlow() {
    return Promise.resolve({ state: 'done' } as TokenResponse);
  }
  refreshToken() {
    return Promise.resolve({} as TokenResponse);
  }
  logOut() {}
  getIdToken() {
    return 'token';
  }
  initLoginFlow() {}
  tryLogin() {
    return Promise.resolve(true);
  }
  revokeTokenAndLogout() {
    return Promise.resolve(true);
  }
}

describe('OAuthLibWrapperService', () => {
  let service: OAuthLibWrapperService;
  let oAuthService: OAuthService;
  let winRef: WindowRef;
  let authConfigService: AuthConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OAuthLibWrapperService,
        { provide: AuthConfigService, useClass: MockAuthConfigService },
        { provide: OAuthService, useClass: MockOAuthService },
      ],
    });
    service = TestBed.inject(OAuthLibWrapperService);
    oAuthService = TestBed.inject(OAuthService);
    winRef = TestBed.inject(WindowRef);
    authConfigService = TestBed.inject(AuthConfigService);
  });

  describe('initialize()', () => {
    it('should configure lib with the config', () => {
      jest.spyOn(oAuthService, 'configure');

      (service as any)['initialize']();

      expect(oAuthService.configure).toHaveBeenCalledWith({
        tokenEndpoint: 'token',
        loginUrl: 'login',
        clientId: 'client_id',
        dummyClientSecret: 'dummySecret',
        revocationEndpoint: 'revoke',
        logoutUrl: 'logout',
        userinfoEndpoint: 'userinfo',
        issuer: 'issuer',
        redirectUri: 'redUri',
        clearHashAfterLogin: true,
      });
    });

    it('should use redirectUrl on SSR when passed', () => {
      jest.spyOn(oAuthService, 'configure');
      jest.spyOn(winRef, 'isBrowser').mockReturnValue(false);

      (service as any)['initialize']();

      expect(oAuthService.configure).toHaveBeenCalledWith(
        expect.objectContaining({
          redirectUri: 'redUri',
        })
      );
    });

    it('should use current location as a redirectUrl when not explicitly set in browser', () => {
      jest.spyOn(oAuthService, 'configure');
      jest.spyOn(authConfigService, 'getOAuthLibConfig').mockReturnValue({});

      (service as any)['initialize']();

      expect(oAuthService.configure).toHaveBeenCalledWith(
        expect.objectContaining({
          redirectUri: winRef.nativeWindow?.location.origin,
          issuer: 'base',
        })
      );
    });

    it('should use "" as a redirectUrl when not explicitly set on SSR', () => {
      jest.spyOn(oAuthService, 'configure');
      jest.spyOn(winRef, 'isBrowser').mockReturnValue(false);
      jest.spyOn(authConfigService, 'getOAuthLibConfig').mockReturnValue({});

      (service as any)['initialize']();

      expect(oAuthService.configure).toHaveBeenCalledWith(
        expect.objectContaining({
          redirectUri: '',
        })
      );
    });
  });

  describe('authorizeWithPasswordFlow()', () => {
    it('should call fetchTokenUsingPasswordFlow method from the lib', async () => {
      jest.spyOn(oAuthService, 'fetchTokenUsingPasswordFlow');

      const result = await service.authorizeWithPasswordFlow(
        'username',
        'pass'
      );

      expect(result).toEqual({ state: 'done' } as TokenResponse);
      expect(oAuthService.fetchTokenUsingPasswordFlow).toHaveBeenCalledWith(
        'username',
        'pass'
      );
    });
  });

  describe('refreshToken()', () => {
    it('should call refreshToken method from lib', () => {
      jest.spyOn(oAuthService, 'refreshToken');

      service.refreshToken();

      expect(oAuthService.refreshToken).toHaveBeenCalled();
    });
  });

  describe('revokeAndLogout()', () => {
    it('should call revokeTokenAndLogout method from the lib', async () => {
      jest.spyOn(oAuthService, 'revokeTokenAndLogout');
      jest.spyOn(oAuthService, 'logOut');

      await service.revokeAndLogout();

      expect(oAuthService.revokeTokenAndLogout).toHaveBeenCalled();
      expect(oAuthService.logOut).not.toHaveBeenCalled();
    });

    it('should call logOut method from the lib when the revoke fails', async () => {
      jest.spyOn(oAuthService, 'logOut');
      jest.spyOn(oAuthService, 'revokeTokenAndLogout').mockReturnValue(
        Promise.reject()
      );

      await service.revokeAndLogout();

      expect(oAuthService.revokeTokenAndLogout).toHaveBeenCalled();
      expect(oAuthService.logOut).toHaveBeenCalled();
    });
  });

  describe('logout()', () => {
    it('should call logOut method from the lib', () => {
      jest.spyOn(oAuthService, 'logOut');

      service.logout();

      expect(oAuthService.logOut).toHaveBeenCalled();
    });
  });

  describe('getIdToken()', () => {
    it('should return the result from the getIdToken method from lib', () => {
      jest.spyOn(oAuthService, 'getIdToken').mockReturnValue('id_tok');

      const token = service.getIdToken();
      expect(token).toEqual('id_tok');
    });
  });

  describe('initLoginFlow()', () => {
    it('should call initLoginFlow from the lib', () => {
      jest.spyOn(oAuthService, 'initLoginFlow');

      service.initLoginFlow();

      expect(oAuthService.initLoginFlow).toHaveBeenCalled();
    });
  });

  describe('tryLogin()', () => {
    it('should call tryLogin method from the lib', () => {
      jest.spyOn(oAuthService, 'tryLogin');

      service.tryLogin();

      expect(oAuthService.tryLogin).toHaveBeenCalledWith({
        disableOAuth2StateCheck: true,
      });
    });
  });
});
