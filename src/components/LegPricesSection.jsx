import React from 'react';

const LegPricesSection = ({ leg, setLeg, trade}) => {

    const updateLegField = (field, value) => {
        setLeg({...leg, [field]: value
        });
    };

    return (
        <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Leg Prices</h3>
                <div>
                    <h4 className="font-semibold mb-2">Leg Strikes</h4>
                    {(leg.strikes || []).map((strike, i) => (
                        <div key={`leg1-${i}`} className="flex items-center gap-2 mb-2">
                            <span className="w-16 text-sm">{trade.leg1.expiry}</span>
                            <span className="w-16 text-sm text-gray-600">{strike}</span>
                            <input
                                className="flex-1 p-1 border rounded"
                                placeholder="Price"
                                type="number"
                                step="0.01"
                                value={0}
                                onChange={e => updateLegField('price', e.target.value)}
                            />
                        </div>
                    ))}
                </div>

        </div>
    );
};

export default LegPricesSection;
















// const updateLegPrice = (legNumber, strikeIndex, value) => {
//     const newTrade = new trade.constructor(''); // Create new Trade instance
//
//     // Copy all properties from current trade
//     Object.assign(newTrade, trade);
//
//     // Deep copy legs to avoid mutation
//     if (trade.leg1) {
//         newTrade.leg1 = { ...trade.leg1, strikes: [...trade.leg1.strikes] };
//     }
//     if (trade.leg2) {
//         newTrade.leg2 = { ...trade.leg2, strikes: [...trade.leg2.strikes] };
//     }
//
//     // Update the specific leg's price at the strike index
//     if (legNumber === 1 && newTrade.leg1) {
//         if (!newTrade.leg1.prices) newTrade.leg1.prices = [];
//         newTrade.leg1.prices[strikeIndex] = value;
//     } else if (legNumber === 2 && newTrade.leg2) {
//         if (!newTrade.leg2.prices) newTrade.leg2.prices = [];
//         newTrade.leg2.prices[strikeIndex] = value;
//     }
//
//     setTrade(newTrade);
// };
//
// const getLegPrice = (legNumber, strikeIndex) => {
//     if (legNumber === 1 && trade.leg1?.prices) {
//         return trade.leg1.prices[strikeIndex] || '';
//     } else if (legNumber === 2 && trade.leg2?.prices) {
//         return trade.leg2.prices[strikeIndex] || '';
//     }
//     return '';
// };
//
// const getLegLabel = (legIndex, strikeIndex) => {
//     if (trade.leg2) {
//         return legIndex === 0 ? `Leg 1-${strikeIndex + 1}` : `Leg 2-${strikeIndex + 1}`;
//     }
//     return `Leg ${strikeIndex + 1}`;
// };
//
// const getAllPrices = () => {
//     const allPrices = [];
//
//     // Get prices from leg1
//     if (trade.leg1?.strikes) {
//         trade.leg1.strikes.forEach((_, i) => {
//             const price = getLegPrice(1, i);
//             if (price) allPrices.push(parseFloat(price) || 0);
//         });
//     }
//
//     // Get prices from leg2
//     if (trade.leg2?.strikes) {
//         trade.leg2.strikes.forEach((_, i) => {
//             const price = getLegPrice(2, i);
//             if (price) allPrices.push(parseFloat(price) || 0);
//         });
//     }
//
//     return allPrices;
// };
// const allPrices = getAllPrices();