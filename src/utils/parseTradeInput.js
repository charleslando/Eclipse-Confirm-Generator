// Strategy Configuration
const STRAT_CONFIGS = {
    // No-op
    '---':                    { leg1: null,           leg2: null },

    // Single-leg
    'Call Option':            { leg1: 'call',         leg2: null },
    'Put Option':             { leg1: 'put',          leg2: null },
    'Straddle':               { leg1: 'straddle',     leg2: null },
    'Strangle':               { leg1: 'strangle',     leg2: null },

    // Spreads (all one panel)
    'Vertical Call Spread':   { leg1: 'call',  leg2: 'call' },
    'Horizontal Call Spread': { leg1: 'call',  leg2: 'call' },
    'Diagonal Call Spread':   { leg1: 'call',  leg2: 'call' },
    'Vertical Put Spread':    { leg1: 'put',   leg2: 'put' },
    'Horizontal Put Spread':  { leg1: 'put',   leg2: 'put' },
    'Diagonal Put Spread':    { leg1: 'put',   leg2: 'put' },

    // Two-panel "spread of spreads"
    'Straddle Spread':            { leg1: 'straddle',     leg2: 'straddle' },
    'Diagonal Straddle Spread':   { leg1: 'straddle',     leg2: 'straddle' },

    // Collars / fences
    'Fence':                 { leg1: 'put',           leg2: 'call' },

    // Butterflies (one panel)
    'Call Fly':              { leg1: 'butterfly',     leg2: null },
    'Put Fly':               { leg1: 'butterfly',     leg2: null },

    // Conversion / Reversal (dual panel: call vs put)
    'Conversion/Reversal':   { leg1: 'call',         leg2: 'put' },

    // Iron and Condor combos
    'Iron Butterfly':        { leg1: 'put spread',   leg2: 'call spread' },
    'Call Condor':           { leg1: 'call spread',  leg2: 'call spread' },
    'Put Condor':            { leg1: 'put spread',   leg2: 'put spread' },
    'Iron Condor':           { leg1: 'call spread',  leg2: 'put spread' },

    // Trees (one panel)
    'Call Tree':             { leg1: 'call tree',     leg2: null },
    'Put Tree':              { leg1: 'put tree',      leg2: null },

    // 3-Way combos
    '3-Way: Call Spread v Put':    { leg1: 'call spread',  leg2: 'put' },
    '3-Way: Put Spread v Call':    { leg1: 'put spread',   leg2: 'call' },
    '3-Way: Straddle v Call':      { leg1: 'straddle',     leg2: 'call' },
    '3-Way: Straddle v Put':       { leg1: 'straddle',     leg2: 'put' },
};

// Trade Leg Class
class TradeLeg {
    constructor(isBuy, type, strikes, price, expiry, underlying, delta) {
        this.isBuy = isBuy;
        this.type = type;
        this.strikes = strikes || [];
        this.price = price;
        this.expiry = expiry;
        this.underlying = underlying;
        this.delta = delta;
    }

    getPrice() {
        return this.price;
    }

    generateConfirm() {
        const action = this.isBuy ? 'Buy' : 'Sell';
        const strikeStr = this.strikes.length > 0 ? this.strikes.join('/') : 'N/A';
        return `Confirm ${action} ${this.type} @ ${strikeStr} for ${this.getPrice()}`;
    }

    toString() {
        const action = this.isBuy ? 'Long' : 'Short';
        const strikeStr = this.strikes.length > 0 ? ` @ ${this.strikes.join('/')}` : '';
        return `${action} ${this.type}${strikeStr}`;
    }
}

