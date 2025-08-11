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
                        onChange={e => updateLegField('type', e.target.value)}
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
                    <input
                        className="w-full p-2 border rounded"
                        value={(leg.strikes).join('/')}

                        //i only want to be able to endter numbers and slashes
                        placeholder="Enter numbers separated by slashes (e.g. 3.5/4)"
                        onKeyDown={e => {
                            // Allow control keys
                            if (e.ctrlKey || e.metaKey || e.altKey) return;

                            // Allow navigation and editing keys
                            const allowedKeys = [
                                'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                                'Home', 'End'
                            ];

                            // Check if key is allowed
                            const isAllowed = allowedKeys.includes(e.key) ||
                                /^[0-9/.]$/.test(e.key);

                            if (!isAllowed) {
                                e.preventDefault();
                            }
                        }}
                        onChange={e => updateLegField('strikes',
                            e.target.value
                                .split('/')
                                .map(s => s.trim())
                                .filter(s => s && !isNaN(parseFloat(s)))
                                .map(s => parseFloat(s))
                        )}
                    />
                </div>

                {trade && !trade.isLive && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Delta</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={leg.delta}
                                onChange={e => updateLegField('delta',
                                    parseInt(e.target.value, 10) || 0
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Underlying</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full p-2 border rounded"
                                value={leg.underlying}
                                onChange={e => updateLegField('underlying',
                                    parseFloat(e.target.value) || 0
                                )}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TradeDetailsPanel;
