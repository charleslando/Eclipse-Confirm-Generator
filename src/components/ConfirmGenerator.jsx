import React, { useState } from 'react';
import EclipseLogo from '../assets/EclipseLogo.jpg';
import {TradeParser} from '../utils/TradeParser';
import {breakdownTrade, calculatePrice, Trade} from '../utils/TradeCreator.js';
import TradeConfirmer from '../utils/TradeConfirmer.js';
import CounterpartySection from './CounterpartySection';
import OutputSection from './OutputSection';
import TradeDetailsPanel from './TradeDetailsPanel';
import { STRAT_CONFIGS, STRAT_STRIKE_MAP } from "../utils/TradeCreator.js";
import LegPricesSection from "./LegPricesSection.jsx";

const ConfirmGenerator = () => {
    const [trade, setTrade] = useState(null);
    const [productCode, setProductCode] = useState('LN');
    const [tradeInput, setTradeInput] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [counterparties, setCounterparties] = useState({ buyers: [], sellers: [] });
    const [output, setOutput] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [timeStamp, setTimestamp] = useState(new Date().toLocaleTimeString());

    function isFiniteNum(v) {
        const num = typeof v === 'string' ? parseFloat(v) : v;
        return typeof num === 'number' && Number.isFinite(num);
    }
    function requiredStrikeCount(leg) {
        return STRAT_STRIKE_MAP[leg?.type] || (leg?.strikes?.length ?? 0) || 0;
    }

    function hasAllPricesForLeg(leg) {
        if (!leg) return true;
        const need = requiredStrikeCount(leg);
        const arr = leg?.prices || [];
        for (let i = 0; i < need; i++) {
            if (!isFiniteNum(arr[i])){
                console.log(arr[i]);
                return false;
            }
        }
        return true;
    }

    function hasAllPrices(trade) {
        if (!trade) return false;
        return hasAllPricesForLeg(trade.leg1) && hasAllPricesForLeg(trade.leg2);
    }


    const clearInput = () => {
        setTradeInput('');
        setParsedData(null);
        setTrade(null);
        setCounterparties({ buyers: [], sellers: [] });
        setOutput('');
        setFeedback(null);
    };

    const sampleTrade = () => {
        const examples = [
            'Z25 5.00c LIVE',
            'Z25 3.25p LIVE',
            'Q25 4.25 Call x3.65 28d'
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
            'U25 2.75/4.25 fence x3.31 27d'
        ];

        let choice;
        do {
            choice = examples[Math.floor(Math.random() * examples.length)];
        } while (choice === tradeInput);

        setTradeInput(choice);
    };

    const BuildStructure = () => {

            // Create a new Trade instance for single structure
            const newTrade = new Trade("Custom"); // Pass a valid strategy type
            setTrade(newTrade);
            setFeedback({ type: 'success', message: 'Single structure initialized!' });
    };


    function extracted(strategyType) {
        // Create a completely new Trade instance
        const newTrade = new Trade(strategyType);

        // Copy over the current data
        newTrade.exchange = trade.exchange;
        newTrade.isLive = trade.isLive;
        newTrade.ratio = trade.ratio;

        // Copy over existing leg data if it exists, but preserve the new array sizes
        if (trade.leg1 && newTrade.leg1) {
            const requiredStrikes1 = STRAT_STRIKE_MAP[newTrade.leg1.type] || 1;

            // Copy strikes up to the required length, fall back to parsedData if needed
            for (let i = 0; i < requiredStrikes1; i++) {
                if (trade.leg1.strikes && i < trade.leg1.strikes.length && trade.leg1.strikes[i] !== 0) {
                    newTrade.leg1.strikes[i] = trade.leg1.strikes[i];
                } else if (parsedData?.strikes && i < parsedData.strikes.length) {
                    newTrade.leg1.strikes[i] = parsedData.strikes[i];
                }

                if (trade.leg1.prices && i < trade.leg1.prices.length) {
                    newTrade.leg1.prices[i] = trade.leg1.prices[i];
                }
            }

            newTrade.leg1.expiry = trade.leg1.expiry || parsedData?.expiry || '';
            newTrade.leg1.underlying = trade.leg1.underlying || parsedData?.underlying || 0;
            newTrade.leg1.delta = trade.leg1.delta || parsedData?.delta || 0;
        }

        if (trade.leg2 && newTrade.leg2) {
            const requiredStrikes2 = STRAT_STRIKE_MAP[newTrade.leg2.type] || 1;

            // Copy strikes up to the required length, fall back to parsedData if needed
            for (let i = 0; i < requiredStrikes2; i++) {
                if (trade.leg2.strikes && i < trade.leg2.strikes.length && trade.leg2.strikes[i] !== 0) {
                    newTrade.leg2.strikes[i] = trade.leg2.strikes[i];
                } else if (parsedData?.strikes2 && i < parsedData.strikes2.length) {
                    newTrade.leg2.strikes[i] = parsedData.strikes2[i];
                }

                if (trade.leg2.prices && i < trade.leg2.prices.length) {
                    newTrade.leg2.prices[i] = trade.leg2.prices[i];
                }
            }

            newTrade.leg2.expiry = trade.leg2.expiry || parsedData?.expiry2 || '';
            newTrade.leg2.underlying = trade.leg2.underlying || parsedData?.underlying2 || 0;
            newTrade.leg2.delta = trade.leg2.delta || parsedData?.delta2 || 0;
        }
        else if(newTrade.leg2){
            // trade doesnt have leg2, but newTrade does
            newTrade.leg2.expiry = parsedData.expiry2;
            newTrade.leg2.underlying = parsedData.underlying;
            newTrade.leg2.delta = parsedData.delta2;
            newTrade.leg2.strikes = parsedData.strikes2 || new Array(STRAT_STRIKE_MAP[newTrade.leg2.type] || 1).fill(0);
            newTrade.leg2.prices =  new Array(STRAT_STRIKE_MAP[newTrade.leg2.type] || 1).fill(0);
        }

        setTrade(newTrade);
    }

    function swapLegDetails() {
        if (!trade || !trade.leg1 || !trade.leg2) {
            setFeedback({ type: 'error', message: 'Both legs must exist to swap details.' });
            return;
        }

        if (!hasAllPrices(trade)) {
            setFeedback({ type: 'error', message: 'Finish entering all required prices before swapping.' });
            return;
        }

        // Deep-ish clone (adjust if you have nested objects beyond arrays/primitives)
        const leg1Copy = {
            ...trade.leg1,
            strikes: [...(trade.leg1.strikes || [])],
            prices:  [...(trade.leg1.prices  || [])],
            isBuy: !trade.leg1.isBuy
        };
        const leg2Copy = {
            ...trade.leg2,
            strikes: [...(trade.leg2.strikes || [])],
            prices:  [...(trade.leg2.prices  || [])],
            isBuy: !trade.leg2.isBuy
        };

        // Swap ALL details: type, isBuy, expiry, strikes, prices, underlying, delta, etc.
        setTrade({
            ...trade,
            leg1: leg2Copy,
            leg2: leg1Copy,
        });

        //swap the ratio if it exists
        if (trade.ratio) {
            const ratioParts = trade.ratio.split('x');
            if (ratioParts.length === 2) {
                const newRatio = `${ratioParts[1]}x${ratioParts[0]}`;
                setTrade(prevTrade => ({ ...prevTrade, ratio: newRatio }));
            }
        }

        setFeedback({ type: 'success', message: 'Leg details swapped (panels unchanged).' });
    }



    const handleParse = () => {
        if (!tradeInput.trim()) {
            setFeedback({ type: 'error', message: 'Trade input cannot be empty.' });
            return;
        }

        setFeedback({ type: 'info', message: 'Parsing trade input...' });

        try {
            // Parse the trade input into a Trade object

            const parser = new TradeParser();
            const parsedData = parser.parse(tradeInput);
            setParsedData(parsedData);

            //Create a new Trade instance with the parsed data
            const newTrade = breakdownTrade(parsedData);
            setTrade(newTrade);

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
        try {
            // Create a TradeConfirmer instance with the trade
            const confirmer = new TradeConfirmer(trade, timeStamp, productCode);

            // Generate confirmations with buyers and sellers
            const confirmationText = confirmer.generateConfirmations(counterparties.buyers, counterparties.sellers);

            if (!confirmationText) {
                setFeedback({ type: 'error', message: 'Failed to generate confirmations.' });
                return;
            }

            setOutput(confirmationText);
            setFeedback({ type: 'success', message: 'Confirmations generated successfully!' });

        } catch (error) {
            console.error('Confirmation generation error:', error);
            setFeedback({ type: 'error', message: `Error generating confirmations: ${error.message}` });
        }

    };


    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
            {/*CONFIRM INPUT*/}
            <h1 className="text-2xl font-bold mb-4 flex items-center">
                <img src={EclipseLogo} alt="Eclipse" className="mr-10 h-32 w-32" />
                Eclipse Confirmation Generator
            </h1>

            <textarea
                className="w-full p-2 border rounded"
                rows={3}
                value={tradeInput}
                onChange={e => setTradeInput(e.target.value)}
                placeholder="Paste your trade here"
            />

            {/*TRADE BUTTONS*/}
            <div className="flex gap-x-2 mt-2">
                <button onClick={handleParse} className="px-4 py-2 bg-blue-600 text-white rounded">Parse</button>
                <button onClick={clearInput} className="px-4 py-2 bg-blue-600 text-white rounded">Clear</button>
                <button onClick={sampleTrade} className="px-4 py-2 bg-fuchsia-700 text-white rounded">Sample Single</button>
                <button onClick={sampleDualTrade} className="px-4 py-2 bg-fuchsia-700 text-white rounded">Sample Double</button>
                <button onClick={BuildStructure} className="px-4 py-2 bg-green-600 text-white rounded">Build Structure</button>
            </div>

            {/*FEEDBACK*/}
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
                    <div className="flex gap-4 mt-4">
                        {/*EXCHANGE*/}
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
                        {/*PRODUCT CODE*/}
                        <label className="flex items-center gap-2">
                            <span className="font-semibold">Product Code:</span>
                            <select
                                className="p-1 border rounded"
                                value={productCode}
                                onChange={e => setProductCode(e.target.value)}
                            >
                                <option value="LN">LN/HP</option>
                                <option value="PHE">PHE</option>
                                <option value="Brent">Brent</option>
                            </select>
                        </label>
                    </div>

                    {/*STRATEGY TYPE*/}
                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Strategy Type</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={trade.strategyType}
                            onChange={e => {
                                extracted(e.target.value);
                            }}
                        >
                            {Object.keys(STRAT_CONFIGS).map(strategy => (
                                <option key={strategy} value={strategy}>{strategy}</option>
                            ))}
                        </select>
                    </div>
                    {/*TRADE TYPE*/}
                    <div className="mt-4 bg-gray-50 p-4 rounded">
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

                        {/*{(trade.strategyType === 'Call Spread' || trade.strategyType === 'Put Spread' ||*/}
                        {/*    //trade.strategyType === 'Horizontal Call Spread' || trade.strategyType === 'Horizontal Put Spread' ||*/}
                        {/*    //trade.strategyType === 'Diagonal Call Spread' || trade.strategyType === 'Diagonal Put Spread' ||*/}
                        {/*    trade.strategyType === 'Fence' || trade.strategyType === 'Conversion/Reversal') && (*/}
                        {trade.leg2 && (


                            <div className="mt-2">
                                <label className="block text-sm font-medium mb-1">Ratio</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="w-16 px-2 py-1 border rounded"
                                        value={trade.ratio ? trade.ratio.split('x')[0] : '1'}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^\d.]/g, '');
                                            const ratio2 = trade.ratio ? trade.ratio.split('x')[1] : '1';
                                            setTrade({ ...trade, ratio: `${val}x${ratio2}` });
                                        }}
                                    />
                                    <span className="font-medium">x</span>
                                    <input
                                        type="text"
                                        className="w-16 px-2 py-1 border rounded"
                                        value={trade.ratio ? trade.ratio.split('x')[1] : '1'}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^\d.]/g, '');
                                            const ratio1 = trade.ratio ? trade.ratio.split('x')[0] : '1';
                                            setTrade({ ...trade, ratio: `${ratio1}x${val}` });
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                    </div>

                    {/*LEG PANELS*/}
                    <div className="mt-6 bg-white p-4 rounded">
                        {/* Trade Details Panels */}
                        {trade.leg2 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Premium wrapper for first panel */}
                                <div className="bg-black rounded-lg p-1">
                                    <div className="bg-yellow-400 text-black text-xs font-bold text-center py-1 rounded-t-md mb-1">
                                        PREMIUM
                                    </div>
                                    <div className="bg-white rounded-b-md">
                                        <TradeDetailsPanel
                                            leg={trade.leg1}
                                            setLeg={(leg) => setTrade({ ...trade, leg1: leg })}
                                            trade={trade}
                                        />
                                    </div>
                                </div>

                                {/* Regular second panel with spacer to match height */}
                                <div>
                                    <div className="text-xs font-bold text-center py-1 mb-1 invisible">
                                        SPACER
                                    </div>
                                    <TradeDetailsPanel
                                        leg={trade.leg2}
                                        setLeg={(leg) => setTrade({ ...trade, leg2: leg })}
                                        trade={trade}
                                    />
                                </div>
                            </div>
                        ) : (
                            <TradeDetailsPanel
                                title="Trade Details"
                                leg={trade.leg1}
                                setLeg={(leg) => setTrade({ ...trade, leg1: leg })}
                                trade={trade}
                            />
                        )}



                    </div>

                    {/*LEG PRICES*/}
                    {trade.leg2 ?(
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <LegPricesSection
                                leg={trade.leg1}
                                setLeg={(leg) => setTrade({ ...trade, leg1: leg })}
                                trade={trade}

                            />
                            <LegPricesSection
                                leg={trade.leg2}
                                setLeg={(leg) => setTrade({ ...trade, leg2: leg })}
                                trade={trade}
                            />
                        </div>

                    ) : (
                        <LegPricesSection
                            leg={trade.leg1}
                            setLeg={(leg) => setTrade({ ...trade, leg1: leg })}
                            trade={trade}
                        />
                    )}

                    {/* Summary Section */}
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="font-bold text-sm">Total Price:</span>
                                {(() => {
                                    let total = calculatePrice(trade, trade.leg1) - (trade.leg2 ? calculatePrice(trade, trade.leg2) : 0);
                                    total = isFiniteNum(total) ? total : 'N/A';
                                    const needsSwap = total < 0 && !!trade.leg2;

                                    return (
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{(total)}</span>
                                            {needsSwap && (
                                                <div className="flex items-center gap-2">
                                <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                  Net negative — consider swapping legs
                                </span>
                                                    <button
                                                        className={`text-xs px-2 py-1 rounded ${
                                                            hasAllPrices(trade) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                        onClick={swapLegDetails}
                                                        disabled={!hasAllPrices(trade)}
                                                        title={!hasAllPrices(trade) ? 'Enter all prices first' : 'Swap all leg details (panels stay)'}
                                                    >
                                                        Swap Details
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">Timestamp:</span>
                                <input
                                    type="text"
                                    className="p-2 border rounded bg-gray-50"
                                    value={timeStamp}
                                    onChange={(e) => {setTimestamp(e.target.value)}}
                                />
                            </div>
                        </div>
                    </div>


                    <div className="mt-6 space-y-4">
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

                    </div>
                </>
            )}

            {output && <OutputSection output={output} />}
            {/* Debug Info */}
            {/*<div className="bg-gray-100 p-3 rounded text-xs">*/}
            {/*    <strong>Trade Data:</strong>*/}
            {/*    <pre>{JSON.stringify(trade, null, 2)}</pre>*/}
            {/*    <strong>Parsed Data:</strong>*/}
            {/*    <pre>{JSON.stringify(parsedData, null, 2)}</pre>*/}
            {/*</div>*/}
        </div>
    );
};

export default ConfirmGenerator;