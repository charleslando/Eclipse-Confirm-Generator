import React from 'react';
import {calculatePrice} from "../utils/TradeCreator.js";

const LegPricesSection = ({ leg, setLeg, trade, ratio}) => {

    const updateLegField = (field, value) => {
        setLeg({...leg, [field]: value
        });
    };

    const updateStrikePrice = (index, price) => {
        const newPrices = [...(leg.prices || [])];
        while (newPrices.length < leg.strikes.length) {
            newPrices.push('');
        }

        // Only parse to float when the input is complete
        const isValidNumber = !isNaN(price) && price !== '';
        newPrices[index] = isValidNumber ? price : price;

        updateLegField('prices', newPrices);
    };


    return (
        <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">{leg.type.toUpperCase()} LEG</h3>
            <div>
                <h4 className="font-semibold mb-2">Strikes</h4>
                {(leg.strikes || []).map((strike, i) => (
                    <div key={`leg-${i}`} className="flex items-center gap-2 mb-2">
                        <span className="w-16 text-sm">{leg.expiry}</span>
                        <span className="w-16 text-sm text-gray-600">{strike}</span>
                        <input
                            className="flex-1 p-1 border rounded"
                            placeholder="Price"
                            type="number"
                            value={(leg.prices && leg.prices[i]) || ''}
                            onChange={e => updateStrikePrice(i, e.target.value)}
                        />
                        <span className="w-16 text-sm text-gray-500">
                            (x{ratio})
                        </span>
                    </div>
                ))}
            </div>
            <div className="mt-4">
                <h1 className="font-semibold mb-2 text-sm">Trade Price</h1>
                <div className="w-full p-2 border rounded bg-gray-50 text-sm font-mono">
                    {Math.abs(calculatePrice(trade, leg))}
                </div>
            </div>
        </div>
    );
};

export default LegPricesSection;