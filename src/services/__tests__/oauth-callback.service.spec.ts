import { handleOAuthCallback } from '@/external/deriv-core/auth/oauth';
import { clearAllAuthData } from '@/external/deriv-core/auth/storage';
import { DerivWSAccountsService } from '../derivws-accounts.service';
import { completeDerivAuthorization } from '../oauth-callback.service';

jest.mock('@/external/deriv-core/auth/oauth', () => ({ handleOAuthCallback: jest.fn() }));
jest.mock('@/external/deriv-core/auth/storage', () => ({ clearAllAuthData: jest.fn() }));
jest.mock('../derivws-accounts.service', () => ({
    DerivWSAccountsService: {
        fetchAccountsList: jest.fn(),
        storeAccounts: jest.fn(),
        clearStoredAccounts: jest.fn(),
    },
}));

describe('Deriv authorization completion', () => {
    const originalClientId = process.env.NEXT_PUBLIC_DERIV_APP_ID;
    const accounts = [
        { account_id: 'VRTC-example', account_type: 'demo' },
        { account_id: 'CR-example', account_type: 'real' },
    ];

    beforeEach(() => {
        localStorage.clear();
        process.env.NEXT_PUBLIC_DERIV_APP_ID = 'test-app';
        (handleOAuthCallback as jest.Mock).mockResolvedValue({ access_token: 'test-only-placeholder' });
        (DerivWSAccountsService.fetchAccountsList as jest.Mock).mockResolvedValue(accounts);
    });

    afterAll(() => {
        if (originalClientId === undefined) delete process.env.NEXT_PUBLIC_DERIV_APP_ID;
        else process.env.NEXT_PUBLIC_DERIV_APP_ID = originalClientId;
    });

    it('stores accounts and selects a demo account before the app initializes', async () => {
        await completeDerivAuthorization(window.location.href);
        expect(DerivWSAccountsService.storeAccounts).toHaveBeenCalledWith(accounts);
        expect(localStorage.getItem('active_loginid')).toBe('VRTC-example');
        expect(localStorage.getItem('account_type')).toBe('demo');
        expect(handleOAuthCallback).toHaveBeenCalledWith(window.location.href, expect.objectContaining({ redirectUri: window.location.origin, scopes: 'trade' }));
    });

    it('preserves a selected account if it belongs to the authorized account list', async () => {
        localStorage.setItem('active_loginid', 'CR-example');
        await completeDerivAuthorization(window.location.href);
        expect(localStorage.getItem('active_loginid')).toBe('CR-example');
        expect(localStorage.getItem('account_type')).toBe('real');
    });

    it('clears partial authorization if no accounts are returned', async () => {
        (DerivWSAccountsService.fetchAccountsList as jest.Mock).mockResolvedValue([]);
        await expect(completeDerivAuthorization(window.location.href)).rejects.toThrow('Deriv sign-in could not be completed');
        expect(clearAllAuthData).toHaveBeenCalled();
        expect(DerivWSAccountsService.clearStoredAccounts).toHaveBeenCalled();
    });

    it('does not expose provider errors to the UI', async () => {
        (handleOAuthCallback as jest.Mock).mockRejectedValue(new Error('Provider response body'));
        await expect(completeDerivAuthorization(window.location.href)).rejects.toThrow('Deriv sign-in could not be completed');
        expect(DerivWSAccountsService.fetchAccountsList).not.toHaveBeenCalled();
    });

    it('fails clearly when the application registration is missing', async () => {
        delete process.env.NEXT_PUBLIC_DERIV_APP_ID;
        await expect(completeDerivAuthorization(window.location.href)).rejects.toThrow('allowed redirect URL');
        expect(handleOAuthCallback).not.toHaveBeenCalled();
    });
});
