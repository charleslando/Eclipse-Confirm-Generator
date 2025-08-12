import React from "react";
import { startCase } from "lodash";
import {STRAT_STRIKE_MAP} from "../utils/parseTradeInput.js";

const TradeDetailsPanel = ({
                               leg,
                               setLeg,
                               trade,

                           }) => {

    const updateLegField = (field, value) => {
        setLeg({...leg, [field]: value
        });
    };

    const updateLegType = (newType) => {
        // Create a new leg object and use its updateType method
        //const updatedLeg = { ...leg };

        // Manually implement the type update logic since we're working with plain objects
        const requiredStrikes = STRAT_STRIKE_MAP[newType] || 1;
        const currentStrikes = leg.strikes || [];
        const currentPrices = leg.prices || [];

        // Create new arrays with proper length
        const newStrikes = new Array(requiredStrikes).fill(0);
        const newPrices = new Array(requiredStrikes).fill(0);

        // Copy existing values up to the minimum of old and new lengths
        const copyLength = Math.min(currentStrikes.length, requiredStrikes);
        for (let i = 0; i < copyLength; i++) {
            newStrikes[i] = currentStrikes[i];
            newPrices[i] = currentPrices[i];
        }

        // Update the leg with new type, strikes, and prices
        setLeg({
            ...leg,
            type: newType,
            strikes: newStrikes,
            prices: newPrices
        });
    };

    const updateStrike = (index, value) => {
        const newStrikes = [...leg.strikes];
        newStrikes[index] = value; // Store as string, don't parse immediately
        updateLegField('strikes', newStrikes);
    };

    const handleStrikeBlur = (index, value) => {
        const newStrikes = [...leg.strikes];
        newStrikes[index] = parseFloat(value) || 0; // Parse only on blur
        updateLegField('strikes', newStrikes);
    };

    const handleDeltaBlur = (value) => {
        updateLegField('delta', parseInt(value, 10) || 0);
    };

    const handleUnderlyingBlur = (value) => {
        updateLegField('underlying', parseFloat(value) || 0);
    };

    const color = leg.isBuy? "green":"red";
    const title = leg.isBuy ? 'Buy' : 'Sell';

    return (

        <div className={`bg-${color}-100 p-4 rounded border ${color === 'red' ? 'text-red-950' : 'text-green-950'}`}>
            <h4 className="font-semibold mb-3 text-center">{title}</h4>
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={leg.type}
                        onChange={e => updateLegType(e.target.value)}
                    >
                        {Object.keys(STRAT_STRIKE_MAP).map(type => (
                            <option key={type} value={type}>{startCase(type)}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Expiry</label>
                    <input
                        className="w-full p-2 border rounded"
                        value={leg.expiry}
                        onChange={e => updateLegField('expiry', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Strikes</label>
                    <div className="space-y-2">
                        {leg.strikes.map((strike, index) => (
                            <div key={index}>
                                <label className="block text-xs text-gray-600 mb-1">
                                    Strike {index + 1}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                    value={strike}
                                    onChange={e => updateStrike(index, e.target.value)}
                                    onBlur={e => handleStrikeBlur(index, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {trade && !trade.isLive && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Delta</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={leg.delta}
                                onChange={e => updateLegField('delta', e.target.value)}
                                onBlur={e => handleDeltaBlur(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Underlying</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full p-2 border rounded"
                                value={leg.underlying}
                                onChange={e => updateLegField('underlying', e.target.value)}
                                onBlur={e => handleUnderlyingBlur(e.target.value)}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TradeDetailsPanel;