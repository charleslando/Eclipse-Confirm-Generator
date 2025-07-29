export function parseTradeInput(rawInput) {
    const raw   = rawInput.trim();
    const lower = raw.toLowerCase();

    // 1) Quick whitespace‑split tokens
    const tokens = raw.split(/\s+/);

    // 2) Exchange code if present
    const knownExchanges = ['WTI','Brent','NYM/ICE'];
    const exchange = knownExchanges.find(ex => raw.includes(ex)) || null;

    // 3) Flags
    const isLive           = /live/i.test(raw);
    const isCalendarSpread = /\bvs\.?\b/i.test(raw);

    // 4) Expiries
    const expiryMatches = raw.match(/\b[FGHJKMNQUVXZ]\d{2}\b/g) || [];
    const expiry  = expiryMatches[0] || null;
    const expiry2 = isCalendarSpread ? expiryMatches[1] || null : null;

    // 5) Strikes (and handle inline “cs”/“ps” suffixes automatically)
    let strikes = [];
    const strikeTok = tokens.find(t => /^([\d.]+(?:\/[\d.]+)*)([a-z]+)?$/i.test(t));
    if (strikeTok) {
        const m = strikeTok.match(/^([\d.]+(?:\/[\d.]+)*)([a-z]+)?$/i);
        strikes = m[1].split('/').map(n => parseFloat(n));
    }

    // 6) Strikes2 for calendar
    let strikes2 = null;
    if (isCalendarSpread) {
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
    if (isCalendarSpread) {
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

    // 12) Prefix “Calendar ” if it’s a vs‑spread
    if (isCalendarSpread) strategyType = 'Calendar ' + strategyType;

    return {
        exchange,
        expiry,
        expiry2,
        strikes,
        strikes2,
        strategyType,
        underlying,
        underlying2,
        delta,
        delta2,
        price,
        lots,
        isCalendarSpread,
        isLive
    };
}
