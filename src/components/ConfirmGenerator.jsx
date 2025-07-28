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



    const handleParse = () => {
        // clearInput()
        // setTradeInput(tradeInput);
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
            setParsedTrade(null);
            setLegPrices([]);
            setCounterparties({ buyers: [], sellers: [] });
            setOutput('');
        }
    };
    function clearInput() {
        //clears the input and resets state
        setTradeInput('');
        setParsedTrade(null);
        setLegPrices([]);
        setCounterparties({ buyers: [], sellers: [] });
        setOutput('');
        setFeedback(null);

    }
    function sampleTrade(){
        const sampleTrades = [
            'U25 3.50/3.75cs x3.15 12d TRADES .0470 (500x)',
            'Z25 4.00p x4.34 vs. V25 4.00c x3.37 32d/28d TRADES .1950 (100x)']
        let lastSelected = tradeInput;
        let newSelected;
        do{
            const index = Math.floor(Math.random() * sampleTrades.length);
            newSelected = sampleTrades[index];
        } while(newSelected === lastSelected);
        setTradeInput(newSelected);
    }

    const generateConfirmations = () => {
        if (!parsedTrade) return;
        const confs = [];
        const { buyers, sellers } = counterparties;
        if (!buyers.length && !sellers.length) { buyers.push({ name: 'BUYER_1', quantity: 100 }); sellers.push({ name: 'SELLER_1', quantity: 100 }); }
        buyers.forEach(({ name, quantity }) => { confs.push(`BUYER (${quantity}X): ${name.toUpperCase()}\n`); confs.push(generateTradeLines(parsedTrade, quantity, 'BUY', legPrices)); });
        sellers.forEach(({ name, quantity }) => { confs.push(`\nSELLER (${quantity}X): ${name.toUpperCase()}\n`); confs.push(generateTradeLines(parsedTrade, quantity, 'SELL', legPrices)); });
        setOutput(confs.join(''));
    };



    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4 flex items-center"><FileText className="mr-2" />Trade Confirmation Generator</h1>
            <textarea className="w-full p-2 border rounded" rows={3} value={tradeInput} onChange={e => setTradeInput(e.target.value)} placeholder="Paste your trade here" />
            <div className="flex gap-x-2 mt-2">
                <button onClick={handleParse} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Parse Trade</button>
                <button onClick={clearInput} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Clear Input</button>
                <button onClick={sampleTrade} className="mt-2 px-4 py-2 bg-fuchsia-700 text-white rounded">Sample Trade</button>
            </div>
            {feedback && (
                <div className={`mt-2 p-2 rounded ${feedback.type === 'error' ? 'bg-red-100 text-red-700' : feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {feedback.message}
                </div>
            )}

            {parsedTrade && (
                <>
                    <div className="mt-6 bg-gray-50 p-4 rounded">
                        <h3 className="font-semibold mb-2">Parsed Trade Details (Editable)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label>Expiry</label><input className="w-full p-1 border rounded" value={parsedTrade.expiry} onChange={e => setParsedTrade({ ...parsedTrade, expiry: e.target.value })} /></div>
                            <div><label>Strategy</label><select className="w-full p-1 border rounded" value={parsedTrade.strategyType} onChange={e => setParsedTrade({ ...parsedTrade, strategyType: e.target.value })}>{['Call Spread','Put Spread','Fence','Put Fly', 'Call Fly', 'Strangle','Straddle','1x2 Call Spread','Call'].map(s => <option key={s}>{s}</option>)}</select></div>
                            <div><label>Strikes</label><input className="w-full p-1 border rounded" value={parsedTrade.strikes.join(', ')} onChange={e => setParsedTrade({ ...parsedTrade, strikes: e.target.value.split(',').map(s=>s.trim()) })} /></div>
                            <div><label>Price</label><input type="number" className="w-full p-1 border rounded" step="0.01" value={parsedTrade.price} onChange={e => setParsedTrade({ ...parsedTrade, price: parseFloat(e.target.value)||0 })} /></div>
                            <div><label>Delta</label><input type="number" className="w-full p-1 border rounded" value={parsedTrade.delta} onChange={e => setParsedTrade({ ...parsedTrade, delta: parseInt(e.target.value,10)||0 })} /></div>
                        </div>
                    </div>
                    <div className="mt-6 space-y-4">
                        <LegPricesSection strikes={parsedTrade.strikes} legPrices={legPrices} setLegPrices={setLegPrices} />
                        <CounterpartySection title="Buyers" list={counterparties.buyers} setList={l=>setCounterparties({...counterparties,buyers:l})} />
                        <CounterpartySection title="Sellers" list={counterparties.sellers} setList={l=>setCounterparties({...counterparties,sellers:l})} />
                        <button onClick={generateConfirmations} className="w-full py-2 bg-green-600 text-white rounded">Generate Confirmations</button>
                    </div>
                </>
            )}

            {output && <OutputSection output={output} />}
        </div>
    );
};

export default ConfirmGenerator;

