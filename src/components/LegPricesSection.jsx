import React from 'react';
const LegPricesSection = ({ strikes, legPrices, setLegPrices }) => (
    <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Leg Prices</h3>
        {strikes.map((s,i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
                <span>Leg {i+1}</span>
                <input className="flex-1 p-1 border rounded" placeholder="Price" value={legPrices[i]||''} onChange={e=>{ const u=[...legPrices]; u[i]=e.target.value; setLegPrices(u); }} />
            </div>
        ))}
    </div>
);
export default LegPricesSection;