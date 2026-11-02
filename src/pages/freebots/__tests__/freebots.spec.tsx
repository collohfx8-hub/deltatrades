import fs from 'fs';
import path from 'path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DBOT_TABS } from '@/constants/bot-contents';
import Freebots from '../freebots';
import { FREE_BOTS } from '../bot-catalog';

const mockLoadStrategy = jest.fn();
const mockSetActiveTab = jest.fn();
const mockBlocklyStore = { is_loading: false };
const mockRunPanel = { is_stop_button_visible: false };
const mockPreviewMode = jest.fn(() => false);

jest.mock('@/hooks/useStore', () => ({
    useStore: () => ({
        load_modal: { loadStrategyToBuilder: mockLoadStrategy },
        dashboard: { setActiveTab: mockSetActiveTab },
        blockly_store: mockBlocklyStore,
        run_panel: mockRunPanel,
    }),
}));
jest.mock('mobx-react-lite', () => ({ observer: (component: unknown) => component }));
jest.mock('@/utils/is-preview-mode', () => ({ isPreviewMode: () => mockPreviewMode(), PREVIEW_BASE_PATH: '/bot/preview' }));

describe('Freebots collection', () => {
    beforeEach(() => {
        mockBlocklyStore.is_loading = false;
        mockRunPanel.is_stop_button_visible = false;
        mockPreviewMode.mockReturnValue(false);
        Object.defineProperty(window, 'Blockly', { configurable: true, value: { derivWorkspace: {} } });
        mockLoadStrategy.mockResolvedValue(undefined);
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            text: async () => '<xml><block type="trade_definition" /></xml>',
        });
    });

    it('includes all eleven uploaded, well-formed XML files', () => {
        expect(FREE_BOTS).toHaveLength(11);
        expect(new Set(FREE_BOTS.map(bot => bot.filename)).size).toBe(11);
        for (const bot of FREE_BOTS) {
            const xml = fs.readFileSync(path.join(process.cwd(), 'public/assets/bots', bot.filename), 'utf8');
            const document = new DOMParser().parseFromString(xml, 'application/xml');
            expect(document.querySelector('parsererror')).toBeNull();
            expect(document.documentElement.localName).toBe('xml');
            expect(document.querySelector('block')).not.toBeNull();
        }
    });

    it('loads the selected bot and opens the existing builder after import', async () => {
        render(<Freebots />);
        fireEvent.click(screen.getByRole('button', { name: 'Load Cruel Enhanced in Bot Builder' }));
        await waitFor(() => expect(mockSetActiveTab).toHaveBeenCalledWith(DBOT_TABS.BOT_BUILDER));
        expect(global.fetch).toHaveBeenCalledWith('/assets/bots/cruel-enhanced.xml');
        expect(mockLoadStrategy).toHaveBeenCalledWith(expect.objectContaining({ id: 'freebot-cruel-enhanced', name: 'Cruel Enhanced', save_type: 'local' }));
        expect(mockLoadStrategy.mock.invocationCallOrder[0]).toBeLessThan(mockSetActiveTab.mock.invocationCallOrder[0]);
    });

    it('filters the catalog and offers a clear-search empty state', () => {
        render(<Freebots />);
        fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Titanium' } });
        expect(screen.getAllByRole('button', { name: /Load .* in Bot Builder/ })).toHaveLength(1);
        fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'unmatched-name' } });
        expect(screen.getByText('No matching bots')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
        expect(screen.getAllByRole('button', { name: /Load .* in Bot Builder/ })).toHaveLength(11);
    });

    it('loads assets from the preview base when the existing app is embedded', async () => {
        mockPreviewMode.mockReturnValue(true);
        render(<Freebots />);
        fireEvent.click(screen.getByRole('button', { name: 'Load Cruel Enhanced in Bot Builder' }));
        await waitFor(() => expect(mockSetActiveTab).toHaveBeenCalledWith(DBOT_TABS.BOT_BUILDER));
        expect(global.fetch).toHaveBeenCalledWith('/bot/preview/assets/bots/cruel-enhanced.xml');
    });

    it('prevents duplicate imports until the selected bot finishes loading', async () => {
        let finishImport: () => void = () => undefined;
        mockLoadStrategy.mockImplementation(() => new Promise<void>(resolve => { finishImport = resolve; }));
        render(<Freebots />);
        fireEvent.click(screen.getByRole('button', { name: 'Load Cruel Enhanced in Bot Builder' }));
        await waitFor(() => expect(mockLoadStrategy).toHaveBeenCalledTimes(1));
        expect(screen.getByRole('button', { name: 'Load Nexis AI in Bot Builder' })).toBeDisabled();
        expect(mockSetActiveTab).not.toHaveBeenCalled();
        finishImport();
        await waitFor(() => expect(mockSetActiveTab).toHaveBeenCalledWith(DBOT_TABS.BOT_BUILDER));
    });

    it('shows a retryable error when a bot file is unavailable', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
        render(<Freebots />);
        fireEvent.click(screen.getByRole('button', { name: 'Load Cruel Enhanced in Bot Builder' }));
        await screen.findByRole('alert');
        expect(mockLoadStrategy).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Load Cruel Enhanced in Bot Builder' })).not.toBeDisabled();
    });

    it('stays on the library and displays an error when import fails', async () => {
        mockLoadStrategy.mockRejectedValue(new Error('Unsupported blocks'));
        render(<Freebots />);
        fireEvent.click(screen.getByRole('button', { name: 'Load Cruel Enhanced in Bot Builder' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('This bot could not be loaded');
        expect(mockSetActiveTab).not.toHaveBeenCalled();
    });

    it('rejects non-XML responses without changing the builder', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({ ok: true, text: async () => '<html>Not a bot</html>' });
        render(<Freebots />);
        fireEvent.click(screen.getByRole('button', { name: 'Load Cruel Enhanced in Bot Builder' }));
        await screen.findByRole('alert');
        expect(mockLoadStrategy).not.toHaveBeenCalled();
        expect(mockSetActiveTab).not.toHaveBeenCalled();
    });

    it('prevents replacing a bot while trading or an open contract is pending', () => {
        mockRunPanel.is_stop_button_visible = true;
        render(<Freebots />);
        expect(screen.getByRole('button', { name: 'Load Cruel Enhanced in Bot Builder' })).toBeDisabled();
        expect(screen.getByRole('status')).toHaveTextContent('open contract');
    });

    it('disables imports while the builder initializes', () => {
        mockBlocklyStore.is_loading = true;
        render(<Freebots />);
        expect(screen.getByRole('button', { name: 'Load Cruel Enhanced in Bot Builder' })).toBeDisabled();
    });
});
