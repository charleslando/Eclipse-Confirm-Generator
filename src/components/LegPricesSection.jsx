import React from 'react';
const LegPricesSection = ({ parsedTrade, legPrices, setLegPrices, timeStamp, setTimestamp }) => {
    const isDualStructure = parsedTrade?.isDualStructure || false;

    const updateLegPrices = (index, value) => {
        const updatedPrices = [...legPrices];
        updatedPrices[index] = value;
        setLegPrices(updatedPrices);
    }
    return (
        <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Leg Prices</h3>
            {isDualStructure ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Structure 1 Legs */}
                    <div>
                        <h4 className="font-semibold mb-2">Structure 1 Legs</h4>
                        {parsedTrade.strikes.map((strike, i) => (
                            <div key={`struct1-${i}`} className="flex items-center gap-2 mb-2">
                                <span className="w-12">Leg {i + 1}</span>
                                <input
                                    className="flex-1 p-1 border rounded"
                                    placeholder="Price"
                                    value={legPrices[i] || ''}
                                    onChange={e => {
                                        const u = [...legPrices];
                                        u[i] = e.target.value;
                                        setLegPrices(u);
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Structure 2 Legs*/}
                    <div>
                        <h4 className="font-semibold mb-2">Structure 2 Legs</h4>
                        {parsedTrade.strikes2.map((strike, i) => (
                            <div key={`struct2-${i}`} className="flex items-center gap-2 mb-2">
                                <span className="w-12">Leg {i + 1}</span>
                                <input
                                    className="flex-1 p-1 border rounded"
                                    placeholder="Price"
                                    value={legPrices[parsedTrade.strikes2.length + i] || ''}
                                    onChange={e => updateLegPrices(parsedTrade.strikes.length + i, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                </div>
            ) : (
                <div>
                    <h4 className="font-semibold mb-2">Single Structure Legs</h4>
                    {parsedTrade.strikes2.map((strike, i) => (
                        <div key={`single-${i}`} className="flex items-center gap-2 mb-2">
                            <span className="w-12">Leg {i + 1}</span>
                            <input
                                className="flex-1 p-1 border rounded"
                                placeholder="Price"
                                value={legPrices[i] || ''}
                                onChange={e => updateLegPrices(i, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Summary Section */}


            <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                    <span className="font-bold">Total Price:</span>
                    <span>
                {legPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0).toFixed(2)}
            </span>
                </div>

                <div className="flex flex-col">
                    <span className="font-bold">Put/Call Premium:</span>
                    <span>
                {(legPrices.reduce((sum, price) => sum + (parseFloat(price) || 0), 0) / legPrices.length || 0).toFixed(2)}
            </span>
                </div>

                <div className="flex flex-col">
                    <span className="font-bold">Timestamp:</span>
                    <input
                        type="text"
                        className="border rounded p-1"
                        value={timeStamp}
                        onChange={e => setTimestamp(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default LegPricesSection;