import React from 'react';

const LegPricesSection = ({ trade, setTrade, timeStamp, setTimestamp }) => {

    const updateLegPrice = (legNumber, strikeIndex, value) => {
        const newTrade = new trade.constructor(''); // Create new Trade instance

        // Copy all properties from current trade
        Object.assign(newTrade, trade);

        // Deep copy legs to avoid mutation
        if (trade.leg1) {
            newTrade.leg1 = { ...trade.leg1, strikes: [...trade.leg1.strikes] };
        }
        if (trade.leg2) {
            newTrade.leg2 = { ...trade.leg2, strikes: [...trade.leg2.strikes] };
        }

        // Update the specific leg's price at the strike index
        if (legNumber === 1 && newTrade.leg1) {
            if (!newTrade.leg1.prices) newTrade.leg1.prices = [];
            newTrade.leg1.prices[strikeIndex] = value;
        } else if (legNumber === 2 && newTrade.leg2) {
            if (!newTrade.leg2.prices) newTrade.leg2.prices = [];
            newTrade.leg2.prices[strikeIndex] = value;
        }

        setTrade(newTrade);
    };

    const getLegPrice = (legNumber, strikeIndex) => {
        if (legNumber === 1 && trade.leg1?.prices) {
            return trade.leg1.prices[strikeIndex] || '';
        } else if (legNumber === 2 && trade.leg2?.prices) {
            return trade.leg2.prices[strikeIndex] || '';
        }
        return '';
    };

    const getLegLabel = (legIndex, strikeIndex) => {
        if (trade.leg2) {
            return legIndex === 0 ? `Leg 1-${strikeIndex + 1}` : `Leg 2-${strikeIndex + 1}`;
        }
        return `Leg ${strikeIndex + 1}`;
    };

    const getAllPrices = () => {
        const allPrices = [];

        // Get prices from leg1
        if (trade.leg1?.strikes) {
            trade.leg1.strikes.forEach((_, i) => {
                const price = getLegPrice(1, i);
                if (price) allPrices.push(parseFloat(price) || 0);
            });
        }

        // Get prices from leg2
        if (trade.leg2?.strikes) {
            trade.leg2.strikes.forEach((_, i) => {
                const price = getLegPrice(2, i);
                if (price) allPrices.push(parseFloat(price) || 0);
            });
        }

        return allPrices;
    };

    const allPrices = getAllPrices();

    return (
        <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Leg Prices</h3>
            {trade.leg2 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Leg 1 Strikes */}
                    <div>
                        <h4 className="font-semibold mb-2">Leg 1 Strikes</h4>
                        {(trade.leg1?.strikes || []).map((strike, i) => (
                            <div key={`leg1-${i}`} className="flex items-center gap-2 mb-2">
                                <span className="w-16 text-sm">{getLegLabel(0, i)}</span>
                                <span className="w-16 text-sm text-gray-600">{strike}</span>
                                <input
                                    className="flex-1 p-1 border rounded"
                                    placeholder="Price"
                                    type="number"
                                    step="0.01"
                                    value={getLegPrice(1, i)}
                                    onChange={e => updateLegPrice(1, i, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Leg 2 Strikes */}
                    <div>
                        <h4 className="font-semibold mb-2">Leg 2 Strikes</h4>
                        {(trade.leg2?.strikes || []).map((strike, i) => (
                            <div key={`leg2-${i}`} className="flex items-center gap-2 mb-2">
                                <span className="w-16 text-sm">{getLegLabel(1, i)}</span>
                                <span className="w-16 text-sm text-gray-600">{strike}</span>
                                <input
                                    className="flex-1 p-1 border rounded"
                                    placeholder="Price"
                                    type="number"
                                    step="0.01"
                                    value={getLegPrice(2, i)}
                                    onChange={e => updateLegPrice(2, i, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    <h4 className="font-semibold mb-2">Single Structure Strikes</h4>
                    {(trade.leg1?.strikes || []).map((strike, i) => (
                        <div key={`single-${i}`} className="flex items-center gap-2 mb-2">
                            <span className="w-16 text-sm">{getLegLabel(0, i)}</span>
                            <span className="w-16 text-sm text-gray-600">{strike}</span>
                            <input
                                className="flex-1 p-1 border rounded"
                                placeholder="Price"
                                type="number"
                                step="0.01"
                                value={getLegPrice(1, i)}
                                onChange={e => updateLegPrice(1, i, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Summary Section */}
            <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-sm">Total Price:</span>
                        <span className="text-lg">
                            {allPrices.reduce((sum, price) => sum + price, 0).toFixed(2)}
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="font-bold text-sm">Average Premium:</span>
                        <span className="text-lg">
                            {allPrices.length > 0
                                ? (allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length).toFixed(2)
                                : '0.00'
                            }
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="font-bold text-sm">Timestamp:</span>
                        <input
                            type="text"
                            className="border rounded p-1 text-sm"
                            value={timeStamp}
                            onChange={e => setTimestamp(e.target.value)}
                            placeholder="HH:MM:SS"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegPricesSection;