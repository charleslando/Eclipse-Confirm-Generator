// import React from 'react';
// import {calculatePrice} from "../utils/TradeCreator.js";
//
// const LegPricesSection = ({ leg, setLeg, trade, ratio}) => {
//
//     const updateLegField = (field, value) => {
//         setLeg({...leg, [field]: value
//         });
//     };
//
//     const updateStrikePrice = (index, price) => {
//         const newPrices = [...(leg.prices || [])];
//         while (newPrices.length < leg.strikes.length) {
//             newPrices.push('');
//         }
//
//         // Only parse to float when the input is complete
//         const isValidNumber = !isNaN(price) && price !== '';
//         newPrices[index] = isValidNumber ? price : price;
//
//         updateLegField('prices', newPrices);
//     };
//
//
//     return (
//         <div className="bg-gray-50 p-4 rounded">
//             <h3 className="font-semibold mb-2">{leg.type.toUpperCase()} LEG</h3>
//             <div>
//                 <h4 className="font-semibold mb-2">Strikes</h4>
//                 {(leg.strikes || []).map((strike, i) => (
//                     <div key={`leg-${i}`} className="flex items-center gap-2 mb-2">
//                         <span className="w-16 text-sm">{leg.expiry}</span>
//                         <span className="w-16 text-sm text-gray-600">{strike}</span>
//                         <input
//                             className="flex-1 p-1 border rounded"
//                             placeholder="Price"
//                             type="number"
//                             value={(leg.prices && leg.prices[i]) || ''}
//                             onChange={e => updateStrikePrice(i, e.target.value)}
//                         />
//                         {ratio !== '1' && (
//                             <span className="w-16 text-sm text-gray-500">
//                                 (x{ratio})
//                             </span>
//                         )}
//                     </div>
//                 ))}
//             </div>
//             <div className="mt-4">
//                 <h1 className="font-semibold mb-2 text-sm">Trade Price</h1>
//                 <div className="w-full p-2 border rounded bg-gray-50 text-sm font-mono">
//                     {Math.abs(calculatePrice(trade, leg)).toFixed(4)}
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default LegPricesSection;



import React from 'react';
import {calculatePrice} from "../utils/TradeCreator.js";

const LegPricesSection = ({ leg, setLeg, trade, ratio}) => {

    const updateLegField = (field, value) => {
        setLeg({...leg, [field]: value});
    };

    // Helper function to check if a price is valid and finite
    const isValidPrice = (price) => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return typeof num === 'number' && Number.isFinite(num) && num !== 0;
    };

    const getTotalFilledPrices = () => {
        let total = 0;
        if (trade.leg1?.prices) {
            total += trade.leg1.prices.filter(price => isValidPrice(price)).length;
        }
        if (trade.leg2?.prices) {
            total += trade.leg2.prices.filter(price => isValidPrice(price)).length;
        }
        return total;
    };

    // Helper function to get total required prices
    const getTotalRequiredPrices = () => {
        let total = 0;
        if (trade.leg1?.strikes) {
            total += trade.leg1.strikes.length;
        }
        if (trade.leg2?.strikes) {
            total += trade.leg2.strikes.length;
        }
        return total;
    };

    // Calculate what the missing price should be based on trade price
    const calculateMissingPrice = () => {
        if (!trade.price || trade.price === 0) return null;

        const totalRequired = getTotalRequiredPrices();
        const totalFilled = getTotalFilledPrices();

        // Only auto-fill if we're missing exactly one price
        if (totalFilled !== totalRequired - 1) return null;

        // Calculate current total from all filled prices
        let currentTotal = 0;

        if (trade.leg1?.prices && trade.leg1?.strikes) {
            const ratio1 = parseFloat((trade.ratio?.split('x')[0]) || '1');
            for (let i = 0; i < trade.leg1.strikes.length; i++) {
                const price = trade.leg1.prices[i];
                if (isValidPrice(price)) {
                    currentTotal += parseFloat(price) * ratio1;
                }
            }
        }

        if (trade.leg2?.prices && trade.leg2?.strikes) {
            const ratio2 = parseFloat((trade.ratio?.split('x')[1]) || '1');
            for (let i = 0; i < trade.leg2.strikes.length; i++) {
                const price = trade.leg2.prices[i];
                if (isValidPrice(price)) {
                    // Subtract leg2 prices (assuming leg2 is sold in spread strategies)
                    currentTotal -= parseFloat(price) * ratio2;
                }
            }
        }

        // Calculate what the missing price should be
        const currentRatio = parseFloat(ratio || '1');
        const isLeg2 = leg === trade.leg2;
        const targetTotal = parseFloat(trade.price);

        if (isLeg2) {
            // For leg2, we subtract, so: currentTotal - (missingPrice * ratio) = targetTotal
            // Therefore: missingPrice = (currentTotal - targetTotal) / ratio
            return (currentTotal - targetTotal) / currentRatio;
        } else {
            // For leg1, we add, so: currentTotal + (missingPrice * ratio) = targetTotal
            // Therefore: missingPrice = (targetTotal - currentTotal) / ratio
            return (targetTotal - currentTotal) / currentRatio;
        }
    };

    const updateStrikePrice = (index, price) => {
        const newPrices = [...(leg.prices || [])];
        while (newPrices.length < leg.strikes.length) {
            newPrices.push('');
        }

        // Parse the input value
        const isValidNumber = !isNaN(price) && price !== '';
        newPrices[index] = isValidNumber ? parseFloat(price) : price;

        updateLegField('prices', newPrices);

        // Check if we should auto-fill the missing price
        setTimeout(() => {
            const totalRequired = getTotalRequiredPrices();
            const totalFilled = getTotalFilledPrices();

            if (totalFilled === totalRequired - 1 && trade.price && trade.price !== 0) {
                const missingPrice = calculateMissingPrice();
                if (missingPrice !== null && !isNaN(missingPrice)) {
                    // Find which leg and index needs to be filled
                    if (trade.leg1 && trade.leg1.prices) {
                        for (let i = 0; i < trade.leg1.strikes.length; i++) {
                            if (!isValidPrice(trade.leg1.prices[i])) {
                                if (trade.leg1 === leg) {
                                    const updatedPrices = [...newPrices];
                                    updatedPrices[i] = parseFloat(missingPrice.toFixed(4));
                                    updateLegField('prices', updatedPrices);
                                }
                                return;
                            }
                        }
                    }

                    if (trade.leg2 && trade.leg2.prices) {
                        for (let i = 0; i < trade.leg2.strikes.length; i++) {
                            if (!isValidPrice(trade.leg2.prices[i])) {
                                if (trade.leg2 === leg) {
                                    const updatedPrices = [...newPrices];
                                    updatedPrices[i] = parseFloat(missingPrice.toFixed(4));
                                    updateLegField('prices', updatedPrices);
                                }
                                return;
                            }
                        }
                    }
                }
            }
        }, 0);
    };

    return (
        <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">{leg.type.toUpperCase()} LEG</h3>
            <div>
                <h4 className="font-semibold mb-2">Strikes</h4>
                {(leg.strikes || []).map((strike, i) => {
                    const totalRequired = getTotalRequiredPrices();
                    const totalFilled = getTotalFilledPrices();
                    const isLastEmpty = totalFilled === totalRequired - 1 &&
                        !isValidPrice(leg.prices?.[i]) &&
                        trade.price && trade.price !== 0;

                    return (
                        <div key={`leg-${i}`} className="flex items-center gap-2 mb-2">
                            <span className="w-16 text-sm">{leg.expiry}</span>
                            <span className="w-16 text-sm text-gray-600">{strike}</span>
                            <div className="flex-1 relative">
                                <input
                                    className={`w-full p-1 border rounded ${isLastEmpty ? 'bg-blue-50 border-blue-300' : ''}`}
                                    placeholder={isLastEmpty ? "Auto-filling..." : "Price"}
                                    type="number"
                                    step="0.0001"
                                    value={(leg.prices && leg.prices[i]) || ''}
                                    onChange={e => updateStrikePrice(i, e.target.value)}
                                />
                                {isLastEmpty && (
                                    <span className="absolute right-2 top-1 text-xs text-blue-600">
                                        ✨
                                    </span>
                                )}
                            </div>
                            {ratio !== '1' && (
                                <span className="w-16 text-sm text-gray-500">
                                    (x{ratio})
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="mt-4">
                <h1 className="font-semibold mb-2 text-sm">Trade Price</h1>
                <div className="w-full p-2 border rounded bg-gray-50 text-sm font-mono">
                    {Math.abs(calculatePrice(trade, leg)).toFixed(4)}
                </div>
            </div>

            {/* Auto-fill status indicator */}
            {trade.price && trade.price !== 0 && (
                <div className="mt-2 text-xs text-gray-500">
                    {(() => {
                        const totalRequired = getTotalRequiredPrices();
                        const totalFilled = getTotalFilledPrices();
                        const remaining = totalRequired - totalFilled;

                        if (remaining === 1) {
                            return "🔮 Ready to auto-fill last price";
                        } else if (remaining === 0) {
                            return "✅ All prices entered";
                        } else {
                            return `⏳ ${remaining} prices remaining`;
                        }
                    })()}
                </div>
            )}
        </div>
    );
};

export default LegPricesSection;