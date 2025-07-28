import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { parseTradeInput } from '../utils/parseTradeInput';
import { generateTradeLines } from '../utils/generateTradeLines';
import LegPricesSection from './LegPricesSection';
import CounterpartySection from './CounterpartySection';
import OutputSection from './OutputSection';

const ConfirmGenerator = () => {
    const [tradeInput, setTradeInput] = useState('');
    const [parsedTrade, setParsedTrade] = useState(null);
    const [legPrices, setLegPrices] = useState([]);
    const [counterparties, setCounterparties] = useState({ buyers: [], sellers: [] });
    const [output, setOutput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [cleared, setCleared] = useState('CME');
    const [commodity, setCommodity] = useState('LN');

    const clearInput = () => {
        setTradeInput('');
        setParsedTrade(null);
        setLegPrices([]);
        setCounterparties({ buyers: [], sellers: [] });
        setOutput('');
        setFeedback(null);
    };

    const sampleTrade = () => {
        const examples = [
            'U25 2.75/4.25 fence x3.31 27d TRADES .0260 (400x)'
        ];

        let choice;
        do {
            choice = examples[Math.floor(Math.random() * examples.length)];
        } while (choice === tradeInput);

        setTradeInput(choice);
    };

    const handleParse = () => {
        if (!tradeInput.trim()) {
            setFeedback({ type: 'error', message: 'Trade input cannot be empty.' });
            return;
        }

        setFeedback({ type: 'info', message: 'Parsing trade input...' });

        try {
            const pt = parseTradeInput(tradeInput) || {};
            const parsed = {
                exchange: pt.exchange,
                expiry: pt.expiry,
                expiry2: pt.expiry2,
                strikes: pt.strikes,
                strikes2: pt.strikes2,
                strategyType: pt.strategyType,
                underlying: pt.underlying,
                underlying2: pt.underlying2,
                delta: pt.delta,
                delta2: pt.delta2,
                price: pt.price,
                lots: pt.lots,
                isCalendarSpread: pt.isCalendarSpread,
                isLive: pt.isLive
            };
            setParsedTrade(parsed);
            setLegPrices(parsed.strikes.map(() => ''));
            setCounterparties({ buyers: [], sellers: [] });
            setOutput('');
            setFeedback({ type: 'success', message: 'Trade input parsed successfully!' });
        } catch (err) {
            setFeedback({ type: 'error', message: `Parsing failed: ${err.message}` });
            clearInput();
        }
    };

    const generateConfirmations = () => {
        if (!parsedTrade) return;

        const confs = [];
        const { buyers, sellers } = counterparties;

        if (!buyers.length && !sellers.length) {
            buyers.push({ name: 'BUYER_1', quantity: 100 });
            sellers.push({ name: 'SELLER_1', quantity: 100 });
        }

        buyers.forEach(({ name, quantity }) => {
            confs.push(`BUYER (${quantity}X): ${name.toUpperCase()}`);
            confs.push(generateTradeLines(parsedTrade, quantity, 'BUY', legPrices));
        });

        sellers.forEach(({ name, quantity }) => {
            confs.push(`\nSELLER (${quantity}X): ${name.toUpperCase()}`);
            confs.push(generateTradeLines(parsedTrade, quantity, 'SELL', legPrices));
        });

        setOutput(confs.join('\n'));
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4 flex items-center">
                <FileText className="mr-2" />Trade Confirmation Generator
            </h1>

            <textarea
                className="w-full p-2 border rounded"
                rows={3}
                value={tradeInput}
                onChange={e => setTradeInput(e.target.value)}
                placeholder="Paste your trade here"
            />

            <div className="flex gap-x-2 mt-2">
                <button onClick={handleParse} className="px-4 py-2 bg-blue-600 text-white rounded">Parse</button>
                <button onClick={clearInput} className="px-4 py-2 bg-blue-600 text-white rounded">Clear</button>
                <button onClick={sampleTrade} className="px-4 py-2 bg-fuchsia-700 text-white rounded">Sample</button>
            </div>

            {feedback && (
                <div className={`mt-2 p-2 rounded ${
                    feedback.type === 'error' ? 'bg-red-100 text-red-700' :
                        feedback.type === 'success' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'}`}
                >
                    {feedback.message}
                </div>
            )}

            {parsedTrade && (
                <>
                    <div className="mt-6 bg-gray-50 p-4 rounded">
                        <h3 className="font-semibold mb-2">Parsed Trade Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label>Expiry</label>
                                <input
                                    className="w-full p-1 border rounded"
                                    value={parsedTrade.expiry}
                                    onChange={e => setParsedTrade({ ...parsedTrade, expiry: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Strategy</label>
                                <select
                                    className="w-full p-1 border rounded"
                                    value={parsedTrade.strategyType}
                                    onChange={e => setParsedTrade({ ...parsedTrade, strategyType: e.target.value })}
                                >
                                    {[ 'Call Option', 'Put Option',
                                        'Vertical Call Spread', 'Horizontal Call Spread', 'Diagonal Call Spread',
                                        'Vertical Put Spread', 'Horizontal Put Spread', 'Diagonal Put Spread',
                                        'Straddle', 'Strangle',
                                        'Straddle Spread', 'Diagonal Straddle Spread',
                                        'Fence', 'Call Fly', 'Put Fly',
                                        'Conversion/Reversal', 'Iron Butterfly',
                                        'Call Condor', 'Put Condor', 'Iron Condor',
                                        'Call Tree', 'Put Tree',
                                        '3-Way: Call Spread v Put', '3-Way: Put Spread v Call', '3-Way: Straddle v Call', '3-Way: Straddle v Put'
                                    ]
                                        .map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label>Strikes</label>
                                <input
                                    className="w-full p-1 border rounded"
                                    value={parsedTrade.strikes.join(', ')}
                                    onChange={e => setParsedTrade({ ...parsedTrade, strikes: e.target.value.split(',').map(s => s.trim()) })}
                                />
                            </div>
                            <div>
                                <label>Trade Type</label><br />
                                <label><input type="radio" name="tradeType" value="Live" checked={parsedTrade.isLive} onChange={e => setParsedTrade({ ...parsedTrade, isLive: true })} /> Live</label>
                                <label><input type="radio" name="tradeType" value="Hedged" checked={!parsedTrade.isLive} onChange={e => setParsedTrade({ ...parsedTrade, isLive: false })} /> Hedged</label>
                            </div>
                            {!parsedTrade.isLive && (
                                <>
                                    <div>
                                        <label>Delta</label>
                                            <input
                                                type="number"
                                                className="w-full p-1 border rounded"
                                                value={parsedTrade.delta}
                                                onChange={e => setParsedTrade({ ...parsedTrade, delta: parseInt(e.target.value, 10) || 0 })}
                                            />
                                    </div>
                                    <div>
                                        <label>Underlying</label>
                                            <input
                                                type="number"
                                                className="w-full p-1 border rounded"
                                                value={parsedTrade.underlying}
                                                onChange={e => setParsedTrade({ ...parsedTrade, underlying: parseInt(e.target.value, 10) || 0 })}
                                            />
                                    </div>
                                </>
                            )}
                            <div>
                                <label>Commodity</label>
                                <select
                                    className="w-full p-1 border rounded"
                                    value={commodity}
                                    onChange={e => setCommodity(e.target.value)}
                                >
                                    {[ 'LN', 'HP', 'PHE', 'E7' ].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label>Cleared</label>
                                <select
                                    className="w-full p-1 border rounded"
                                    value={cleared}
                                    onChange={e => setCleared(e.target.value)}
                                >
                                    {[ 'CME', 'ICE' ].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <LegPricesSection strikes={parsedTrade.strikes} legPrices={legPrices} setLegPrices={setLegPrices} />
                        <CounterpartySection title="Buyers" list={counterparties.buyers} setList={l => setCounterparties({ ...counterparties, buyers: l })} />
                        <CounterpartySection title="Sellers" list={counterparties.sellers} setList={l => setCounterparties({ ...counterparties, sellers: l })} />
                        <button onClick={generateConfirmations} className="w-full py-2 bg-green-600 text-white rounded">Generate Confirmations</button>
                    </div>
                </>
            )}

            {output && <OutputSection output={output} />}
        </div>
    );
};

export default ConfirmGenerator;
