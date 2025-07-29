const TradeDetailsPanel = ({
                               title,
                               parsedTrade,
                               setParsedTrade,
                               isSecondary = false,
                               commodity,
                               setCommodity,
                               cleared,
                               setCleared
                           }) => {
    const expiryKey = isSecondary ? 'expiry2' : 'expiry';
    const strikesKey = isSecondary ? 'strikes2' : 'strikes';
    const deltaKey = isSecondary ? 'delta2' : 'delta';
    const underlyingKey = isSecondary ? 'underlying2' : 'underlying';

    return (
        <div className="bg-gray-50 p-4 rounded border">
            <h4 className="font-semibold mb-3 text-center">{title}</h4>
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium mb-1">Expiry</label>
                    <input
                        className="w-full p-2 border rounded"
                        value={parsedTrade[expiryKey] || ''}
                        onChange={e => setParsedTrade({
                            ...parsedTrade,
                            [expiryKey]: e.target.value
                        })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Strikes</label>
                    <input
                        className="w-full p-2 border rounded"
                        value={(parsedTrade[strikesKey] || []).join(', ')}
                        onChange={e => setParsedTrade({
                            ...parsedTrade,
                            [strikesKey]: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Trade Type</label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name={`tradeType${isSecondary ? '2' : ''}`}
                                value="Live"
                                checked={parsedTrade.isLive}
                                onChange={() => setParsedTrade({ ...parsedTrade, isLive: true })}
                                className="mr-1"
                            />
                            Live
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name={`tradeType${isSecondary ? '2' : ''}`}
                                value="Hedged"
                                checked={!parsedTrade.isLive}
                                onChange={() => setParsedTrade({ ...parsedTrade, isLive: false })}
                                className="mr-1"
                            />
                            Hedged
                        </label>
                    </div>
                </div>

                {!parsedTrade.isLive && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Delta</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={parsedTrade[deltaKey] || ''}
                                onChange={e => setParsedTrade({
                                    ...parsedTrade,
                                    [deltaKey]: parseInt(e.target.value, 10) || 0
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Underlying</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={parsedTrade[underlyingKey] || ''}
                                onChange={e => setParsedTrade({
                                    ...parsedTrade,
                                    [underlyingKey]: parseFloat(e.target.value) || 0
                                })}
                            />
                        </div>
                    </>
                )}

                {!isSecondary && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Commodity</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={commodity}
                                onChange={e => setCommodity(e.target.value)}
                            >
                                {['LN', 'HP', 'PHE', 'E7'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Cleared</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={cleared}
                                onChange={e => setCleared(e.target.value)}
                            >
                                {['CME', 'ICE'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};