// Strategy Configuration - Fixed syntax and structure
const STRAT_CONFIGS = {
    // No-op
    'Custom': { leg1: {type:'call', isBuy:true},
                leg2: null },

    // Single-leg
    'Call Option': { leg1: {type:'call', isBuy:true},
                     leg2: null },
    'Put Option': { leg1: {type:'put', isBuy:true},
                    leg2: null },

    // // Two-leg spreads
    // 'Vertical Call Spread':   { leg1: {type:'call', isBuy:true},
    //                             leg2: {type:'call', isBuy:false}},
    // 'Horizontal Call Spread': { leg1: {type:'call', isBuy:true},
    //                             leg2: {type:'call', isBuy:false} },
    // 'Diagonal Call Spread':   { leg1: {type:'call', isBuy:true},
    //                             leg2: {type:'call', isBuy:false} },

    'Call Spread':   { leg1: {type:'call', isBuy:true},
        leg2: {type:'call', isBuy:false}},

    // 'Vertical Put Spread':    { leg1: {type:'put', isBuy:true},
    //                             leg2: {type:'put', isBuy:false} },
    // 'Horizontal Put Spread':  { leg1: {type:'put', isBuy:true},
    //                             leg2: {type:'put', isBuy:false} },
    // 'Diagonal Put Spread':    { leg1: {type:'put', isBuy:true},
    //                             leg2: {type:'put', isBuy:false} },

    'Put Spread':    { leg1: {type:'put', isBuy:true},
        leg2: {type:'put', isBuy:false} },



    'Straddle': { leg1: {type:'call', isBuy:true},
                  leg2: {type:'put', isBuy:true} },
    'Strangle': { leg1: {type:'put', isBuy:true},
                  leg2: {type:'call', isBuy:true} },


    // Two-panel "spread of spreads"
    'Straddle Spread':        { leg1: {type:'straddle', isBuy:true},
                                leg2: {type:'straddle', isBuy:false} },
    // 'Diagonal Straddle Spread': {   leg1: {type:'straddle', isBuy:true},
    //                                 leg2: {type:'straddle', isBuy:false} },

    'Strangle Spread':        { leg1: {type:'strangle', isBuy:true},
                                leg2: {type:'strangle', isBuy:false} },
    // 'Diagonal Strangle Spread': { leg1: {type:'strangle', isBuy:true},
    //                               leg2: {type:'strangle', isBuy:false} },


    // Collars / fences
    'Fence': { leg1: {type:'put', isBuy:true},
               leg2: {type:'call', isBuy:false} },

    // Butterflies (one panel)
    'Call Fly': { leg1: {type:'call fly', isBuy:true},
                  leg2: null },
    'Put Fly': { leg1: {type:'put fly', isBuy:true},
                 leg2: null },

    // Conversion / Reversal (dual panel: call vs put)
    'Conversion/Reversal': { leg1: {type:'put', isBuy:true},
                             leg2: {type:'call', isBuy:false} },

    // Iron and Condor combos
    'Iron Butterfly': {leg1: { type: 'put spread', isBuy: true },
                       leg2: { type: 'call spread', isBuy: false }},

    'Call Condor': {leg1: { type: 'call spread', isBuy: true },
                    leg2: { type: 'call spread', isBuy: false }},
    'Put Condor': { leg1: { type: 'put spread', isBuy: true },
                     leg2: { type: 'put spread', isBuy: false }},
    'Iron Condor': { leg1: { type: 'put spread', isBuy: true },
                     leg2: { type: 'call spread', isBuy: false }},

    // Trees (one panel)
    'Call Tree': {leg1: { type: 'call spread', isBuy: true },
                  leg2: { type: 'call', isBuy: false }},
    'Put Tree': {leg1: { type: 'put spread', isBuy: true },
                 leg2: { type: 'put', isBuy: false }},

    // 3-Way combos
    '3-Way: Call Spread v Put': {leg1: { type: 'call spread', isBuy: true },
                                 leg2: { type: 'put', isBuy: false }},
    '3-Way: Put Spread v Call': {leg1: { type: 'put spread', isBuy: true },
                                 leg2: { type: 'call', isBuy: false }},
    '3-Way: Straddle v Call': {leg1: { type: 'straddle', isBuy: true },
                               leg2: { type: 'call', isBuy: false }},
    '3-Way: Straddle v Put': {leg1: { type: 'straddle', isBuy: true },
                              leg2: { type: 'put', isBuy: false }},
};
const STRAT_STRIKE_MAP = {
    'call': 1,
    'put': 1,
    'call spread': 2,
    'put spread': 2,
    'straddle': 2,
    'strangle': 2,
    'call fly': 3,
    'put fly': 3,

};

// Enhanced Trade Leg Class with better validation
// Enhanced Trade Leg Class with proper initialization
class TradeLeg {
    constructor(type, isBuy){
        this.isBuy = isBuy;
        this.type = type;

        // Get the required number of strikes from the mapping
        const requiredStrikes = STRAT_STRIKE_MAP[type] || 1;

        // Initialize arrays with proper length
        this.strikes = new Array(requiredStrikes).fill(0);
        this.prices = new Array(requiredStrikes).fill(0);

        this.expiry = '';
        this.underlying = 0;
        this.delta = 0;
    }

