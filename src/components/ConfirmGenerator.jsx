import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import {breakdownTrade, Trade} from '../utils/parseTradeInput';
import { generateTradeLines } from '../utils/generateTradeLines';
import LegPricesSection from './LegPricesSection';
import CounterpartySection from './CounterpartySection';
import OutputSection from './OutputSection';
import TradeDetailsPanel from './TradeDetailsPanel';
import { STRAT_CONFIGS } from "../utils/parseTradeInput";

const ConfirmGenerator = () => {
    const [productCode, setProductCode] = useState('LN');
    const [tradeInput, setTradeInput] = useState('');
    const [trade, setTrade] = useState(null);
    const [legPrices, setLegPrices] = useState([]);
    const [counterparties, setCounterparties] = useState({ buyers: [], sellers: [] });
    const [output, setOutput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [timeStamp, setTimestamp] = useState(new Date().toLocaleTimeString());

    const clearInput = () => {
        setTradeInput('');
        setTrade(null);
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
        ];

        let choice;
        do {
            choice = examples[Math.floor(Math.random() * examples.length)];
        } while (choice === tradeInput);

        setTradeInput(choice);
    };

    const sampleDualTrade = () => {
        const examples = [
            'J26 3.75/4.00cs vs. 3.00/2.75ps x3.56 12d',
            'H25 straddle 3.25 vs call 4.00 x1.85'
        ];

        let choice;
        do {
            choice = examples[Math.floor(Math.random() * examples.length)];
        } while (choice === tradeInput);

        setTradeInput(choice);
    };

    const BuildSingleStructure = () => {
        // Create a new Trade instance for single structure
        const newTrade = new Trade();
        newTrade.leg1 = {
            expiry: '',
            strikes: [''],
            underlying: '',
            delta: null,
            price: null,
            lots: null
        };
        newTrade.leg2 = null;
        newTrade.strategyType = 'call';
        newTrade.exchange = 'CME';
        newTrade.isLive = true;
        newTrade.isDualStructure = false;

        setTrade(newTrade);
        setTradeInput('-');
        setLegPrices(['']);
        setFeedback({ type: 'success', message: 'Single structure initialized!' });
    };

    const BuildDualStructure = () => {
        // Create a new Trade instance for dual structure
        const newTrade = new Trade();
        newTrade.leg1 = {
            expiry: '',
            strikes: [''],
            underlying: '',
            delta: null,
            price: null,
            lots: null
        };
        newTrade.leg2 = {
            expiry: '',
            strikes: [''],
            underlying: '',
            delta: null,
            price: null,
            lots: null
        };
        newTrade.strategyType = 'call';
        newTrade.exchange = 'CME';
        newTrade.isLive = true;
        newTrade.isDualStructure = true;

        setTrade(newTrade);
        setTradeInput('vs');
        setLegPrices(['', '']);
        setFeedback({ type: 'success', message: 'Dual structure initialized!' });
    };



    const handleParse = () => {
        if (!tradeInput.trim()) {
            setFeedback({ type: 'error', message: 'Trade input cannot be empty.' });
            return;
        }

        setFeedback({ type: 'info', message: 'Parsing trade input...' });

        try {
            // Parse the trade input into a Trade object
            //const parsedTrade = parseTradeInput(tradeInput);
            const newTrade = breakdownTrade(tradeInput);

            setTrade(newTrade);

            // Initialize leg prices based on structure
            //const totalLegs = newTrade.leg2 ? 2 : 1;
            const legCount = (newTrade.leg1?.strikes?.length || 1) + (newTrade.leg2?.strikes?.length || 0);
            setLegPrices(Array(legCount).fill(''));

            setCounterparties({ buyers: [], sellers: [] });
            setOutput('');
            setFeedback({ type: 'success', message: 'Trade input parsed successfully!' });

        } catch (err) {
            setFeedback({ type: 'error', message: `Parsing failed: ${err.message}` });
            clearInput();
        }
    };

    const generateConfirmations = () => {
        if (!trade) return;

        const confs = [];
        const { buyers, sellers } = counterparties;

        if (!buyers.length && !sellers.length) {
            buyers.push({ name: 'BUYER_1', quantity: 100 });
            sellers.push({ name: 'SELLER_1', quantity: 100 });
        }

        buyers.forEach(({ name, quantity }) => {
            confs.push(`BUYER (${quantity}X): ${name.toUpperCase()}`);
            confs.push(generateTradeLines(trade, quantity, 'BUY', legPrices));
        });

        sellers.forEach(({ name, quantity }) => {
            confs.push(`\nSELLER (${quantity}X): ${name.toUpperCase()}`);
            confs.push(generateTradeLines(trade, quantity, 'SELL', legPrices));
        });

        setOutput(confs.join('\n'));
    };

    const availableStrategies = Object.keys(STRAT_CONFIGS);

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
                <button onClick={sampleTrade} className="px-4 py-2 bg-fuchsia-700 text-white rounded">Sample Single</button>
                <button onClick={sampleDualTrade} className="px-4 py-2 bg-fuchsia-700 text-white rounded">Sample Double</button>
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

            {trade && (
                <>
                    <div className="flex grid-cols-2 gap-4 mt-4">
                        <label className="flex items-center gap-2">
                            <span className="font-semibold">Exchange:</span>
                            <select
                                className="p-1 border rounded"
                                value={trade.exchange}
                                onChange={e => setTrade({ ...trade, exchange: e.target.value})}
                            >
                                <option value="CME">CME</option>
                                <option value="ICE">ICE</option>
                            </select>
                        </label>
                        <label className="flex items-center gap-2">
                            <span className="font-semibold">Product Code:</span>
                            <select
                                className="p-1 border rounded"
                                value={productCode}
                                onChange={e => setProductCode(e.target.value)}
                            >
                                <option value="LN">LN</option>
                                <option value="PHE">PHE</option>
                            </select>
                        </label>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Strategy Type</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={trade.strategyType}
                            onChange={e => setTrade({ ...trade, strategyType: e.target.value })}
                        >
                            {availableStrategies.map(strategy => (
                                <option key={strategy} value={strategy}>{strategy}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-6 bg-blue-50 p-4 rounded">
                        <div className="mb-4">
                            {trade.leg2 && (
                                <p className="text-sm text-blue-600 mt-2">
                                    This strategy has 2 legs
                                </p>
                            )}
                        </div>

                        {/* Trade Details Panels */}
                        {trade.leg2 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <TradeDetailsPanel
                                    title="Leg 1"
                                    leg={trade.leg1}
                                    setLeg={(leg) => setTrade({ ...trade, leg1: leg })}
                                />
                                <TradeDetailsPanel
                                    title="Leg 2"
                                    leg={trade.leg2}
                                    setLeg={(leg) => setTrade({ ...trade, leg2: leg })}
                                />
                            </div>
                        ) : (
                            <TradeDetailsPanel
                                title="Trade Details"
                                leg={trade.leg1}
                                setLeg={(leg) => setTrade({ ...trade, leg1: leg })}
                            />
                        )}

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Trade Type</label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="tradeType"
                                        value="Live"
                                        checked={trade.isLive}
                                        onChange={() => setTrade({ ...trade, isLive: true })}
                                        className="mr-1"
                                    />
                                    Live
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="tradeType"
                                        value="Hedged"
                                        checked={!trade.isLive}
                                        onChange={() => setTrade({ ...trade, isLive: false })}
                                        className="mr-1"
                                    />
                                    Hedged
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ratio</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={trade.ratio || ''}
                                    onChange={e => setTrade({ ...trade, ratio: e.target.value })}
                                >
                                    <option value="">Select Ratio</option>
                                    <option value="1">1x1</option>
                                    <option value="2">2x3</option>
                                    <option value="3">3x1</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        <LegPricesSection
                            trade={trade}
                            legPrices={legPrices}
                            setLegPrices={setLegPrices}
                            timeStamp={timeStamp}
                            setTimestamp={setTimestamp}
                        />
                        <CounterpartySection
                            title="Buyers"
                            list={counterparties.buyers}
                            setList={l => setCounterparties({ ...counterparties, buyers: l })}
                        />
                        <CounterpartySection
                            title="Sellers"
                            list={counterparties.sellers}
                            setList={l => setCounterparties({ ...counterparties, sellers: l })}
                        />
                        <button
                            onClick={generateConfirmations}
                            className="w-full py-2 bg-green-600 text-white rounded"
                        >
                            Generate Confirmations
                        </button>

                        {/* Debug Info */}
                        <div className="bg-gray-100 p-3 rounded text-xs">
                            <strong>Trade Data:</strong>
                            <pre>{JSON.stringify(trade, null, 2)}</pre>
                        </div>
                    </div>
                </>
            )}

            {output && <OutputSection output={output} />}
        </div>
    );
};

export default ConfirmGenerator;



















































// import React, { useState } from 'react';
// import { FileText } from 'lucide-react';
// import {breakdownTrade, parseTradeInput, Trade} from '../utils/parseTradeInput';
// import { generateTradeLines } from '../utils/generateTradeLines';
// import LegPricesSection from './LegPricesSection';
// import CounterpartySection from './CounterpartySection';
// import OutputSection from './OutputSection';
// import TradeDetailsPanel from './TradeDetailsPanel';
// import { STRATEGY_CONFIGS } from "../utils/parseTradeInput";
//
// const ConfirmGenerator = () => {
//     //const [exchange, setExchange] = useState('CME');
//     const [productCode, setProductCode] = useState('LN');
//     const [tradeInput, setTradeInput] = useState('');
//     //const [parsedTrade, setParsedTrade] = useState(null);
//     const [trade, setTrade] = useState(null);
//     const [legPrices, setLegPrices] = useState([]);
//     const [counterparties, setCounterparties] = useState({ buyers: [], sellers: [] });
//     const [output, setOutput] = useState('');
//     const [feedback, setFeedback] = useState(null);
//     const [timeStamp, setTimestamp] = useState(new Date().toLocaleTimeString());
//
//
//     const clearInput = () => {
//         setTradeInput('');
//         setTrade(null);
//         //setParsedTrade(null);
//         setLegPrices([]);
//         setCounterparties({ buyers: [], sellers: [] });
//         setOutput('');
//         setFeedback(null);
//     };
//     const sampleTrade = () => {
//         const examples = [
//             'Z25 5.00c LIVE',
//             'Z25 3.25p LIVE',
//             'U25 2.75/4.25 fence x3.31 27d',
//             'Q25 4.25 Call x3.65 28d',
//         ];
//
//         let choice;
//         do {
//             choice = examples[Math.floor(Math.random() * examples.length)];
//         } while (choice === tradeInput);
//
//         setTradeInput(choice);
//     };
//     const sampleDualTrade = () => {
//         const examples = [
//             'J26 3.75/4.00cs vs. 3.00/2.75ps x3.56 12d',
//             'H25 straddle 3.25 vs call 4.00 x1.85'
//         ];
//
//         let choice;
//         do {
//             choice = examples[Math.floor(Math.random() * examples.length)];
//         } while (choice === tradeInput);
//
//         setTradeInput(choice);
//
//     };
//     const BuildSingleStructure = () => {
//         //set the input to "-" and parse it
//         setTradeInput('-');
//         handleParse();
//     };
//     const BuildDualStructure = () => {
//         setTradeInput('vs');
//         handleParse();
//     };
//
//     const handleParse = () => {
//         if (!tradeInput.trim()) {
//             setFeedback({ type: 'error', message: 'Trade input cannot be empty.' });
//             return;
//         }
//
//         setFeedback({ type: 'info', message: 'Parsing trade input...' });
//
//         try {
//             // const pt = parseTradeInput(tradeInput) || {};
//             // const parsed = {
//             //     exchange: pt.exchange,
//             //     expiry: pt.expiry,
//             //     expiry2: pt.expiry2,
//             //     strikes: pt.strikes,
//             //     strikes2: pt.strikes2,
//             //     strategyType: pt.strategyType,
//             //     underlying: pt.underlying,
//             //     underlying2: pt.underlying2,
//             //     delta: pt.delta,
//             //     delta2: pt.delta2,
//             //     price: pt.price,
//             //     lots: pt.lots,
//             //     isDualStructure: pt.isDualStructure,
//             //     isLive: pt.isLive
//             // };
//             // setParsedTrade(parsed);
//
//             let trade = new Trade();
//             trade = breakdownTrade(trade);
//             const isDoubleLeg = trade.leg2;
//
//             //const totalLegs = parsed.strikes.length + (parsed.strikes2?.length || 0);
//             //setLegPrices(Array(totalLegs).fill(''));
//             setCounterparties({ buyers: [], sellers: [] });
//             setOutput('');
//             setFeedback({ type: 'success', message: 'Trade input parsed successfully!' });
//
//
//         } catch (err) {
//             setFeedback({ type: 'error', message: `Parsing failed: ${err.message}` });
//             clearInput();
//         }
//     };
//
//     const generateConfirmations = () => {
//         // if (!parsedTrade) return;
//         //
//         // const confs = [];
//         // const { buyers, sellers } = counterparties;
//         //
//         // if (!buyers.length && !sellers.length) {
//         //     buyers.push({ name: 'BUYER_1', quantity: 100 });
//         //     sellers.push({ name: 'SELLER_1', quantity: 100 });
//         // }
//         //
//         // buyers.forEach(({ name, quantity }) => {
//         //     confs.push(`BUYER (${quantity}X): ${name.toUpperCase()}`);
//         //     confs.push(generateTradeLines(parsedTrade, quantity, 'BUY', legPrices));
//         // });
//         //
//         // sellers.forEach(({ name, quantity }) => {
//         //     confs.push(`\nSELLER (${quantity}X): ${name.toUpperCase()}`);
//         //     confs.push(generateTradeLines(parsedTrade, quantity, 'SELL', legPrices));
//         // });
//         //
//         // setOutput(confs.join('\n'));
//     };
//
//
//
//     const availableStrategies = Object.keys(STRATEGY_CONFIGS);
// // // Add null check with optional chaining or default to false
// //     const isDualPanel = parsedTrade?.isDualStructure || false;
//
//
//     return (
//         <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
//             <h1 className="text-2xl font-bold mb-4 flex items-center">
//                 <FileText className="mr-2" />Eclipse Confirmation Generator
//             </h1>
//
//             <textarea
//                 className="w-full p-2 border rounded"
//                 rows={3}
//                 value={tradeInput}
//                 onChange={e => setTradeInput(e.target.value)}
//                 placeholder="Paste your trade here"
//             />
//
//             <div className="flex gap-x-2 mt-2">
//                 <button onClick={handleParse} className="px-4 py-2 bg-blue-600 text-white rounded">Parse</button>
//                 <button onClick={clearInput} className="px-4 py-2 bg-blue-600 text-white rounded">Clear</button>
//                 <button onClick={sampleTrade} className="px-4 py-2 bg-fuchsia-700 text-white rounded">Sample Single</button>
//                 <button onClick={sampleDualTrade} className="px-4 py-2 bg-fuchsia-700 text-white rounded">Sample Double</button>
//                 <button onClick={BuildSingleStructure} className="px-4 py-2 bg-green-600 text-white rounded">Build Single Structure</button>
//                 <button onClick={BuildDualStructure} className="px-4 py-2 bg-green-600 text-white rounded">Build Dual Structure</button>
//             </div>
//
//             {feedback && (
//                 <div className={`mt-2 p-2 rounded ${
//                     feedback.type === 'error' ? 'bg-red-100 text-red-700' :
//                     feedback.type === 'success' ? 'bg-green-100 text-green-700' :
//                     'bg-blue-100 text-blue-700'}`}
//                 >
//                     {feedback.message}
//                 </div>
//             )}
//
//             {trade && (
//                 <>
//                     <div className="flex grid-cols 2 gap-4 mt-4">
//                         <label className="flex items-center gap-2">
//                         <span className="font-semibold">Exchange:</span>
//                             <select
//                                 className="p-1 border rounded"
//                                 value={trade.exchange}
//                                 onChange={e => setTrade({ ...trade, exchange: e.target.value})}
//                             >
//                                 <option value="CME">CME</option>
//                                 <option value="ICE">ICE</option>
//
//                             </select>
//                         </label>
//                         <label className="flex items-center gap-2">
//                             <span className="font-semibold">Product Code:</span>
//                             <select
//                                 className="p-1 border rounded"
//                                 value={productCode}
//                                 onChange={e => setProductCode(e.target.value)}
//                             >
//                                 <option value="LN">LN</option>
//                                 <option value="PHE">PHE</option>
//
//                             </select>
//                         </label>
//                     </div>
//
//                     <label className="block text-sm font-medium mb-2">Strategy Type</label>
//                     <select
//                         className="w-full p-2 border rounded"
//                         value={trade.strategyType}
//                         onChange={e => setTrade({ ...trade, strategyType: e.target.value })}
//                     >
//                         {availableStrategies.map(strategy => (<option key={strategy} value={strategy}>{strategy}</option>))}
//                     </select>
//
//                     <div className="mt-6 bg-blue-50 p-4 rounded">
//                         <div className="mb-4">
//                             {trade.leg2 && (
//                                 <p className="text-sm text-blue-600 mt-2">
//                                     This strategy has 2 legs
//                                 </p>
//                             )}
//                         </div>
//                         {/* Trade Details Panels */}
//                         {trade.leg2 ? (
//                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                                 <TradeDetailsPanel
//                                     title="Leg 1"
//                                     leg = {trade.leg1}
//                                     setLeg = {(leg) => setTrade({ ...trade, leg1: leg })}
//                                     // parsedTrade={parsedTrade}
//                                     // setParsedTrade={setParsedTrade}
//                                     // isSecondary={false}
//                                 />
//                                 <TradeDetailsPanel
//                                     title="Leg 2"
//                                     leg = {trade.leg2}
//                                     setLeg = {(leg) => setTrade({ ...trade, leg2: leg })}
//                                     // parsedTrade={parsedTrade}
//                                     // setParsedTrade={setParsedTrade}
//                                     // isSecondary={true}
//
//                                 />
//                             </div>
//                         ) : (
//                             <TradeDetailsPanel
//                                 title="Trade Details"
//                                 leg = {trade.leg1}
//                                 // parsedTrade={parsedTrade}
//                                 // setParsedTrade={setParsedTrade}
//                                 // isSecondary={false}
//
//                             />
//                         )}
//                         <div>
//                             <label className="block text-sm font-medium mb-1">Trade Type</label>
//                             <div className="flex gap-4">
//                                 <label className="flex items-center">
//                                     <input
//                                         type="radio"
//                                         name={"tradeType"}
//                                         value="Live"
//                                         checked={parsedTrade.isLive}
//                                         onChange={() => setParsedTrade({ ...parsedTrade, isLive: true })}
//                                         className="mr-1"
//                                     />
//                                     Live
//                                 </label>
//                                 <label className="flex items-center">
//                                     <input
//                                         type="radio"
//                                         name={"tradeType"}
//                                         value="Hedged"
//                                         checked={!parsedTrade.isLive}
//                                         onChange={() => setParsedTrade({ ...parsedTrade, isLive: false })}
//                                         className="mr-1"
//                                     />
//                                     Hedged
//                                 </label>
//                             </div>
//                         </div>
//                     </div>
//
//                     <div className="mt-6 space-y-4">
//                         <LegPricesSection parsedTrade = {parsedTrade} legPrices={legPrices} setLegPrices={setLegPrices} timeStamp={timeStamp} setTimestamp={setTimestamp} />
//                         <CounterpartySection title="Buyers" list={counterparties.buyers} setList={l => setCounterparties({ ...counterparties, buyers: l })} />
//                         <CounterpartySection title="Sellers" list={counterparties.sellers} setList={l => setCounterparties({ ...counterparties, sellers: l })} />
//                         <button onClick={generateConfirmations} className="w-full py-2 bg-green-600 text-white rounded">Generate Confirmations</button>
//
//                         {/* Debug Info */}
//                         <div className="bg-gray-100 p-3 rounded text-xs">
//                             <strong>Parsed Data:</strong> {JSON.stringify(parsedTrade, null, 2)}
//                         </div>
//                     </div>
//                 </>
//             )}
//
//             {output && <OutputSection output={output} />}
//         </div>
//     );
// };
//
// export default ConfirmGenerator;