// Trade Parser Class
class TradeParser {
    constructor() {
        this.QUARTER_MAPPING = {
            'FH': '1Q',
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
        let strategyType = '---';

        if (lower.includes('call') || lower.includes('c')) {
            if (strikes.length === 1) {
                strategyType = 'Call Option';
            } else if (strikes.length === 2) {
                if (!expiry2) {
                    strategyType = 'Vertical Call Spread';
                } else if (!strikes2) {
                    strategyType = 'Horizontal Call Spread';
                } else {
                    strategyType = 'Diagonal Call Spread';
                }
            } else if (strikes.length > 2) {
                strategyType = 'Call Fly';
            }
        } else if (lower.includes('put') || lower.includes('p')) {
            if (strikes.length === 1) {
                strategyType = 'Put Option';
            } else if (strikes.length === 2) {
                if (!expiry2) {
                    strategyType = 'Vertical Put Spread';
                } else if (!strikes2) {
                    strategyType = 'Horizontal Put Spread';
                } else {
                    strategyType = 'Diagonal Put Spread';
                }
            } else if (strikes.length > 2) {
                strategyType = 'Put Fly';
            }
        } else if (lower.includes('straddle') || lower.includes('strd')) {
            if (strikes.length === 1) {
                strategyType = 'Straddle';
            } else if (strikes.length > 2) {
                if (!expiry2) {
                    strategyType = 'Straddle Spread';
                } else {
                    strategyType = 'Diagonal Straddle Spread';
                }
            }
        } else if (lower.includes('strangle') || lower.includes('strang')) {
            strategyType = 'Strangle';
        }

        return strategyType;
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

        // Ratio  (eg. "1.5x2" or "1x2")

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

// Main Trade Class
class Trade {
    constructor(rawInput) {
        this.rawInput = rawInput;
        let parser = new TradeParser();
        this.parsedData = parser.parse(rawInput);

        this.strategyType = this.parsedData.strategyType;
        this.exchange = this.parsedData.exchange;
        this.lots = this.parsedData.lots;
        this.isLive = this.parsedData.isLive;
        this.ratio = this.parsedData.ratio;


        this.leg1 = this.createLeg1();
        this.leg2 = this.createLeg2();

        this.buyers = [];
        this.sellers = [];


    }

    createLeg1() {
        return new TradeLeg(
            true, // isBuy - you might want to infer this from input
            STRAT_CONFIGS[this.strategyType].leg1,
            this.parsedData.strikes,
            this.parsedData.price,
            this.parsedData.expiry,
            this.parsedData.underlying,
            this.parsedData.delta
        );
    }

    createLeg2() {
        return new TradeLeg(
            false, // isBuy - opposite of leg1, or infer from input
            STRAT_CONFIGS[this.strategyType].leg2,
            this.parsedData.strikes2 || this.parsedData.strikes,
            this.parsedData.price,
            this.parsedData.expiry2 || this.parsedData.expiry,
            this.parsedData.underlying2 || this.parsedData.underlying,
            this.parsedData.delta2 || this.parsedData.delta
        );
    }

    generateConfirmation() {
        let confirmation = `Trade Confirmation:\n`;
        confirmation += `Strategy: ${this.strategyType}\n`;
        confirmation += `Exchange: ${this.exchange || 'N/A'}\n`;
        confirmation += `Lots: ${this.lots}\n`;
        confirmation += `Live: ${this.isLive ? 'Yes' : 'No'}\n\n`;

        if (this.leg1) {
            confirmation += `Leg 1: ${this.leg1.generateConfirm()}\n`;
        }
        if (this.leg2) {
            confirmation += `Leg 2: ${this.leg2.generateConfirm()}\n`;
        }

        return confirmation;
    }

    toString() {
        let result = `${this.strategyType}`;
        if (this.leg1) result += ` | ${this.leg1.toString()}`;
        if (this.leg2) result += ` | ${this.leg2.toString()}`;
        return result;
    }

    // Getter methods for easy access
    getLegs() {
        return [this.leg1, this.leg2].filter(leg => leg !== null);
    }

    getParsedData() {
        return this.parsedData;
    }

    getStrategyConfig() {
        return this.strategyConfig;
    }



    // Setters for updating object
    updateLeg(legIndex, property, value) {
        if (legIndex === 1 && this.leg1) {
            this.leg1[property] = value;
        } else if (legIndex === 2 && this.leg2) {
            this.leg2[property] = value;
        }
    }
    setLive(isLive) {
        this.isLive = isLive;
    }
    setRatio(ratio) {
        this.ratio = ratio;
    }
    setLots(lots) {
        this.lots = lots;
    }
    setExchange(exchange) {
        this.exchange = exchange;
    }
    setStrategyType(strategyType) {
        this.strategyType = strategyType;
        this.leg1 = this.createLeg1();
        this.leg2 = this.createLeg2();
    }

}

// Factory function to create trades (main export)
export function breakdownTrade(input) {
    return new Trade(input);
}

// Export classes for advanced usage
export { Trade, TradeLeg, STRAT_CONFIGS };






























































// const STRAT_CONFIGS = {
//     // No-op
//     '---':                    { leg1: null,           leg2: null },
//
//     // Single-leg
//     'Call Option':            { leg1: 'call',         leg2: null },
//     'Put Option':             { leg1: 'put',          leg2: null },
//     'Straddle':               { leg1: 'straddle',     leg2: null },
//     'Strangle':               { leg1: 'strangle',     leg2: null },
//
//     // Spreads (all one panel)
//     'Vertical Call Spread':   { leg1: 'call',  leg2: 'call' },
//     'Horizontal Call Spread': { leg1: 'call',  leg2: 'call' },
//     'Diagonal Call Spread':   { leg1: 'call',  leg2: 'call' },
//     'Vertical Put Spread':    { leg1: 'put',   leg2: 'put' },
//     'Horizontal Put Spread':  { leg1: 'put',   leg2: 'put' },
//     'Diagonal Put Spread':    { leg1: 'put',   leg2: 'put' },
//
//     // Two-panel “spread of spreads”
//     'Straddle Spread':            { leg1: 'straddle',     leg2: 'straddle' },
//     'Diagonal Straddle Spread':   { leg1: 'straddle',     leg2: 'straddle' },
//
//     // Collars / fences
//     'Fence':                 { leg1: 'put',           leg2: 'call' },
//
//     // Butterflies (one panel)
//     'Call Fly':              { leg1: 'butterfly',     leg2: null },
//     'Put Fly':               { leg1: 'butterfly',     leg2: null },
//
//     // Conversion / Reversal (dual panel: call vs put)
//     'Conversion/Reversal':   { leg1: 'call',         leg2: 'put' },
//
//     // Iron and Condor combos
//     'Iron Butterfly':        { leg1: 'put spread',   leg2: 'call spread' },
//     'Call Condor':           { leg1: 'call spread',  leg2: 'call spread' },
//     'Put Condor':            { leg1: 'put spread',   leg2: 'put spread' },
//     'Iron Condor':           { leg1: 'call spread',  leg2: 'put spread' },
//
//     // Trees (one panel)
//     'Call Tree':             { leg1: 'call tree',     leg2: null },
//     'Put Tree':              { leg1: 'put tree',      leg2: null },
//
//     // 3-Way combos
//     '3-Way: Call Spread v Put':    { leg1: 'call spread',  leg2: 'put' },
//     '3-Way: Put Spread v Call':    { leg1: 'put spread',   leg2: 'call' },
//     '3-Way: Straddle v Call':      { leg1: 'straddle',     leg2: 'call' },
//     '3-Way: Straddle v Put':       { leg1: 'straddle',     leg2: 'put' },
// };
//
// export function parseTradeInput(rawInput) {
//     const raw   = rawInput.trim();
//     //const lower = raw.toLowerCase();
//
//     // 1) Quick whitespace‑split tokens
//     const tokens = raw.split(/\s+/);
//
//     // 2) Exchange code if present
//     const knownExchanges = ['WTI','Brent','NYM/ICE'];
//     const exchange = knownExchanges.find(ex => raw.includes(ex)) || null;
//
//     // 3) Flags
//     const isLive           = /live/i.test(raw); // "live" indicates a live trade
//     const isVersus = /\bvs\.?\b/i.test(raw); // "vs" or "vs." indicates a versus structure
//
//
//     // 4) Expiries
//     const QUARTER_MAPPING = { // maps month codes to quarters
//         'FH': '1Q',
//         'JM': '2Q',
//         'NV': '3Q',
//         'VZ': '4Q',
//         'XH': 'Winter ',
//         'JV': 'Summer '
//
//     };
//
//     const parseExpiry = (match) => {
//         if (!match) return null;
//         const month = match.match(/^[A-Z]+/)[0];
//         const year = match.match(/\d{2}$/)[0];
//         return QUARTER_MAPPING[month] ? QUARTER_MAPPING[month] + year : match;
//     };
//
//     const expiryMatches = raw.match(/\b[FJNVX]?[FGHJKMNQUVXZ]\d{2}\b/g) || [];
//     let expiry = parseExpiry(expiryMatches[0]);
//     let expiry2 = isVersus ? parseExpiry(expiryMatches[1]) : null;
//
//
//     // 5) Strikes (and handle inline “cs”/“ps” suffixes automatically)
//     let strikes = [];
//     const strikeTok = tokens.find(t => /^([\d.]+(?:\/[\d.]+)*)([a-z]+)?$/i.test(t)); // matches "123.45", "123.45/67.89", "123.45c", "123.45/67.89ps"
//     if (strikeTok) {
//         const m = strikeTok.match(/^([\d.]+(?:\/[\d.]+)*)([a-z]+)?$/i);
//         strikes = m[1].split('/').map(n => parseFloat(n));
//     }
//
//     // 6) Strikes2
//     let strikes2 = null;
//     if (isVersus) {
//         const afterVs = raw.split(/vs\.?/i)[1] || '';
//         const tok2 = afterVs.trim().split(/\s+/)
//             .find(t => /^([\d.]+(?:\/[\d.]+)*)([a-z]+)?$/i.test(t));
//         if (tok2) {
//             const m2 = tok2.match(/^([\d.]+(?:\/[\d.]+)*)([a-z]+)?$/i);
//             strikes2 = m2[1].split('/').map(n => parseFloat(n));
//         }
//     }
//
//     // 7) Underlying ratio “x3.15”
//     const underTok   = tokens.find(t => /^[Xx]\d+(\.\d+)?$/.test(t));
//     let underlying = underTok ? parseFloat(underTok.slice(1)) : null;
//
//     let underlying2 = null;
//     if (isVersus) {
//         const afterVs = raw.split(/vs\.?/i)[1] || '';
//         const underTok2 = afterVs.trim().split(/\s+/)
//             .find(t => /^[Xx]\d+(\.\d+)?$/.test(t));
//         underlying2 = underTok2 ? parseFloat(underTok2.slice(1)) : null;
//     }
//
//     // 8) Deltas: “12d” etc.
//     const deltaMatches = raw.match(/(\d+)d/g) || [];
//     let delta  = deltaMatches[0] ? parseInt(deltaMatches[0], 10) : null;
//     let delta2 = deltaMatches[1] ? parseInt(deltaMatches[1], 10) : null;
//
//     // 9) Price (handles “.0470”, “-.005”, “1.234”)
//     const priceMatch = raw.match(/(?:trades?|live)\s+(-?\d*\.?\d+)/i);
//     const price      = priceMatch ? parseFloat(priceMatch[1]) : null;
//
//     // 10) Lots at end “(500x)”
//     const lotsMatch = raw.match(/\((\d+)x\)$/);
//     const lots      = lotsMatch ? parseInt(lotsMatch[1], 10) : 100;
//
//     // 11) Strategy‑type inference
//     const strategyType = determineStrategyType(raw, strikes, expiry2, strikes2);
//
//
//
//     // // determine if there will be a dual structure
//     //
//     // const isDualStructure = STRATEGY_CONFIGS[strategyType]?.dualPanel || false;
//     //
//     // if (!isDualStructure) {
//     //     //combine expiry2, strikes2, underlying2, delta2
//     //     expiry = expiry2? [expiry, expiry2] : expiry;
//     //     expiry2 = null;
//     //     strikes = strikes2? [...strikes, ...strikes2] : strikes;
//     //     strikes2 = null;
//     //     underlying = underlying2? [underlying, underlying2] : underlying;
//     //     underlying2 = null;
//     //     delta = delta2? [delta, delta2] : delta;
//     //     delta2 = null;
//     // }
//
//
//
//     return {
//         exchange,
//         expiry,
//         expiry2,
//         strikes,
//         strikes2,
//         strategyType,
//         underlying,
//         underlying2,
//         delta,
//         delta2,
//         price,
//         lots,
//         isDualStructure,
//         isLive
//     };
// }
//
// export function createLeg(isBuy, type, strikes, price) {
//     return {
//         isBuy,
//         type,
//         strikes,
//         expiry,
//         underlying,
//         delta,
//         getPrice(){
//             // This function can be used to calculate the price based on strikes
//             // For now, it just returns the provided price
//             return price;
//         },
//         generateConfirm() {
//             // This function can be used to generate a confirmation message
//             // For now, it just returns a simple string
//             return `Confirm ${this.isBuy ? 'Buy' : 'Sell'} ${this.type} with strikes ${this.strikes.join(', ')} and price ${this.getPrice()}`;
//         }
//     };
// }
//
// export function createTradeObject(strategyType, leg1, leg2) {
//     return {
//         strategyType,
//         leg1,
//         leg2,
//         //buyers,
//         //sellers,
//     };
// }
//
// export function determineStrategyType(text, strikes, expiry2, strikes2) {
//     const lower = text.toLowerCase();
//     let strategyType = '---';
//
//     if (lower.includes('call') || lower.includes('c')) {
//         if (strikes.length === 1) {
//             strategyType = 'Call Option';
//         }
//         else if (strikes.length === 2) {
//             if (!expiry2) {
//                 strategyType = 'Vertical Call Spread';
//             }
//             else if (!strikes2) {
//                 strategyType = 'Horizontal Call Spread';
//             }
//             else {
//                 strategyType = 'Diagonal Call Spread';
//             }
//         }
//         else if (strikes.length > 2) {
//             strategyType = 'Call Fly';
//         }
//     }
//     else if (lower.includes('put') || lower.includes('p')) {
//         if (strikes.length === 1) {
//             strategyType = 'Put Option';
//         }
//         else if (strikes.length === 2) {
//             if (!expiry2) {
//                 strategyType = 'Vertical Put Spread';
//             }
//             else if (!strikes2) {
//                 strategyType = 'Horizontal Put Spread';
//             }
//             else {
//                 strategyType = 'Diagonal Put Spread';
//             }
//         }
//         else if (strikes.length > 2) {
//             strategyType = 'Put Fly';
//         }
//     }
//     else if (lower.includes('straddle') || lower.includes('strad')) {
//         if (strikes.length === 1) {
//             strategyType = 'Straddle';
//         }
//         else if (strikes.length > 2) {
//             if (!expiry2) {
//                 strategyType = 'Straddle Spread';
//             }
//             else {
//                 strategyType = 'Diagonal Straddle Spread';
//             }
//         }
//     }
//     else if (lower.includes('strangle') || lower.includes('strang')) {
//         strategyType = 'Strangle';
//     }
//
//     return strategyType;
// }
//
// export function getStrategyConfig(strategyType) {
//     return STRAT_CONFIGS[strategyType] || STRAT_CONFIGS['---'];
// }
//
//
// export function breakdownTrade(input){
//     const tradeDetails = parseFloat(input);
//     const strategyConfig = getStrategyConfig(tradeDetails.strategyType);
//     const isDualStructure = strategyConfig.leg1 && strategyConfig.leg2;
//
//     let leg1 = null;
//     let leg2 = null;
//
//     if (strategyConfig.leg1){
//         leg1 = createLeg(
//             isBuy: true,
//             type: strategyConfig.leg1,
//             price: tradeDetails.price,
//         )
//     }
// }
//
//
//