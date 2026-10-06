import { useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DBOT_TABS } from '@/constants/bot-contents';
import { useStore } from '@/hooks/useStore';
import { isPreviewMode, PREVIEW_BASE_PATH } from '@/utils/is-preview-mode';
import { FREE_BOTS, FreeBot } from './bot-catalog';
import '../signals/trading-workspaces.scss';

const Freebots = observer(() => {
    const { dashboard, load_modal, blockly_store, run_panel } = useStore();
    const [search, setSearch] = useState('');
    const [loadingBot, setLoadingBot] = useState<string | null>(null);
    const [error, setError] = useState('');
    const loading = useRef(false);
    const filteredBots = FREE_BOTS.filter(bot =>
        `${bot.name} ${bot.collection}`.toLowerCase().includes(search.toLowerCase())
    );

    const loadBot = async (bot: FreeBot) => {
        if (loading.current) return;
        setError('');
        if (run_panel.is_stop_button_visible) {
            setError('Stop the running bot before loading another strategy.');
            return;
        }
        if (blockly_store.is_loading || !window.Blockly?.derivWorkspace) {
            setError('The bot builder is still initializing. Please try again in a moment.');
            return;
        }
        loading.current = true;
        setLoadingBot(bot.id);
        try {
            const base = isPreviewMode() ? PREVIEW_BASE_PATH : '';
            const response = await fetch(`${base}/assets/bots/${bot.filename}`);
            if (!response.ok) throw new Error('Bot file unavailable');
            const xml = await response.text();
            const document = new DOMParser().parseFromString(xml, 'application/xml');
            if (
                document.querySelector('parsererror') ||
                document.documentElement.localName !== 'xml' ||
                !document.querySelector('block')
            ) {
                throw new Error('Invalid bot file');
            }
            await load_modal.loadStrategyToBuilder({
                id: `freebot-${bot.id}`,
                name: bot.name,
                save_type: 'local',
                timestamp: Date.now(),
                xml,
            });
            dashboard.setActiveTab(DBOT_TABS.BOT_BUILDER);
        } catch {
            setError('This bot could not be loaded. Please retry. If it uses unsupported blocks, choose another bot.');
        } finally {
            loading.current = false;
            setLoadingBot(null);
        }
    };

    return (
        <section className='trading-workspace' aria-labelledby='freebots-title'>
            <header className='trading-workspace__hero'>
                <div>
                    <span className='trading-workspace__eyebrow'>DELTATRADES / BOT COLLECTION</span>
                    <h1 id='freebots-title'>
                        Your next bot.<br /><span>Already built.</span>
                    </h1>
                    <p>
                        Choose a strategy from the collection. One click imports it directly into Bot Builder,
                        ready for you to review.
                    </p>
                </div>
                <div className='trading-workspace__edition'>
                    <strong>{String(FREE_BOTS.length).padStart(2, '0')}</strong>
                    <span>UPLOADED BOTS</span>
                    <small>Free access · XML strategies</small>
                </div>
            </header>
            <div className='trading-workspace__toolbar'>
                <div>
                    <h2>The collection</h2>
                    <p>No downloads. No manual imports.</p>
                </div>
                <label className='trading-workspace__search'>
                    <span>Find a bot</span>
                    <input
                        type='search'
                        placeholder='Search names or collections'
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                    />
                </label>
            </div>
            {error && <div className='trading-workspace__error' role='alert'>{error}</div>}
            {run_panel.is_stop_button_visible && (
                <p className='trading-workspace__error' role='status'>
                    Stop the running bot and wait for any open contract to close before loading a new strategy.
                </p>
            )}
            <div className='bot-collection' aria-busy={Boolean(loadingBot)}>
                {filteredBots.map(bot => (
                    <article key={bot.id} className='bot-collection__card'>
                        <div className='bot-collection__meta'>
                            <span>{bot.collection}</span><span className='bot-collection__badge'>FREE</span>
                        </div>
                        <div className='bot-collection__identity'>
                            <span className='bot-collection__number'>
                                {String(FREE_BOTS.indexOf(bot) + 1).padStart(2, '0')}
                            </span>
                            <h3>{bot.name}</h3>
                        </div>
                        <p>Original uploaded strategy. Review its settings and test on a demo account before trading.</p>
                        <button
                            type='button'
                            disabled={Boolean(loadingBot) || blockly_store.is_loading || run_panel.is_stop_button_visible}
                            onClick={() => loadBot(bot)}
                            aria-label={`Load ${bot.name} in Bot Builder`}
                        >
                            <span>{loadingBot === bot.id ? 'Loading into builder…' : 'Load in Bot Builder'}</span><span aria-hidden='true'>↗</span>
                        </button>
                    </article>
                ))}
            </div>
            {filteredBots.length === 0 && (
                <div className='trading-workspace__empty'>
                    <h3>No matching bots</h3>
                    <p>Try another name or clear your search to see the collection.</p>
                    <button type='button' onClick={() => setSearch('')}>Clear search</button>
                </div>
            )}
            <p className='trading-workspace__risk'>
                Loading a bot does not start trading. These files are supplied as uploaded, not as verified or guaranteed
                profitable strategies. Always test with a demo account; trading involves risk.
            </p>
        </section>
    );
});

export default Freebots;
