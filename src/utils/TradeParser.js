// Trade Parser Class
import {STRAT_CONFIGS, STRAT_STRIKE_MAP} from "./parseTradeInput.js";

export class TradeParser {
    constructor() {
        this.QUARTER_MAPPING = {
            'FH': '1Q',
            'FG': 'Jan/Feb',
            'JM': '2Q',
            'NV': '3Q',
            'VZ': '4Q',
            'XH': 'Winter ',
            'JV': 'Summer '
        };
        this.knownExchanges = ['WTI', 'Brent', 'NYM/ICE'];
    }

    parseExpiry(match) {
        if (!match) return null;
        const month = match.match(/^[A-Z]+/)[0];
        const year = match.match(/\d{2}$/)[0];
        return this.QUARTER_MAPPING[month] ? this.QUARTER_MAPPING[month] + year : match;
    }


    determineStrategyType(text, strikes, expiry2, strikes2) {
        const lower = text.toLowerCase();
        let strategyType = 'Custom';

        // Check for explicit strategy names first
        if (lower.includes('iron butterfly') || lower.includes('iron fly')) {
            return 'Iron Butterfly';
        }
        if (lower.includes('iron condor')) {
            return 'Iron Condor';
        }
        if (lower.includes('call condor')) {
            return 'Call Condor';
        }
        if (lower.includes('put condor')) {
            return 'Put Condor';
        }
        if (lower.includes('call tree')) {
            return 'Call Tree';
        }
        if (lower.includes('put tree')) {
            return 'Put Tree';
        }
        if (lower.includes('conversion') || lower.includes('reversal')) {
            return 'Conversion/Reversal';
        }
        if (lower.includes('fence')) {
            return 'Fence';
        }

        // Handle "vs" structures for complex strategies
        if (lower.includes(' vs ') || lower.includes(' vs.')) {
            return this.determineVsStrategy(text, strikes, expiry2, strikes2);
        }
        if (lower.includes(' cs ') || lower.includes('cs ')) {
            return 'Call Spread';
        }
        if (lower.includes(' ps ') || lower.includes('ps ')) {
            return 'Put Spread';
        }

        // Single options and basic spreads
        if (lower.includes('straddle') || lower.includes('strad')) {
            if (strikes.length === 1 && !expiry2) {
                return 'Straddle';
            } else if (strikes.length >= 2 || expiry2) {
                // if (!expiry2) {
                //     return 'Straddle Spread';
                // } else {
                //     return 'Diagonal Straddle Spread';
                // }
                return 'Straddle Spread';
            }
        }

        if (lower.includes('strangle') || lower.includes('strang')) {
            if( strikes.length === 1 && !expiry2) {
                return 'Strangle';
            }
            else if (strikes.length >= 2 || expiry2) {
                // if (!expiry2) {
                //     return 'Strangle Spread';
                // } else {
                //     return 'Diagonal Strangle Spread';
                // }
                return 'Strangle Spread';
            }
        }

        // Call strategies
        if (lower.includes('call') || lower.includes('c')) {
            if (strikes.length === 1 && !expiry2) {
                return 'Call Option';
            } else if (strikes.length === 2) {
                // if (!expiry2) {
                //     return 'Vertical Call Spread';
                // } else if (!strikes2) {
                //     return 'Horizontal Call Spread';
                // } else {
                //     return 'Diagonal Call Spread';
                // }
                return 'Call Spread'

            } else if (strikes.length >= 3) {
                return 'Call Fly';
            }
        }

        // Put strategies
        if (lower.includes('put') || lower.includes('p ')) {
            if (strikes.length === 1 && !expiry2) {
                return 'Put Option';
            } else if (strikes.length === 2) {
                // if (!expiry2) {
                //     return 'Vertical Put Spread';
                // } else if (!strikes2) {
                //     return 'Horizontal Put Spread';
                // } else {
                //     return 'Diagonal Put Spread';
                // }
                return 'Put Spread';
            } else if (strikes.length >= 3) {
                return 'Put Fly';
            }
        }

        return strategyType;
    }

// New helper method for "vs" strategy detection
    determineVsStrategy(text, strikes, expiry2, strikes2) {
        const lower = text.toLowerCase();
        const parts = lower.split(/ vs\.? /);

        if (parts.length !== 2) return 'Custom';

        const leftSide = parts[0].trim();
        const rightSide = parts[1].trim();

        // Detect spread types on each side
        const leftType = this.detectSideType(leftSide, strikes);
        const rightType = this.detectSideType(rightSide, strikes2);

        // Map combinations to strategy types
        const combinationMap = {
            'call-call': 'Call Spread',
            'put-put': 'Put Spread',
            'call_spread-put': '3-Way: Call Spread v Put',
            'put_spread-call': '3-Way: Put Spread v Call',
            'straddle-call': '3-Way: Straddle v Call',
            'straddle-put': '3-Way: Straddle v Put',
            'straddle-straddle': 'Straddle Spread',
            'strangle-strangle': 'Strangle Spread',
            'call_spread-put_spread': 'Iron Condor',
            'put_spread-call_spread': 'Iron Condor',
            'call_spread-call_spread': 'Call Condor',
            'put_spread-put_spread': 'Put Condor',
            'put-call': 'Conversion/Reversal',
            'call-put': 'Conversion/Reversal',
            'put_spread-put': 'Put Tree',
            'put-put_spread': 'Put Tree',
            'call_spread-call': 'Call Tree',
            'call-call_spread': 'Call Tree',
        };

        const key = `${leftType}-${rightType}`;
        return combinationMap[key] || 'Custom';
    }

// Helper method to detect what type of strategy is on each side of "vs"
    detectSideType(sideText, sideStrikes) {
        const side = sideText.trim();

        // Check for explicit spread indicators
        if (side.includes('cs') || side.includes('call spread') ||
            (side.includes('call') && sideStrikes && sideStrikes.length >= 2)) {
            //console.log('Detected call spread:', side);
            return 'call_spread';
        }

        if (side.includes('ps') || side.includes('put spread') ||
            (side.includes('put') && sideStrikes && sideStrikes.length >= 2)) {
            //console.log('Detected put spread:', side);
            return 'put_spread';
        }

        if (side.includes('straddle') || side.includes('strad')) {
            return 'straddle';
        }

        if (side.includes('strangle') || side.includes('strang')) {
            return 'strangle';
        }

        // Single options
        if (side.includes('call') || side.includes('c') || side.match(/\bc\d/)) {
            return 'call';
        }

        if (side.includes('put') || side.includes('p') || side.match(/\bp\d/)) {
            return 'put';
        }

        // Check for fly indicators
        if (side.includes('fly') || (sideStrikes && sideStrikes.length >= 3)) {
            if (side.includes('call')) return 'call_fly';
            if (side.includes('put')) return 'put_fly';
        }

        return 'unknown';
    }

