import { handleOAuthCallback } from '@/external/deriv-core/auth/oauth';
import { clearAllAuthData } from '@/external/deriv-core/auth/storage';
import { DerivWSAccountsService } from './derivws-accounts.service';

export const completeDerivAuthorization = async (callbackUrl: string) => {
    try {
        const clientId = process.env.NEXT_PUBLIC_DERIV_APP_ID;
        if (!clientId) throw new Error('Deriv authorization is not configured');

        const authInfo = await handleOAuthCallback(callbackUrl, {
            clientId,
            redirectUri: window.location.origin,
            scopes: 'trade',
        });
        const accounts = await DerivWSAccountsService.fetchAccountsList(authInfo.access_token);
        if (!accounts?.length) throw new Error('No Deriv trading accounts available');

        DerivWSAccountsService.storeAccounts(accounts);
        const previousLoginId = localStorage.getItem('active_loginid');
        const account = accounts.find(item => item.account_id === previousLoginId) ?? accounts[0];
        localStorage.setItem('active_loginid', account.account_id);
        const isDemo = account.account_type === 'demo' || account.account_id.startsWith('VRT');
        localStorage.setItem('account_type', isDemo ? 'demo' : 'real');
    } catch {
        clearAllAuthData();
        DerivWSAccountsService.clearStoredAccounts();
        throw new Error(
            'Deriv sign-in could not be completed. Please sign in again. If the problem persists, check the app registration and allowed redirect URL.'
        );
    }
};
