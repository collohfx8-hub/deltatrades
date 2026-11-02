import { cleanupUrl, exchangeCodeForTokens, validateCallback } from '../oauth';
import { storeCSRFToken, storeCodeVerifier } from '../storage';

describe('OAuth callback safety', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        window.history.replaceState({}, '', '/');
    });

    it('removes OAuth parameters while keeping the selected tab and other parameters', () => {
        window.history.replaceState({}, '', '/?code=example&state=example&scope=trade&lang=EN#freebots');
        cleanupUrl(window.location.origin);
        expect(window.location.search).toBe('?lang=EN');
        expect(window.location.hash).toBe('#freebots');
    });

    it('rejects mismatched state and clears pending authorization data', () => {
        storeCSRFToken('expected-state');
        storeCodeVerifier('example-verifier');
        expect(() => validateCallback({ code: 'example-code', state: 'different-state', scope: null, error: null, error_description: null }, window.location.origin)).toThrow('CSRF token mismatch');
        expect(sessionStorage.getItem('oauth_code_verifier')).toBeNull();
    });

    it('accepts valid state once, preventing callback replay', () => {
        storeCSRFToken('expected-state');
        const params = { code: 'example-code', state: 'expected-state', scope: null, error: null, error_description: null };
        expect(validateCallback(params, window.location.origin)).toBe('example-code');
        expect(() => validateCallback(params, window.location.origin)).toThrow('CSRF token mismatch');
    });

    it('does not include the provider response body in token exchange errors', async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 400, text: jest.fn() });
        await expect(exchangeCodeForTokens({ code: 'example-code', clientId: 'test-app', redirectUri: window.location.origin, codeVerifier: 'example-verifier' })).rejects.toThrow('Token exchange failed (400)');
    });
});
