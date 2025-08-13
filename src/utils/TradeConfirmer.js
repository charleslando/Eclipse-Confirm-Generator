// TradeConfirmer.js - Dedicated trade confirmation generator
export class TradeConfirmer {
    constructor(trade) {
        this.trade = trade;
    }

    /**
     * Generate confirmations for all counterparties
     * @param {Array} buyers - Array of buyer objects {name, quantity}
     * @param {Array} sellers - Array of seller objects {name, quantity}
     * @returns {string} - Formatted confirmation text
     */
    generateConfirmations(buyers = [], sellers = []) {
        if (!this.trade) return '';

        const confirmations = [];

        // Default counterparties if none provided
        if (!buyers.length && !sellers.length) {
            buyers.push({ name: 'BUYER_1', quantity: 100 });
            sellers.push({ name: 'SELLER_1', quantity: 100 });
        }

        // Generate buyer confirmations
        buyers.forEach(({ name, quantity }) => {
            confirmations.push(this.generateCounterpartyConfirmation(name, quantity, 'BUYER'));
        });

        // Generate seller confirmations
        sellers.forEach(({ name, quantity }) => {
            confirmations.push(this.generateCounterpartyConfirmation(name, quantity, 'SELLER'));
        });

        return confirmations.join('\n\n');
    }

    /**
     * Generate confirmation for a single counterparty
     */
    generateCounterpartyConfirmation(name, quantity, side) {
        const isBuyer = side === 'BUYER';
        const lines = [];

        // Header
        lines.push(`${side}: ${name.toUpperCase()}`);
        lines.push(`To Confirm: ${this.trade.exchange} Cleared`);

        // Generate trade lines for all legs
        const tradeLines = this.generateAllTradeLines(quantity, isBuyer);
        lines.push(...tradeLines);

        return lines.join('\n');
    }

    /**
     * Generate all trade lines for the trade (handles both legs)
     */
    generateAllTradeLines(quantity, isBuyer) {
        const lines = [];

        // Generate lines for leg1 (premium leg)
        if (this.trade.leg1) {
            let ratio = this.parseRatio(this.trade.ratio, 1);
            const leg1Lines = this.generateLegLines(this.trade.leg1, quantity, isBuyer, ratio);
            lines.push(...leg1Lines);
        }

        // Generate lines for leg2 if it exists
        if (this.trade.leg2) {
            let ratio = this.parseRatio(this.trade.ratio, 2);
            const leg2Lines = this.generateLegLines(this.trade.leg2, quantity, isBuyer, ratio);
            lines.push(...leg2Lines);
        }

        return lines;
    }

    /**
     * Generate trade lines for a specific leg
     */
    generateLegLines(leg, quantity, isBuyer, ratio) {
        const lines = [];

        // Determine if this leg should be bought or sold
        // For buyers: follow the leg's isBuy direction
        // For sellers: flip the leg's isBuy direction
        let shouldBuyLeg = isBuyer ? leg.isBuy : !leg.isBuy;

        // Generate option lines based on leg type
        const optionLines = this.generateOptionLines(leg, quantity, shouldBuyLeg, ratio);
        lines.push(...optionLines);

        // Generate futures line for hedged trades
        if (!this.trade.isLive) {
            if(this.trade.leg1.underlying === this.trade.leg2.underlying) {
                if(leg === this.trade.leg2) { // only add futures line once for the second leg
                    shouldBuyLeg = !shouldBuyLeg; // flip becauuse its really following the first leg i just want to add it once at the end
                    console.log('is this running');
                    const futuresLine = this.generateFuturesLine(this.trade.leg1, quantity, shouldBuyLeg, leg.type, ratio);
                    if (futuresLine) {
                        lines.push(futuresLine);
                    }
                }
            } else {
                const futuresLine = this.generateFuturesLine(leg, quantity, shouldBuyLeg, leg.type, ratio);
                if (futuresLine) {
                    lines.push(futuresLine);
                }
            }


        }

        return lines;
    }

    /**
     * Generate option lines based on leg type
     */
    generateOptionLines(leg, quantity, shouldBuy, ratio) {
        const type = leg.type.toLowerCase();

        switch (type) {
            case 'call':
            case 'put':
                return [this.generateSingleOptionLine(leg, quantity, shouldBuy, ratio)];

            case 'call spread':
            case 'put spread':
                return this.generateSpreadLines(leg, quantity, shouldBuy, ratio);

            case 'straddle':
            case 'strangle':
                return this.generateStraddleLines(leg, quantity, shouldBuy, ratio);


            case 'fence':
                return this.generateFenceLines(leg, quantity, shouldBuy, ratio);

            case 'call fly':
            case 'put fly':
                return this.generateButterflyLines(leg, quantity, shouldBuy, ratio);

            default:
                return [`// Unknown leg type: ${leg.type}`];
        }
    }

    /**
     * Generate line for single option
     */
    generateSingleOptionLine(leg, quantity, shouldBuy, ratio) {
        const action = shouldBuy ? 'Buys' : 'Sells';
        const prep = shouldBuy ? 'for' : 'at';
        const optionType = leg.type.toLowerCase();
        const strike = leg.strikes[0] || 0;
        const price = leg.prices[0] || 0;
        const adjustedQuantity = Math.round(quantity * ratio);

        return `${action} ${adjustedQuantity} ${leg.expiry} ${strike} ${optionType} ${prep} ${price}`;
    }

