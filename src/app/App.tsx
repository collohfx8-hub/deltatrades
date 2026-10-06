import { lazy, Suspense } from 'react';
import React from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { cleanupUrl } from '@/external/deriv-core';
import ChunkLoader from '@/components/loader/chunk-loader';
import LocalStorageSyncWrapper from '@/components/localStorage-sync-wrapper';
import RoutePromptDialog from '@/components/route-prompt-dialog';
import { useAccountSwitching } from '@/hooks/useAccountSwitching';
import { useLanguageFromURL } from '@/hooks/useLanguageFromURL';
import { StoreProvider } from '@/hooks/useStore';
import { isPreviewMode, PREVIEW_BASE_PATH } from '@/utils/is-preview-mode';
import { completeDerivAuthorization } from '@/services/oauth-callback.service';
import { localize, TranslationProvider } from '@deriv-com/translations';
import CoreStoreProvider from './CoreStoreProvider';
import i18nInstance from './i18n';
import './app-root.scss';

const Layout = lazy(() => import('../components/layout'));
const AppRoot = lazy(() => import('./app-root'));

/**
 * Component wrapper to handle language URL parameter
 * Uses the useLanguageFromURL hook to process language switching
 */
const LanguageHandler = ({ children }: { children: React.ReactNode }) => {
    useLanguageFromURL();
    return <>{children}</>;
};

// The static preview build is served under /bot/preview (see rsbuild.config.ts
// assetPrefix), so React Router must resolve routes under that prefix. Standalone
// partner deploys are served at the root, so no basename there.
const routerBasename = isPreviewMode() ? PREVIEW_BASE_PATH : undefined;

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route
            path='/'
            element={
                <Suspense
                    fallback={<ChunkLoader message={localize('Please wait while we connect to the server...')} />}
                >
                    <TranslationProvider defaultLang='EN' i18nInstance={i18nInstance}>
                        <LanguageHandler>
                            <StoreProvider>
                                <LocalStorageSyncWrapper>
                                    <RoutePromptDialog />
                                    <CoreStoreProvider>
                                        <Layout />
                                    </CoreStoreProvider>
                                </LocalStorageSyncWrapper>
                            </StoreProvider>
                        </LanguageHandler>
                    </TranslationProvider>
                </Suspense>
            }
        >
            {/* All child routes will be passed as children to Layout */}
            <Route index element={<AppRoot />} />
            {/* App Builder embeds the template at /preview — render the same app shell */}
            <Route path='preview' element={<AppRoot />} />
        </Route>
    ),
    { basename: routerBasename }
);

/**
 * Main App component
 *
 * Responsibilities:
 * 1. OAuth callback handling (via vendored deriv-core handleOAuthCallback)
 * 2. Account switching from URL (via useAccountSwitching hook)
 * 3. Router provider setup
 */
function App() {
    // Handle account switching via URL parameter
    useAccountSwitching();
    const [isOAuthPending, setIsOAuthPending] = React.useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.has('code') || params.has('error');
    });
    const [authError, setAuthError] = React.useState('');
    const callbackStarted = React.useRef(false);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if ((!urlParams.has('code') && !urlParams.has('error')) || callbackStarted.current) return;
        callbackStarted.current = true;

        const handleCallback = async () => {
            try {
                await completeDerivAuthorization(window.location.href);
            } catch {
                setAuthError(
                    'Deriv sign-in could not be completed. Please sign in again. If this continues, verify the app registration and allowed redirect URL.'
                );
            } finally {
                cleanupUrl(window.location.origin);
                setIsOAuthPending(false);
            }
        };

        handleCallback();
    }, []);

    if (isOAuthPending) return <ChunkLoader message={localize('Completing secure Deriv sign-in...')} />;

    return (
        <>
            {authError && (
                <div className='deriv-auth-error' role='alert'>
                    <span>{authError}</span>
                    <button type='button' onClick={() => setAuthError('')} aria-label='Dismiss sign-in message'>
                        Dismiss
                    </button>
                </div>
            )}
            <RouterProvider router={router} />
        </>
    );
}

export default App;
