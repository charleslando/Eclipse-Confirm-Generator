import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { parseTradeInput } from '../utils/parseTradeInput';
import { generateTradeLines } from '../utils/generateTradeLines';
import LegPricesSection from './LegPricesSection';
import CounterpartySection from './CounterpartySection';
import OutputSection from './OutputSection';
import TradeDetailsPanel from './TradeDetailsPanel';
import { STRATEGY_CONFIGS } from '../utils/parseTradeInput.js';

const ConfirmGenerator = () => {
    const [tradeInput, setTradeInput] = useState('');
    const [parsedTrade, setParsedTrade] = useState(null);
    const [legPrices, setLegPrices] = useState([]);
    const [counterparties, setCounterparties] = useState({ buyers: [], sellers: [] });
    const [output, setOutput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [cleared, setCleared] = useState('CME');
    const [commodity, setCommodity] = useState('LN');
    const [timeStamp, setTimestamp] = useState(new Date().toLocaleTimeString());


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
            'Z25 5.00c LIVE',
            'Z25 3.25p LIVE',
            'U25 2.75/4.25 fence x3.31 27d',
            'Q25 4.25 Call x3.65 28d',
            'J26 3.75/4.00cs vs. 3.00/2.75ps x3.56 12d'
          //  'H25 straddle 3.25 vs call 4.00 x1.85'
        ];

        let choice;
        do {
            choice = examples[Math.floor(Math.random() * examples.length)];
        } while (choice === tradeInput);

        setTradeInput(choice);
    };
    const BuildSingleStructure = () => {
        //set the input to "-" and parse it
        setTradeInput('-');
        handleParse();
    };
    const BuildDualStructure = () => {
        setTradeInput('vs');
        handleParse();
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
                strategyType2: pt.strategyType2,
                underlying: pt.underlying,
                underlying2: pt.underlying2,
                delta: pt.delta,
                delta2: pt.delta2,
                price: pt.price,
                lots: pt.lots,
                isDualStructure: pt.isDualStructure,
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



    //const currentStrategyConfig = parsedTrade ? STRATEGY_CONFIGS[parsedTrade.strategyType] : null;
    const isDualPanel = parsedTrade?.isDualStructure || false;


    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4 flex items-center">
                <FileText className="mr-2" />Eclipse Confirmation Generator
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
                <button onClick={BuildSingleStructure} className="px-4 py-2 bg-green-600 text-white rounded">Build Single Structure</button>
                <button onClick={BuildDualStructure} className="px-4 py-2 bg-green-600 text-white rounded">Build Dual Structure</button>
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
                    <div className="mt-6 bg-blue-50 p-4 rounded">
                        <div className="mb-4">
                            {isDualPanel && (
                                <p className="text-sm text-blue-600 mt-2">
                                    Secondary structure detected. You can edit both structures independently.
                                </p>
                            )}
                        </div>
                        {/* Trade Details Panels */}
                        {isDualPanel ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <TradeDetailsPanel
                                    title="Structure 1"
                                    parsedTrade={parsedTrade}
                                    setParsedTrade={setParsedTrade}
                                    isSecondary={false}
                                    commodity={commodity}
                                    setCommodity={setCommodity}
                                    cleared={cleared}
                                    setCleared={setCleared}
                                />
                                <TradeDetailsPanel
                                    title="Structure 2"
                                    parsedTrade={parsedTrade}
                                    setParsedTrade={setParsedTrade}
                                    isSecondary={true}
                                    commodity={commodity}
                                    setCommodity={setCommodity}
                                    cleared={cleared}
                                    setCleared={setCleared}
                                />
                            </div>
                        ) : (
                            <TradeDetailsPanel
                                title="Trade Details"
                                parsedTrade={parsedTrade}
                                setParsedTrade={setParsedTrade}
                                isSecondary={false}
                                commodity={commodity}
                                setCommodity={setCommodity}
                                cleared={cleared}
                                setCleared={setCleared}
                            />
                        )}


                    </div>

                    <div className="mt-6 space-y-4">
                        <LegPricesSection parsedTrade = {parsedTrade} legPrices={legPrices} setLegPrices={setLegPrices} timeStamp={timeStamp} setTimestamp={setTimestamp} />
                        <CounterpartySection title="Buyers" list={counterparties.buyers} setList={l => setCounterparties({ ...counterparties, buyers: l })} />
                        <CounterpartySection title="Sellers" list={counterparties.sellers} setList={l => setCounterparties({ ...counterparties, sellers: l })} />
                        <button onClick={generateConfirmations} className="w-full py-2 bg-green-600 text-white rounded">Generate Confirmations</button>

                        {/* Debug Info */}
                        <div className="bg-gray-100 p-3 rounded text-xs">
                            <strong>Parsed Data:</strong> {JSON.stringify(parsedTrade, null, 2)}
                        </div>
                    </div>
                </>
            )}

            {output && <OutputSection output={output} />}
        </div>
    );
};

export default ConfirmGenerator;