    parse(rawInput) {
        const raw = rawInput.trim();
        const tokens = raw.split(/\s+/);

        // Exchange detection
        const exchange = this.knownExchanges.find(ex => raw.includes(ex)) || '';

        // Flags
        const isLive = /live/i.test(raw);
        const isVersus = /\bvs\.?\b/i.test(raw);

        // Expiries
        const expiryMatches = raw.match(/\b[FJNVX]?[FGHJKMNQUVXZ]\d{2}\b/g) || [];
        let expiry = this.parseExpiry(expiryMatches[0]);
        let expiry2 = isVersus ? this.parseExpiry(expiryMatches[1]) : null;

        // Strikes
        let strikes = [];
        const strikeTok = tokens.find(t => /^([\d.]+(?:\/[\d.]+)*)([a-z]+)?$/i.test(t));
        if (strikeTok) {
            const m = strikeTok.match(/^([\d.]+(?:\/[\d.]+)*)([a-z]+)?$/i);
            strikes = m[1].split('/').map(n => parseFloat(n));
        }

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



        // Underlying ratios
        const underlyingMatches = raw.match(/[Xx](\d+(?:\.\d+)?)/g) || [];
        let underlying = 0;
        let underlying2 = null;

        if (underlyingMatches.length > 0) {
            underlying = parseFloat(underlyingMatches[0].slice(1));
        }
        if (underlyingMatches.length > 1) {
            underlying2 = parseFloat(underlyingMatches[1].slice(1));
        }

        if (isVersus && !underlying2) {
            const afterVs = raw.split(/vs\.?/i)[1] || '';
            const underTok2 = afterVs.trim().split(/\s+/)
                .find(t => /^[Xx]\d+(\.\d+)?/.test(t));
            underlying2 = underTok2 ? parseFloat(underTok2.slice(1)) : null;
        }

        // Deltas
        const deltaMatches = raw.match(/(\d+)d/g) || [];
        let delta = deltaMatches[0] ? parseInt(deltaMatches[0], 10) : 0;
        let delta2 = deltaMatches[1] ? parseInt(deltaMatches[1], 10) : null;


        // Strategy type
        const strategyType = this.determineStrategyType(raw, strikes, expiry2, strikes2);

        // Ratio (eg. "1.5x2" or "1x2")
        const ratio = tokens.find(t => /^[1-9]\d*(?:\.\d+)?x\d+$/.test(t));

        // (3) now collect ALL strikes and redistribute by config
        const allStrikes = collectAllStrikes(raw);
        const { n1, n2 } = getExpectedStrikeCounts(strategyType);
        const distributed = distributeStrikes(allStrikes, n1, n2);

        // (4) replace strikes with distributed results
        strikes  = distributed.leg1;
        strikes2 = distributed.leg2;

        return {
            exchange,
            expiry,
            expiry2: expiry2 || expiry,
            strikes,
            strikes2: strikes2 || strikes,
            strategyType,
            underlying,
            underlying2: underlying2 || underlying,
            delta,
            delta2: delta2 || delta,
            isLive,
            isVersus,
            ratio
        };
    }
}