    // Method to update type and resize arrays accordingly
    updateType(newType) {
        const requiredStrikes = STRAT_STRIKE_MAP[newType] || 1;
        const oldStrikes = [...this.strikes];
        const oldPrices = [...this.prices];

        // Create new arrays with proper length
        this.strikes = new Array(requiredStrikes).fill(0);
        this.prices = new Array(requiredStrikes).fill(0);

        // Copy over existing values up to the minimum of old and new lengths
        const copyLength = Math.min(oldStrikes.length, requiredStrikes);
        for (let i = 0; i < copyLength; i++) {
            this.strikes[i] = oldStrikes[i];
            this.prices[i] = oldPrices[i];
        }

        this.type = newType;
    }

    getPrices() {
        return this.prices;
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



// Main Trade Class with improvements
class Trade {
    constructor(strategyType) {
        this.strategyType = strategyType;



        this.exchange = 'CME';// = this.parsedData.exchange || 'CME';
        this.isLive = false; // = this.parsedData.isLive;
        this.ratio = ''; // = this.parsedData.ratio;
        //this.lots = this.parsedData.lots; // Fixed: was missing assignment

        this.lots = 100; // Default to 1 lot if not specified

        const leg1Type = STRAT_CONFIGS[this.strategyType].leg1.type;
        const leg1Buy = STRAT_CONFIGS[this.strategyType].leg1.isBuy;


        if(STRAT_CONFIGS[this.strategyType].leg2) {
            const leg2Type = STRAT_CONFIGS[this.strategyType].leg2.type;
            const leg2Buy = STRAT_CONFIGS[this.strategyType].leg2.isBuy;
            this.leg2 = new TradeLeg(leg2Type, leg2Buy);
        }

        this.leg1 = new TradeLeg(leg1Type, leg1Buy);

        this.buyers = [];
        this.sellers = [];
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


}

// Factory function to create trades (main export)
export function breakdownTrade(parsedData) {
    let trade = new Trade(parsedData.strategyType);
    trade.exchange = parsedData.exchange || 'CME';
    trade.isLive = parsedData.isLive || false;
    trade.ratio = parsedData.ratio || '';
    trade.lots = parsedData.lots || 100;
    if (trade.leg1) {
        //const L = trade.leg1.strikes.length;             // expected length
        const L = STRAT_STRIKE_MAP[trade.leg1.type]; // expected length based on type
        const src = (parsedData.strikes);

        for (let i = 0; i < L; i++) {
            trade.leg1.strikes[i] = (src[i] ?? 0);         // take first L, pad with 0s
        }
        //trade.leg1.strikes = parsedData.strikes || [];
        trade.leg1.expiry = parsedData.expiry || '';
        trade.leg1.underlying = parsedData.underlying || 0;
        trade.leg1.delta = parsedData.delta || 0;
        trade.leg1.prices = new Array(STRAT_STRIKE_MAP[trade.leg1.type]).fill(0);
    }
    if (trade.leg2) {
        //const L = trade.leg2.strikes.length;             // expected length
        const L = STRAT_STRIKE_MAP[trade.leg2.type];
        const src = (parsedData.strikes2);

        for (let i = 0; i < L; i++) {
            trade.leg2.strikes[i] = (src[i] ?? 0);         // take first L, pad with 0s
        }
        //trade.leg2.strikes = parsedData.strikes2 || [];
        trade.leg2.expiry = parsedData.expiry2 || '';
        trade.leg2.underlying = parsedData.underlying2 || 0;
        trade.leg2.delta = parsedData.delta2 || 0;
        trade.leg2.prices = new Array(STRAT_STRIKE_MAP[trade.leg2.type]).fill(0);
    }
    trade.buyers = [];
    trade.sellers =  [];

    return trade;
}
export function calculatePrice(leg) {
    const prices = leg.prices;
    if(!prices || prices.length === 0) return 0;
    switch(leg.type) {
        case 'call':
        case 'put': {
            let price = 0;
            for (let i = 0; i < prices.length; i++) {
                price += parseFloat(prices[i]) || 0;
            }
            return Math.abs(price);
        }

        case 'call fly':
        case 'put fly': {
            let flyPrice = 0;
            // Fly: buy-sell-buy or sell-buy-sell pattern
            const flyMultipliers =  [1, -2, 1];
            for (let i = 0; i < 3; i++) {
                const strikePrice = parseFloat(prices[i]) || 0;
                const mult = flyMultipliers[i] || 0;
                flyPrice += strikePrice * mult;
            }
            return Math.abs(flyPrice);
        }

        case 'straddle':
        case 'strangle': {
            let straddlePrice = 0;
            for (let i = 0; i < prices.length; i++) {
                straddlePrice += parseFloat(prices[i]) || 0;
            }
            return straddlePrice;
        }

        case 'call spread':
        case 'put spread': {
            let spreadPrice = 0;
            // Spread: buy-sell or sell-buy pattern
            const spreadMultipliers = [1, -1];
            for (let i = 0; i < 2; i++) {
                const strikePrice = parseFloat(prices[i]) || 0;
                const mult = spreadMultipliers[i] || 0;
                spreadPrice += strikePrice * mult;
            }
            return Math.abs(spreadPrice);
        }

        default:
            return 0;
    }
}

// Export classes for advanced usage
export {Trade, TradeLeg, STRAT_CONFIGS, STRAT_STRIKE_MAP };