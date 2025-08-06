import React from "react";

const TradeDetailsPanel = ({
                               title,
                               leg,
                               setLeg,
                               trade,

                           }) => {

    const updateLegField = (field, value) => {
        setLeg({...leg, [field]: value
        });
    };

    return (
        <div className="bg-gray-50 p-4 rounded border">
            <h4 className="font-semibold mb-3 text-center">{title}</h4>
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={leg?.type || ''}
                        onChange={e => updateLegField('type', e.target.value)}
                    >
                        <option value="call">Call</option>
                        <option value="put">Put</option>
                        <option value="call spread">Call Spread</option>
                        <option value="put spread">Put Spread</option>
                        <option value="straddle">Straddle</option>
                        <option value="strangle">Strangle</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Expiry</label>
                    <input
                        className="w-full p-2 border rounded"
                        value={leg?.expiry || ''}
                        onChange={e => updateLegField('expiry', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Strikes</label>
                    <input
                        className="w-full p-2 border rounded"
                        value={(leg.strikes).join(', ')}
                        onChange={e => updateLegField('strikes',
                            e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        )}
                        placeholder="Enter strikes separated by commas"
                    />
                </div>

                {trade && !trade.isLive && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Delta</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={leg?.delta || ''}
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
                                value={leg?.underlying || ''}
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















































// import React from "react";
// import { STRATEGY_CONFIGS } from "../utils/parseTradeInput.js";
//
// const TradeDetailsPanel = ({
//                                title,
//                                parsedTrade,
//                                setParsedTrade,
//                                isSecondary = false,
//                            }) => {
//     const expiryKey = isSecondary ? 'expiry2' : 'expiry';
//     const strikesKey = isSecondary ? 'strikes2' : 'strikes';
//     const deltaKey = isSecondary ? 'delta2' : 'delta';
//     const underlyingKey = isSecondary ? 'underlying2' : 'underlying';
//
//     return (
//         <div className="bg-gray-50 p-4 rounded border">
//             <h4 className="font-semibold mb-3 text-center">{title}</h4>
//             <div className="space-y-3">
//                 <div>
//
//                     <label className="block text-sm font-medium mb-1">Expiry</label>
//                     <input
//                         className="w-full p-2 border rounded"
//                         value={parsedTrade[expiryKey] || ''}
//                         onChange={e => setParsedTrade({
//                             ...parsedTrade,
//                             [expiryKey]: e.target.value
//                         })}
//                     />
//                 </div>
//
//                 <div>
//                     <label className="block text-sm font-medium mb-1">Strikes</label>
//                     <input
//                         className="w-full p-2 border rounded"
//                         value={(parsedTrade[strikesKey] || []).join(', ')}
//                         onChange={e => setParsedTrade({
//                             ...parsedTrade,
//                             [strikesKey]: e.target.value.split(',').map(s => s.trim()).filter(s => s)
//                         })}
//                     />
//                 </div>
//
//
//
//                 {!parsedTrade.isLive && (
//                     <>
//                         <div>
//                             <label className="block text-sm font-medium mb-1">Delta</label>
//                             <input
//                                 type="number"
//                                 className="w-full p-2 border rounded"
//                                 value={parsedTrade[deltaKey] || ''}
//                                 onChange={e => setParsedTrade({
//                                     ...parsedTrade,
//                                     [deltaKey]: parseInt(e.target.value, 10) || 0
//                                 })}
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium mb-1">Underlying</label>
//                             <input
//                                 type="number"
//                                 className="w-full p-2 border rounded"
//                                 value={parsedTrade[underlyingKey] || ''}
//                                 onChange={e => setParsedTrade({
//                                     ...parsedTrade,
//                                     [underlyingKey]: parseFloat(e.target.value) || 0
//                                 })}
//                             />
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };
// export default TradeDetailsPanel;

