    /**
     * Generate lines for spreads
     */
    generateSpreadLines(leg, quantity, shouldBuy, ratio) {
        const lines = [];
        const isCallSpread = leg.type.toLowerCase().includes('call');
        const optionType = isCallSpread ? 'call' : 'put';
        const [strike1, strike2] = leg.strikes;
        const [price1, price2] = leg.prices;
        const quantity2 = (quantity * ratio);

        if (shouldBuy) {
            lines.push(`Buys ${quantity} ${leg.expiry} ${strike1} ${optionType} for ${price1}`);
            lines.push(`Sells ${quantity2} ${leg.expiry} ${strike2} ${optionType} at ${price2}`);
        } else {
            lines.push(`Sells ${quantity} ${leg.expiry} ${strike1} ${optionType} at ${price1}`);
            lines.push(`Buys ${quantity2} ${leg.expiry} ${strike2} ${optionType} for ${price2}`);
        }

        return lines;
    }

    /**
     * Generate lines for straddle (same strike, put + call)
     */
    generateStraddleLines(leg, quantity, shouldBuy, ratio) {
        const lines = [];
        const action = shouldBuy ? 'Buys' : 'Sells';
        const prep = shouldBuy ? 'for' : 'at';
        const strike = leg.strikes[0];
        const [putPrice, callPrice] = leg.prices;
        const quantity2 = (quantity * ratio);

        lines.push(`${action} ${quantity} ${leg.expiry} ${strike} put ${prep} ${putPrice}`);
        lines.push(`${action} ${quantity2} ${leg.expiry} ${strike} call ${prep} ${callPrice}`);

        return lines;
    }

    /**
     * Generate lines for strangle (different strikes, put + call)
     */


    /**
     * Generate lines for ratio spreads (1x2, 1x3, etc.)
     */


    /**
     * Generate lines for fence (protective collar)
     */
    generateFenceLines(leg, quantity, shouldBuy, ratio = 1) {
        const lines = [];
        const [putStrike, callStrike] = leg.strikes;
        const [putPrice, callPrice] = leg.prices;
        const quantity2 = (quantity * ratio);

        if (shouldBuy) {
            lines.push(`Buys ${quantity} ${leg.expiry} ${putStrike} put for ${putPrice}`);
            lines.push(`Sells ${quantity2} ${leg.expiry} ${callStrike} call at ${callPrice}`);
        } else {
            lines.push(`Sells ${quantity} ${leg.expiry} ${putStrike} put at ${putPrice}`);
            lines.push(`Buys ${quantity2} ${leg.expiry} ${callStrike} call for ${callPrice}`);
        }

        return lines;
    }




    /**
     * Generate lines for butterfly spreads
     */
    generateButterflyLines(leg, quantity, shouldBuy, ratio = 1) {
        const lines = [];
        const isCall = leg.type.toLowerCase().includes('call');
        const optionType = isCall ? 'call' : 'put';
        const [strike1, strike2, strike3] = leg.strikes;
        const [price1, price2, price3] = leg.prices;
        const middleQuantity = Math.round(quantity * 2 * ratio);

        if (shouldBuy) {
            lines.push(`Buys ${quantity} ${leg.expiry} ${strike1} ${optionType} for ${price1}`);
            lines.push(`Sells ${middleQuantity} ${leg.expiry} ${strike2} ${optionType} at ${price2}`);
            lines.push(`Buys ${quantity} ${leg.expiry} ${strike3} ${optionType} for ${price3}`);
        } else {
            lines.push(`Sells ${quantity} ${leg.expiry} ${strike1} ${optionType} at ${price1}`);
            lines.push(`Buys ${middleQuantity} ${leg.expiry} ${strike2} ${optionType} for ${price2}`);
            lines.push(`Sells ${quantity} ${leg.expiry} ${strike3} ${optionType} at ${price3}`);
        }

        return lines;
    }

    /**
     * Generate futures line for hedged trades
     */
    generateFuturesLine(leg, quantity, shouldBuy, type, ratio) {
        if (this.trade.isLive) return null;

        // Use the delta from the leg, or calculate based on underlying and quantity
        const futuresQuantity = this.calculateFuturesQuantity(leg, quantity, ratio);
        //follow COPS- call = opposite, put = same direction
        const action = shouldBuy ? (type.toLowerCase().includes('call') ? 'Sells' : 'Buys') : (type.toLowerCase().includes('call') ? 'Buys' : 'Sells');

        return `${action} ${futuresQuantity} ${leg.expiry} ${leg.underlying} Futures`;
    }

    /**
     * Calculate futures quantity - you can customize this logic
     */
    calculateFuturesQuantity(leg, optionQuantity, ratio) {
        // If delta is provided, use it
        if (leg.delta && leg.delta !== 0) {
            return (optionQuantity * ratio * Math.abs(leg.delta) / 100);
        }

        // Simple fallback - you can adjust this logic as needed

        return Math.round(optionQuantity * ratio * 0.4); // Default approximation
    }

    /**
     * Parse ratio string (e.g., "1x2" -> 2)
     */
    parseRatio(ratioString, legNumber) {
        if (!ratioString) return 1;
        const parts = ratioString.split('x');
        if (legNumber === 1) {
            return parseFloat(parts[0]) || 1;
        } else if (legNumber === 2) {
            return parts.length > 1 ? parseFloat(parts[1]) || 1 : 1;
        }
    }
}



export default TradeConfirmer;