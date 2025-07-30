export function parseTradeInput(rawInput) {
    const raw   = rawInput.trim();
    const lower = raw.toLowerCase();

    // 1) Quick whitespace‑split tokens
    const tokens = raw.split(/\s+/);

    // 2) Exchange code if present
    const knownExchanges = ['WTI','Brent','NYM/ICE'];
    const exchange = knownExchanges.find(ex => raw.includes(ex)) || null;

    // 3) Flags
    const isLive           = /live/i.test(raw); // "live" indicates a live trade
    const isVersus = /\bvs\.?\b/i.test(raw); // "vs" or "vs." indicates a versus structure


    // 4) Expiries
    const QUARTER_MAPPING = { // maps month codes to quarters
        'FH': '1Q',
        'JM': '2Q',
        'NV': '3Q',
        'VZ': '4Q',
        'XH': 'Winter ',
        'JV': 'Summer '

    };

    const parseExpiry = (match) => {
        if (!match) return null;
        const month = match.match(/^[A-Z]+/)[0];
        const year = match.match(/\d{2}$/)[0];
        return QUARTER_MAPPING[month] ? QUARTER_MAPPING[month] + year : match;
    };

    const expiryMatches = raw.match(/\b[FJNVX]?[FGHJKMNQUVXZ]\d{2}\b/g) || [];
    const expiry = parseExpiry(expiryMatches[0]);
    const expiry2 = isVersus ? parseExpiry(expiryMatches[1]) : null;


    // 5) Strikes (and handle inline “cs”/“ps” suffixes automatically)
    let strikes = [];
    const strikeTok = tokens.find(t => /^([\d.]+(?:\/[\d.]+)*)([a-z]+)?$/i.test(t)); // matches "123.45", "123.45/67.89", "123.45c", "123.45/67.89ps"
    if (strikeTok) {
        const m = strikeTok.match(/^([\d.]+(?:\/[\d.]+)*)([a-z]+)?$/i);
        strikes = m[1].split('/').map(n => parseFloat(n));
    }

    // 6) Strikes2
    let strikes2 = null;
    if (isVersus) {
        const afterVs = raw.split(/vs\.?/i)[1] || '';
        const tok2 = afterVs.trim().split(/\s+/)
            .find(t => /^([\d.]+(?:\/[\d.]+)*)([a-z]+)?$/i.test(t));
        if (tok2) {
            const m2 = tok2.match(/^([\d.]+(?:\/[\d.]+)*)([a-z]+)?$/i);
            strikes2 = m2[1].split('/').map(n => parseFloat(n));
        }
    }

    // 7) Underlying ratio “x3.15”
    const underTok   = tokens.find(t => /^[Xx]\d+(\.\d+)?$/.test(t));
    const underlying = underTok ? parseFloat(underTok.slice(1)) : null;

    let underlying2 = null;
    if (isVersus) {
        const afterVs = raw.split(/vs\.?/i)[1] || '';
        const underTok2 = afterVs.trim().split(/\s+/)
            .find(t => /^[Xx]\d+(\.\d+)?$/.test(t));
        underlying2 = underTok2 ? parseFloat(underTok2.slice(1)) : null;
    }

    // 8) Deltas: “12d” etc.
    const deltaMatches = raw.match(/(\d+)d/g) || [];
    const delta  = deltaMatches[0] ? parseInt(deltaMatches[0], 10) : null;
    const delta2 = deltaMatches[1] ? parseInt(deltaMatches[1], 10) : null;

    // 9) Price (handles “.0470”, “-.005”, “1.234”)
    const priceMatch = raw.match(/(?:trades?|live)\s+(-?\d*\.?\d+)/i);
    const price      = priceMatch ? parseFloat(priceMatch[1]) : null;

    // 10) Lots at end “(500x)”
    const lotsMatch = raw.match(/\((\d+)x\)$/);
    const lots      = lotsMatch ? parseInt(lotsMatch[1], 10) : 100;

    // 11) Strategy‑type inference
    let strategyType = 'Unknown';
    let strategyType2 = null;

    if      (lower.includes('iron fly'))                                 strategyType = 'Iron Fly';
    else if (lower.includes('condor'))                                   strategyType = 'Condor';
    else if (lower.includes('fence'))                                    strategyType = 'Fence';
    else if (lower.includes('strd') || lower.includes('straddle'))       strategyType = 'Straddle';
    else if (lower.includes('1x2')) {
        if      (lower.includes('cs'))                                     strategyType = '1x2 Call Spread';
        else if (lower.includes('ps'))                                     strategyType = '1x2 Put Spread';
        else                                                               strategyType = '1x2 Spread';
    }
    else if (strikes.length >= 3) {
        strategyType = lower.includes('put') ? 'Put Fly' : 'Call Fly';
    }
    else if (strikes.length === 2) {
        if      (lower.includes('cs') || lower.includes('call '))          strategyType = 'Call Spread';
        else if (lower.includes('ps') || lower.includes('put '))           strategyType = 'Put Spread';
        else                                                               strategyType = 'Spread';
    }
    else if (strikes.length === 1) {
        if      (lower.includes('put ') || lower.includes('p'))                                   strategyType = 'Put Option';
        else if (lower.includes('call ') || lower.includes('c'))                                  strategyType = 'Call Option';
        else                                                               strategyType = 'Single Option';
    }


    // determine if there will be two strategies

    const isDualStructure = Boolean(isVersus || (strikes2 || underlying2 || delta2 || expiry2));


    return {
        exchange,
        expiry,
        expiry2: expiry2 || expiry,
        strikes,
        strikes2: strikes2 || [],
        strategyType,
        strategyType2,
        underlying,
        underlying2: underlying2 || underlying,
        delta,
        delta2: delta2 || delta,
        price,
        lots,
        isDualStructure,
        isLive
    };
}


export const STRATEGY_CONFIGS = {
    // Single structure strategies
    'Call Option': { dualPanel: false },
    'Put Option': { dualPanel: false },
    'Vertical Call Spread': { dualPanel: false },
    'Horizontal Call Spread': { dualPanel: true },
    'Diagonal Call Spread': { dualPanel: true },
    'Vertical Put Spread': { dualPanel: false },
    'Horizontal Put Spread': { dualPanel: true },
    'Diagonal Put Spread': { dualPanel: true },
    'Straddle': { dualPanel: true },
    'Strangle': { dualPanel: true },
    'Straddle Spread': { dualPanel: true },
    'Diagonal Straddle Spread': { dualPanel: true },
    'Fence': { dualPanel: false },
    'Call Fly': { dualPanel: false },
    'Put Fly': { dualPanel: false },
    'Conversion/Reversal': { dualPanel: true },
    'Iron Butterfly': { dualPanel: false },
    'Call Condor': { dualPanel: false },
    'Put Condor': { dualPanel: false },
    'Iron Condor': { dualPanel: false },
    'Call Tree': { dualPanel: true },
    'Put Tree': { dualPanel: true },
    '3-Way: Call Spread v Put': { dualPanel: true },
    '3-Way: Put Spread v Call': { dualPanel: true },
    '3-Way: Straddle v Call': { dualPanel: true },
    '3-Way: Straddle v Put': { dualPanel: true }
};
