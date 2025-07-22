import React, { useState } from 'react';
import { Copy, FileText, Plus, Trash2 } from 'lucide-react';

const ConfirmGenerator = () => {
    const [tradeInput, setTradeInput] = useState('');
    const [parsedTrade, setParsedTrade] = useState(null);
    const [buyers, setBuyers] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [legPrices, setLegPrices] = useState([]);
    const [output, setOutput] = useState('');

    const parseTradeInput = (input) => {
        const trimmed = input.trim();

        // Extract basic pattern: SYMBOL EXPIRY STRUCTURE X PRICE dDAYS
        const basicPattern = /^([A-Z]\d{2})\s+(.+?)\s+[Xx]\s+([\d.]+)\s+d(\d+)/;
        const match = trimmed.match(basicPattern);

        if (!match) return null;

        const [, symbol, structure, price, days] = match;

        // Parse structure to identify strategy type and strikes
        let strategyType = '';
        let strikes = [];

        if (structure.includes('/') && structure.includes('CS')) {
            strategyType = 'Call Spread';
            const strikeMatch = structure.match(/(\d+)\/(\d+)\s+CS/);
            if (strikeMatch) strikes = [strikeMatch[1], strikeMatch[2]];
        } else if (structure.includes('Fence')) {
            strategyType = 'Fence';
            const strikeMatch = structure.match(/(\d+)\/(\d+)\s+Fence/);
            if (strikeMatch) strikes = [strikeMatch[1], strikeMatch[2]];
        } else if (structure.includes('PutFly')) {
            strategyType = 'Put Fly';
            const strikeMatch = structure.match(/(\d+)\/(\d+)\/(\d+)\s+PutFly/);
            if (strikeMatch) strikes = [strikeMatch[1], strikeMatch[2], strikeMatch[3]];
        } else if (structure.includes('/') && structure.includes('ps')) {
            strategyType = 'Put Spread';
            const strikeMatch = structure.match(/(\d+)\/(\d+)\s+ps/);
            if (strikeMatch) strikes = [strikeMatch[1], strikeMatch[2]];
        } else if (structure.includes('Strangle')) {
            strategyType = 'Strangle';
            const strikeMatch = structure.match(/(\d+)p\/(\d+)c\s+Strangle/);
            if (strikeMatch) strikes = [strikeMatch[1], strikeMatch[2]];
        } else if (structure.includes('Straddle')) {
            strategyType = 'Straddle';
            const strikeMatch = structure.match(/(\d+)\/(\d+)\s+Straddle/);
            if (strikeMatch) strikes = [strikeMatch[1]]; // Straddle uses same strike
        } else if (structure.includes('1x2') && structure.includes('CS')) {
            strategyType = '1x2 Call Spread';
            const strikeMatch = structure.match(/(\d+)\/(\d+)\s+1x2\s+CS/);
            if (strikeMatch) strikes = [strikeMatch[1], strikeMatch[2]];
        } else if (structure.includes('Call')) {
            strategyType = 'Call';
            const strikeMatch = structure.match(/(\d+)\s+Call/);
            if (strikeMatch) strikes = [strikeMatch[1]];
        }

        return {
            symbol,
            structure,
            strategyType,
            strikes,
            price: parseFloat(price),
            days: parseInt(days)
        };
    };

    const handleParse = () => {
        const parsed = parseTradeInput(tradeInput);
        if (parsed) {
            setParsedTrade(parsed);
            setBuyers([]);
            setSellers([]);
            setLegPrices(parsed.strikes.map(() => ''));
        } else {
            alert('Unable to parse trade input. Please check the format.');
        }
    };

    const addBuyer = () => setBuyers([...buyers, { name: '', quantity: 100 }]);
    const addSeller = () => setSellers([...sellers, { name: '', quantity: 100 }]);

    const removeBuyer = (index) => setBuyers(buyers.filter((_, i) => i !== index));
    const removeSeller = (index) => setSellers(sellers.filter((_, i) => i !== index));

    const updateBuyer = (index, field, value) => {
        const updated = [...buyers];
        updated[index][field] = value;
        setBuyers(updated);
    };

    const updateSeller = (index, field, value) => {
        const updated = [...sellers];
        updated[index][field] = value;
        setSellers(updated);
    };

    const generateConfirmations = () => {
        if (!parsedTrade) return;

        let confirmations = [];

        // Generate buyer confirmations (fill empty ones with placeholders)
        buyers.forEach((buyer, index) => {
            const buyerName = buyer.name.trim() || `BUYER_${index + 1}`;
            const quantity = buyer.quantity || 100;
            confirmations.push(`BUYER (${quantity}X): ${buyerName.toUpperCase()}\n`);
            confirmations.push(generateTradeLines(parsedTrade, quantity, 'BUY'));
        });

        // Generate seller confirmations (fill empty ones with placeholders)
        sellers.forEach((seller, index) => {
            const sellerName = seller.name.trim() || `SELLER_${index + 1}`;
            const quantity = seller.quantity || 100;
            confirmations.push(`${buyers.length > 0 ? '\n' : ''}SELLER (${quantity}X): ${sellerName.toUpperCase()}\n`);
            confirmations.push(generateTradeLines(parsedTrade, quantity, 'SELL'));
        });

        // If no buyers or sellers at all, generate basic structure
        if (buyers.length === 0 && sellers.length === 0) {
            confirmations.push('BUYER (100X): BUYER_1\n');
            confirmations.push(generateTradeLines(parsedTrade, 100, 'BUY'));
            confirmations.push('\nSELLER (100X): SELLER_1\n');
            confirmations.push(generateTradeLines(parsedTrade, 100, 'SELL'));
        }

        setOutput(confirmations.join(''));
    };

    const generateTradeLines = (trade, quantity, side) => {
        const lines = [];
        const isBuy = side === 'BUY';

        switch (trade.strategyType) {
            case 'Call Spread':
                lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]}c for ${legPrices[0] || 'X.XX'}`);
                lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity} ${trade.symbol} ${trade.strikes[1]}c at ${legPrices[1] || 'X.XX'}`);
                lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${Math.round(quantity * trade.days / 100)} ${trade.symbol} ${trade.price} Futures`);
                break;

            case 'Fence':
                lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]} put for ${legPrices[0] || 'X.XX'}`);
                lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity} ${trade.symbol} ${trade.strikes[1]} call at ${legPrices[1] || 'X.XX'}`);
                lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${Math.round(quantity * trade.days / 100)} ${trade.symbol} ${trade.price} Futures`);
                break;

            case 'Put Fly':
                lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]} put for ${legPrices[0] || 'X.XX'}`);
                lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[2]} put for ${legPrices[2] || 'X.XX'}`);
                lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity * 2} ${trade.symbol} ${trade.strikes[1]} put for ${legPrices[1] || 'X.XX'}`);
                lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${Math.round(quantity * trade.days / 100)} ${trade.symbol} ${trade.price} futures`);
                break;

            case 'Put Spread':
                lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]} put for ${legPrices[0] || 'X.XX'}`);
                lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity} ${trade.symbol} ${trade.strikes[1]} put at ${legPrices[1] || 'X.XX'}`);
                lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${Math.round(quantity * trade.days / 100)} ${trade.symbol} ${trade.price} futures`);
                break;

            case 'Strangle':
                lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]}p for ${legPrices[0] || 'X.XX'}`);
                lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity} ${trade.symbol} ${trade.strikes[1]}c for ${legPrices[1] || 'X.XX'}`);
                lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${Math.round(quantity * trade.days / 100)} ${trade.symbol} ${trade.price} futures`);
                break;

            case 'Straddle':
                lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]} put for ${legPrices[0] || 'X.XX'}`);
                lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity} ${trade.symbol} ${trade.strikes[0]} call at ${legPrices[1] || 'X.XX'}`);
                break;

            case '1x2 Call Spread':
                lines.push(`${isBuy ? 'BUYS' : 'SELLS'} ${quantity} ${trade.symbol} ${trade.strikes[0]} call for ${legPrices[0] || 'X.XX'}`);
                lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${quantity * 2} ${trade.symbol} ${trade.strikes[1]} call at ${legPrices[1] || 'X.XX'}`);
                lines.push(`${isBuy ? 'SELLS' : 'BUYS'} ${Math.round(quantity * trade.days / 100)} ${trade.symbol} ${trade.price} futures`);
                break;

            default:
                lines.push(`// Strategy not fully implemented: ${trade.strategyType}`);
        }

        return lines.map(line => line + '\n').join('');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="text-blue-600" />
                Eclipse Trade Confirmation Generator
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trade Input (paste the main trade line)
                        </label>
                        <textarea
                            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={tradeInput}
                            onChange={(e) => setTradeInput(e.target.value)}
                            placeholder="e.g., X25 70/80 CS x 64.50 d40 TRADES (1.26/1.30)"
                        />
                        <button
                            onClick={handleParse}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Parse Trade
                        </button>
                    </div>

                    {parsedTrade && (
                        <div className="bg-gray-50 p-4 rounded-md">
                            <h3 className="font-semibold text-gray-800 mb-3">Trade Details (Editable)</h3>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Symbol</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            value={parsedTrade.symbol}
                                            onChange={(e) => setParsedTrade({...parsedTrade, symbol: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Strategy Type</label>
                                        <select
                                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            value={parsedTrade.strategyType}
                                            onChange={(e) => setParsedTrade({...parsedTrade, strategyType: e.target.value})}
                                        >
                                            <option value="Call Spread">Call Spread</option>
                                            <option value="Put Spread">Put Spread</option>
                                            <option value="Fence">Fence</option>
                                            <option value="Put Fly">Put Fly</option>
                                            <option value="Strangle">Strangle</option>
                                            <option value="Straddle">Straddle</option>
                                            <option value="1x2 Call Spread">1x2 Call Spread</option>
                                            <option value="Call">Call</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Strikes (comma-separated)</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        value={parsedTrade.strikes.join(', ')}
                                        onChange={(e) => setParsedTrade({...parsedTrade, strikes: e.target.value.split(',').map(s => s.trim())})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Reference Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            value={parsedTrade.price}
                                            onChange={(e) => setParsedTrade({...parsedTrade, price: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Delta</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            value={parsedTrade.days}
                                            onChange={(e) => setParsedTrade({...parsedTrade, days: parseInt(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {parsedTrade && (
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Leg Prices (Optional)</h3>
                            <div className="space-y-2">
                                {parsedTrade.strikes.map((strike, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-sm w-16">Leg {index + 1}:</span>
                                        <input
                                            type="text"
                                            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            placeholder={`Price for ${strike} strike`}
                                            value={legPrices[index] || ''}
                                            onChange={(e) => {
                                                const updated = [...legPrices];
                                                updated[index] = e.target.value;
                                                setLegPrices(updated);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Counterparties Section */}
                <div className="space-y-4">
                    {parsedTrade && (
                        <>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-800">Buyers</h3>
                                    <button
                                        onClick={addBuyer}
                                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                    >
                                        <Plus size={16} /> Add Buyer
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {buyers.map((buyer, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Buyer name"
                                                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                value={buyer.name}
                                                onChange={(e) => updateBuyer(index, 'name', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                value={buyer.quantity}
                                                onChange={(e) => updateBuyer(index, 'quantity', parseInt(e.target.value))}
                                            />
                                            <button
                                                onClick={() => removeBuyer(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-800">Sellers</h3>
                                    <button
                                        onClick={addSeller}
                                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                                    >
                                        <Plus size={16} /> Add Seller
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {sellers.map((seller, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                placeholder="Seller name"
                                                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                value={seller.name}
                                                onChange={(e) => updateSeller(index, 'name', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                value={seller.quantity}
                                                onChange={(e) => updateSeller(index, 'quantity', parseInt(e.target.value))}
                                            />
                                            <button
                                                onClick={() => removeSeller(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={generateConfirmations}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold"
                            >
                                Generate Confirmations
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Output Section */}
            {output && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">Generated Confirmations</h3>
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                        >
                            <Copy size={16} /> Copy
                        </button>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded-md border text-sm whitespace-pre-wrap font-mono overflow-x-auto">
            {output}
          </pre>
                </div>
            )}
        </div>
    );
};

export default ConfirmGenerator;