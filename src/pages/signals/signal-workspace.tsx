import './trading-workspaces.scss';

const SignalWorkspace = ({ premium = false }: { premium?: boolean }) => (
    <section className='trading-workspace' aria-labelledby={premium ? 'premium-signals-title' : 'free-signal-title'}>
        <header className='trading-workspace__hero'>
            <div>
                <span className='trading-workspace__eyebrow'>DELTATRADES / {premium ? 'PREMIUM SIGNALS' : 'SIGNAL TOOL'}</span>
                <h1 id={premium ? 'premium-signals-title' : 'free-signal-title'}>{premium ? 'Live premium' : 'Free signal'}<br /><span>{premium ? 'signals.' : 'tool.'}</span></h1>
                <p>{premium ? 'A dedicated workspace for your live premium signal feed.' : 'A dedicated workspace for your free market-analysis tools.'}</p>
            </div>
            <div className='trading-workspace__edition'><span className='signal-status'>AWAITING INTEGRATION</span><small>No signal feed connected</small></div>
        </header>
        <div className='signal-pending'>
            <div className='signal-pending__visual' aria-hidden='true'><span /><span /><span /><span /><span /><span /><span /></div>
            <span className='trading-workspace__eyebrow'>WORKSPACE READY</span>
            <h2>{premium ? 'Your live feed belongs here.' : 'Your signal tool belongs here.'}</h2>
            <p>{premium ? 'The premium signal source code is being supplied separately. Once integrated, live signals will appear in this tab.' : 'The free signal tool is not connected yet. Its analysis interface will appear here once the tool is supplied and integrated.'}</p>
            <div className='signal-pending__note'>No sample signals or simulated results are displayed.</div>
        </div>
        <p className='trading-workspace__risk'>Signals are analysis, not guarantees. Always assess risk and test strategies on a demo account before trading.</p>
    </section>
);

export default SignalWorkspace;
