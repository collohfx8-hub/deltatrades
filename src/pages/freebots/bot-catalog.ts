export const FREE_BOTS = [
    { id: 'cruel-enhanced', name: 'Cruel Enhanced', filename: 'cruel-enhanced.xml', collection: 'Enhanced series' },
    { id: 'colloh-undermind', name: 'Colloh Thee Dollar Undermind', filename: 'colloh-undermind.xml', collection: 'Thee Dollar series' },
    { id: 'colloh-overmind', name: 'Colloh Thee Dollar Overmind AI', filename: 'colloh-overmind.xml', collection: 'Thee Dollar series' },
    { id: 'digit-hedger', name: 'Digit Hedger AI Smartbot', filename: 'digit-hedger.xml', collection: 'Smartbot series' },
    { id: 'pressision-percent', name: 'Pressision AI Percent', filename: 'pressision-percent.xml', collection: 'Pressision series' },
    { id: 'supersuck-no-analysis', name: 'Supersuck No Analysis AI', filename: 'supersuck-no-analysis.xml', collection: 'Original collection' },
    { id: 'nexis-ai', name: 'Nexis AI', filename: 'nexis-ai.xml', collection: 'Original collection' },
    { id: 'novabrade-x', name: 'Novabrade X', filename: 'novabrade-x.xml', collection: 'Original collection' },
    { id: 'titanium-pressision', name: 'Titanium Pressision AI', filename: 'titanium-pressision.xml', collection: 'Pressision series' },
    { id: 'pressision-ai', name: 'Pressision AI', filename: 'pressision-ai.xml', collection: 'Pressision series' },
    { id: 'thee-dollars-ai', name: 'Thee Dollars AI', filename: 'thee-dollars-ai.xml', collection: 'Thee Dollar series' },
] as const;

export type FreeBot = (typeof FREE_BOTS)[number];
