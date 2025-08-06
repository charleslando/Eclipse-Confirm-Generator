import React from 'react';

const LegPricesSection = ({ trade, legPrices, setLegPrices, timeStamp, setTimestamp }) => {
    const isDualStructure = trade?.leg2 !== null && trade?.leg2 !== undefined;

    const updateLegPrices = (index, value) => {
        const updatedPrices = [...legPrices];
        updatedPrices[index] = value;
        setLegPrices(updatedPrices);
    };

    const getLegLabel = (legIndex, strikeIndex) => {
        if (isDualStructure) {
            return legIndex === 0 ? `Leg 1-${strikeIndex + 1}` : `Leg 2-${strikeIndex + 1}`;
        }
        return `Leg ${strikeIndex + 1}`;
    };

    return (
        <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Leg Prices</h3>
            {isDualStructure ? (
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
                                    value={legPrices[i] || ''}
                                    onChange={e => updateLegPrices(i, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Leg 2 Strikes */}
                    <div>
                        <h4 className="font-semibold mb-2">Leg 2 Strikes</h4>
                        {(trade.leg2?.strikes || []).map((strike, i) => {
                            const priceIndex = (trade.leg1?.strikes?.length || 0) + i;
                            return (
                                <div key={`leg2-${i}`} className="flex items-center gap-2 mb-2">
                                    <span className="w-16 text-sm">{getLegLabel(1, i)}</span>
                                    <span className="w-16 text-sm text-gray-600">{strike}</span>
                                    <input
                                        className="flex-1 p-1 border rounded"
                                        placeholder="Price"
                                        type="number"
                                        step="0.01"
                                        value={legPrices[priceIndex] || ''}
                                        onChange={e => updateLegPrices(priceIndex, e.target.value)}
                                    />
                                </div>
                            );
                        })}
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
                                value={legPrices[i] || ''}
                                onChange={e => updateLegPrices(i, e.target.value)}
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
                            {legPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0).toFixed(2)}
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="font-bold text-sm">Average Premium:</span>
                        <span className="text-lg">
                            {legPrices.length > 0
                                ? (legPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0) / legPrices.length).toFixed(2)
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































// import React from 'react';
// const LegPricesSection = ({ parsedTrade, legPrices, setLegPrices, timeStamp, setTimestamp }) => {
//     const isDualStructure = parsedTrade?.isDualStructure || false;
//
//     const updateLegPrices = (index, value) => {
//         const updatedPrices = [...legPrices];
//         updatedPrices[index] = value;
//         setLegPrices(updatedPrices);
//     }
//     return (
//         <div className="bg-gray-50 p-4 rounded">
//             <h3 className="font-semibold mb-2">Leg Prices</h3>
//             {isDualStructure ? (
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                     {/* Structure 1 Legs */}
//                     <div>
//                         <h4 className="font-semibold mb-2">Structure 1 Legs</h4>
//                         {parsedTrade.strikes.map((strike, i) => (
//                             <div key={`struct1-${i}`} className="flex items-center gap-2 mb-2">
//                                 <span className="w-12">Leg {i + 1}</span>
//                                 <input
//                                     className="flex-1 p-1 border rounded"
//                                     placeholder="Price"
//                                     value={legPrices[i] || ''}
//                                     onChange={e => {
//                                         const u = [...legPrices];
//                                         u[i] = e.target.value;
//                                         setLegPrices(u);
//                                     }}
//                                 />
//                             </div>
//                         ))}
//                     </div>
//
//                     {/* Structure 2 Legs*/}
//                     <div>
//                         <h4 className="font-semibold mb-2">Structure 2 Legs</h4>
//                         {parsedTrade.strikes2.map((strike, i) => (
//                             <div key={`struct2-${i}`} className="flex items-center gap-2 mb-2">
//                                 <span className="w-12">Leg {i + 1}</span>
//                                 <input
//                                     className="flex-1 p-1 border rounded"
//                                     placeholder="Price"
//                                     value={legPrices[parsedTrade.strikes2.length + i] || ''}
//                                     onChange={e => updateLegPrices(parsedTrade.strikes.length + i, e.target.value)}
//                                 />
//                             </div>
//                         ))}
//                     </div>
//
//                 </div>
//             ) : (
//                 <div>
//                     <h4 className="font-semibold mb-2">Single Structure Legs</h4>
//                     {parsedTrade.strikes.map((strike, i) => (
//                         <div key={`single-${i}`} className="flex items-center gap-2 mb-2">
//                             <span className="w-12">Leg {i + 1}</span>
//                             <input
//                                 className="flex-1 p-1 border rounded"
//                                 placeholder="Price"
//                                 value={legPrices[i] || ''}
//                                 onChange={e => updateLegPrices(i, e.target.value)}
//                             />
//                         </div>
//                     ))}
//                 </div>
//             )}
//
//             {/* Summary Section */}
//
//
//             <div className="grid grid-cols-3 gap-4">
//                 <div className="flex flex-col">
//                     <span className="font-bold">Total Price:</span>
//                     <span>
//                 {legPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0).toFixed(2)}
//             </span>
//                 </div>
//
//                 <div className="flex flex-col">
//                     <span className="font-bold">Put/Call Premium:</span>
//                     <span>
//                 {(legPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0) / legPrices.length || 0).toFixed(2)}
//             </span>
//                 </div>
//
//                 <div className="flex flex-col">
//                     <span className="font-bold">Timestamp:</span>
//                     <input
//                         type="text"
//                         className="border rounded p-1"
//                         value={timeStamp}
//                         onChange={e => setTimestamp(e.target.value)}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default LegPricesSection;