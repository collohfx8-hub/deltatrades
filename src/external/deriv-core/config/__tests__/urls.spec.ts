import { getApiBaseUrl, getAuthBaseUrl, getDerivEnvironment, getPublicWsUrl } from '../urls';

describe('Deriv environment consistency', () => {
    const originalEnvironment = process.env.NEXT_PUBLIC_DERIV_ENV;
    afterEach(() => {
        if (originalEnvironment === undefined) delete process.env.NEXT_PUBLIC_DERIV_ENV;
        else process.env.NEXT_PUBLIC_DERIV_ENV = originalEnvironment;
    });

    it('defaults partner domains to production when the environment is unset', () => {
        delete process.env.NEXT_PUBLIC_DERIV_ENV;
        expect(getDerivEnvironment()).toBe('production');
        expect(getAuthBaseUrl()).toBe('https://auth.deriv.com/oauth2');
        expect(getApiBaseUrl()).toBe('https://api.derivws.com/trading/v1/options');
        expect(getPublicWsUrl()).toContain('wss://api.derivws.com/');
    });

    it.each(['staging', 'preview'])('keeps OAuth and API endpoints consistent for %s', environment => {
        process.env.NEXT_PUBLIC_DERIV_ENV = environment;
        expect(getDerivEnvironment()).toBe('preview');
        expect(getAuthBaseUrl()).toContain('staging-auth.deriv.com');
        expect(getApiBaseUrl()).toContain('staging-api.derivws.com');
        expect(getPublicWsUrl()).toContain('staging-api.derivws.com');
    });
});