// --- helpers ---------------------------------------------------------------

// Count how many strikes each leg needs from STRAT_CONFIGS + STRAT_STRIKE_MAP
const getExpectedStrikeCounts = (strategyType) => {
    const cfg = STRAT_CONFIGS[strategyType] || { leg1: null, leg2: null };
    const n1 = cfg.leg1?.type ? (STRAT_STRIKE_MAP[cfg.leg1.type] || 0) : 0;
    const n2 = cfg.leg2?.type ? (STRAT_STRIKE_MAP[cfg.leg2.type] || 0) : 0;
    return { n1, n2 };
};

// Pull EVERY strike-like token, keep order. Supports "7/8.5/9", "7c", "8.5p", plain "7.00"
const collectAllStrikes = (raw) => {
    const tokens = (raw.match(/\b\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)*[a-z]*\b/gi) || []);
    const nums = [];
    for (const t of tokens) {
        // strip trailing letters like c, p, cs, ps, fly
        const core = t.replace(/[a-z]+$/i, '');
        if (!/\d/.test(core)) continue;
        core.split('/').forEach(s => {
            const v = parseFloat(s);
            if (!Number.isNaN(v)) nums.push(v);
        });
    }
    return nums;
};

// Smart distributor: fill leg1 then leg2; pad short, trim long
const distributeStrikes = (all, n1, n2) => {
    const need = n1 + n2;

    // Special case: Iron Butterfly written as 3 strikes (K1, K2, K3)
    // but config expects 4 (two spreads). Duplicate the middle.
    if (need === 4 && all.length === 3) {
        const [k1, k2, k3] = all;
        return { leg1: [k1, k2], leg2: [k2, k3] };
    }

    // Default: take what you need in order
    const take = all.slice(0, need);
    let leg1 = take.slice(0, n1);
    let leg2 = take.slice(n1, n1 + n2);

    // Pad if short (use nulls so you can detect missing pieces downstream)
    while (leg1.length < n1) leg1.push(0);
    while (leg2.length < n2) leg2.push(0);

    // If leg2 is all zeros, use leg1 values instead
    if (leg2 && leg2.every(strike => strike === 0)) {
        leg2 = [...leg1];
    }

    return { leg1, leg2: n2 ? leg2 : null };
};
