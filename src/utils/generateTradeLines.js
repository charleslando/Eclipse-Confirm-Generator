export function generateTradeLines(trade, quantity, side, legPrices) {
    const isBuy = side === 'BUY';
    const lines = [];
    switch (trade.strategyType) {
        case 'Call Spread':
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]}c for ${legPrices[0] || 'X.XX'}`);
            lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity} ${trade.symbol} ${trade.strikes[1]}c at ${legPrices[1] || 'X.XX'}`);
            lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${Math.round(quantity * trade.delta / 100)} ${trade.symbol} ${trade.price} Futures`);
            break;

        case 'Fence':
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]} put for ${legPrices[0] || 'X.XX'}`);
            lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity} ${trade.symbol} ${trade.strikes[1]} call at ${legPrices[1] || 'X.XX'}`);
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${Math.round(quantity * trade.delta / 100)} ${trade.symbol} ${trade.price} Futures`);
            break;

        case 'Put Fly':
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]} put for ${legPrices[0] || 'X.XX'}`);
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[2]} put for ${legPrices[2] || 'X.XX'}`);
            lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity * 2} ${trade.symbol} ${trade.strikes[1]} put for ${legPrices[1] || 'X.XX'}`);
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${Math.round(quantity * trade.delta / 100)} ${trade.symbol} ${trade.price} futures`);
            break;
        case 'Call  Fly':
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]} call for ${legPrices[0] || 'X.XX'}`);
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[2]} call for ${legPrices[2] || 'X.XX'}`);
            lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity * 2} ${trade.symbol} ${trade.strikes[1]} call for ${legPrices[1] || 'X.XX'}`);
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${Math.round(quantity * trade.delta / 100)} ${trade.symbol} ${trade.price} futures`);
            break;
        case 'Put Spread':
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]} put for ${legPrices[0] || 'X.XX'}`);
            lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity} ${trade.symbol} ${trade.strikes[1]} put at ${legPrices[1] || 'X.XX'}`);
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${Math.round(quantity * trade.delta / 100)} ${trade.symbol} ${trade.price} futures`);
            break;

        case 'Strangle':
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]}p for ${legPrices[0] || 'X.XX'}`);
            lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity} ${trade.symbol} ${trade.strikes[1]}c for ${legPrices[1] || 'X.XX'}`);
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${Math.round(quantity * trade.delta / 100)} ${trade.symbol} ${trade.price} futures`);
            break;

        case 'Straddle':
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]} put for ${legPrices[0] || 'X.XX'}`);
            lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity} ${trade.symbol} ${trade.strikes[0]} call at ${legPrices[1] || 'X.XX'}`);
            break;

        case '1x2 Call Spread':
            lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]} call for ${legPrices[0] || 'X.XX'}`);
            lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity * 2} ${trade.symbol} ${trade.strikes[1]} call at ${legPrices[1] || 'X.XX'}`);
            lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${Math.round(quantity * trade.delta / 100)} ${trade.symbol} ${trade.price} futures`);
            break;

        default:
            lines.push(`// Strategy not fully implemented: ${trade.strategyType}`);
    }
    return lines.map(l => l + '\n').join('');
}