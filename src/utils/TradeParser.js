// Trade Parser Class
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

        // Single options and basic spreads
        if (lower.includes('straddle') || lower.includes('strd')) {
            if (strikes.length === 1 && !expiry2) {
                return 'Straddle';
            } else if (strikes.length >= 2 || expiry2) {
                if (!expiry2) {
                    return 'Straddle Spread';
                } else {
                    return 'Diagonal Straddle Spread';
                }
            }
        }

        if (lower.includes('strangle') || lower.includes('strang')) {
            return 'Strangle';
        }

        // Call strategies
        if (lower.includes('call') || lower.includes('c') ||  lower.includes('cs')) {
            if (strikes.length === 1 && !expiry2) {
                return 'Call Option';
            } else if (strikes.length === 2) {
                if (!expiry2) {
                    return 'Vertical Call Spread';
                } else if (!strikes2) {
                    return 'Horizontal Call Spread';
                } else {
                    return 'Diagonal Call Spread';
                }
            } else if (strikes.length >= 3) {
                return 'Call Fly';
            }
        }

        // Put strategies
        if (lower.includes('put') || lower.includes('p ') ||  lower.includes('ps')) {
            if (strikes.length === 1 && !expiry2) {
                return 'Put Option';
            } else if (strikes.length === 2) {
                if (!expiry2) {
                    return 'Vertical Put Spread';
                } else if (!strikes2) {
                    return 'Horizontal Put Spread';
                } else {
                    return 'Diagonal Put Spread';
                }
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
            'call_spread-put': '3-Way: Call Spread v Put',
            'put_spread-call': '3-Way: Put Spread v Call',
            'straddle-call': '3-Way: Straddle v Call',
            'straddle-put': '3-Way: Straddle v Put',
            'straddle-straddle': expiry2 ? 'Diagonal Straddle Spread' : 'Straddle Spread',
            'call_spread-put_spread': 'Iron Condor',
            'put_spread-call_spread': 'Iron Condor',
            'call_spread-call_spread': 'Call Condor',
            'put_spread-put_spread': 'Put Condor',
            'put-call': 'Conversion/Reversal',
            'call-put': 'Conversion/Reversal'
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

        if (side.includes('straddle') || side.includes('strd')) {
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
        const exchange = this.knownExchanges.find(ex => raw.includes(ex)) || null;

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

        // Strikes2 (for versus structures)
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
        const underTok = tokens.find(t => /^[Xx]\d+(\.\d+)?$/.test(t));
        let underlying = underTok ? parseFloat(underTok.slice(1)) : null;

        let underlying2 = null;
        if (isVersus) {
            const afterVs = raw.split(/vs\.?/i)[1] || '';
            const underTok2 = afterVs.trim().split(/\s+/)
                .find(t => /^[Xx]\d+(\.\d+)?$/.test(t));
            underlying2 = underTok2 ? parseFloat(underTok2.slice(1)) : null;
        }

        // Deltas
        const deltaMatches = raw.match(/(\d+)d/g) || [];
        let delta = deltaMatches[0] ? parseInt(deltaMatches[0], 10) : null;
        let delta2 = deltaMatches[1] ? parseInt(deltaMatches[1], 10) : null;

        // Price
        const priceMatch = raw.match(/(?:trades?|live)\s+(-?\d*\.?\d+)/i);
        const price = priceMatch ? parseFloat(priceMatch[1]) : null;

        // Lots
        const lotsMatch = raw.match(/\((\d+)x\)$/);
        const lots = lotsMatch ? parseInt(lotsMatch[1], 10) : 100;

        // Strategy type
        const strategyType = this.determineStrategyType(raw, strikes, expiry2, strikes2);

        // Ratio (eg. "1.5x2" or "1x2")
        const ratio = tokens.find(t => /^[1-9]\d*(?:\.\d+)?x\d+$/.test(t));

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
            isLive,
            isVersus,
            ratio
        };
    }
}
// export {TradeParser};

