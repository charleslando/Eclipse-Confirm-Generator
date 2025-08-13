import {STRAT_CONFIGS, STRAT_STRIKE_MAP} from "./TradeParser.js";
// Enhanced Trade Leg Class
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
    trade.ratio = parsedData.ratio || '1x1';
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

        const L = STRAT_STRIKE_MAP[trade.leg2.type];
        const src = (parsedData.strikes2);

        for (let i = 0; i < L; i++) {
            trade.leg2.strikes[i] = (src[i] ?? 0);         // take first L, pad with 0s
        }
        trade.leg2.expiry = parsedData.expiry2 || '';
        trade.leg2.underlying = parsedData.underlying2 || 0;
        trade.leg2.delta = parsedData.delta2 || 0;
        trade.leg2.prices = new Array(STRAT_STRIKE_MAP[trade.leg2.type]).fill(0);
    }
    trade.buyers = [];
    trade.sellers =  [];
    trade.price = parsedData.price || 0;

    return trade;
}
export function calculatePrice(trade, leg) {
    const prices = leg.prices;
    const parts = trade.ratio.split('x');
    // let ratio = parts.length > 1 ? parseFloat(parts[1]) : 1
    //check to see if the leg is leg1 or leg2
    let ratio = 1; // Default ratio
    if(trade.leg1 === leg) {
        ratio = parts[0];
    }
    else if(trade.leg2 === leg) {
        ratio = parts[1] || 1; // Use second part for leg2, default to 1 if not specified
    }

    if(!prices || prices.length === 0) return 0;
    switch(leg.type) {
        case 'call':
        case 'put': {
            let price = 0;
            for (let i = 0; i < prices.length; i++) {
                price += parseFloat(prices[i]) || 0;
            }
            return Math.abs(price) * ratio; // Apply ratio if needed
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
            return Math.abs(flyPrice) * ratio; // Apply ratio if needed
        }

        case 'straddle':
        case 'strangle': {
            let straddlePrice = 0;
            for (let i = 0; i < prices.length; i++) {
                straddlePrice += parseFloat(prices[i]) || 0;
            }
            return straddlePrice * ratio; // Apply ratio if needed
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
            return Math.abs(spreadPrice) * ratio; // Apply ratio if needed
        }

        default:
            return 0;
    }
}

// Export classes for advanced usage
export {Trade, TradeLeg, STRAT_CONFIGS, STRAT_STRIKE_MAP };