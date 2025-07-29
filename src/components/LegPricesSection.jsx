import React from 'react';
const LegPricesSection = ({ parsedTrade, legPrices, setLegPrices, timeStamp, setTimestamp }) => (
    <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Leg Prices</h3>
        {parsedTrade.strikes.map((s,i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
                <span>Leg {i+1}</span>
                <input className="flex-1 p-1 border rounded" placeholder="Price" value={legPrices[i]||''} onChange={e=>{ const u=[...legPrices]; u[i]=e.target.value; setLegPrices(u); }} />
            </div>
        ))}


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
export default LegPricesSection;