//src/utils/parseTradeInput.test.js
import { parseTradeInput } from './parseTradeInput'
import { describe, it, expect } from 'vitest'



describe('parseTradeInput() - Additional Strategy Examples', () => {

    // Basic Options (you already have these)
    it('parses a simple Call Option', () => {
        const input = 'Z25 5.00c LIVE'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'Z25',
            expiry2: null,
            strikes: [5.00],
            strikes2: null,
            strategyType: 'Call Option',
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            isCalendarSpread: false,
            isLive: true
        })
    })

    it('parses a simple Put Option', () => {
        const input = 'Z25 3.25p LIVE'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'Z25',
            expiry2: null,
            strikes: [3.25],
            strikes2: null,
            strategyType: 'Put Option',
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            isCalendarSpread: false,
            isLive: true
        })
    })

    // Vertical Spreads
    it('parses a Vertical Call Spread', () => {
        const input = 'Q25 3.65/4.00 cs LIVE'
        const vertical = 'WTI v25 75/85 cs x65.35 TRADES 0.39 8d (750x)'
        const horizontal = 'Brent V25/X25 65 ps x68.10/67.45 TRADES 1.04 25d/35d (600x)'

        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'Q25',
            expiry2: null,
            strikes: [3.65, 4.00],
            strikes2: null,
            strategyType: 'Vertical Call Spread',
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            isCalendarSpread: false,
            isLive: true
        })
    })

    it('parses a Vertical Put Spread', () => {
        const input = 'V25 2.10/2.00 ps LIVE TRADES .0055 (2000x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'V25',
            expiry2: null,
            strikes: [2.10, 2.00],
            strikes2: null,
            strategyType: 'Vertical Put Spread',
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: 0.0055,
            lots: 2000,
            isCalendarSpread: false,
            isLive: true
        })
    })

    // Ratio Spreads
    it('parses a Ratio Call Spread', () => {
        const input = 'U25 3.75/4.00 1x2 cs LIVE TRADES .0290 (250x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'U25',
            expiry2: null,
            strikes: [3.75, 4.00],
            strikes2: null,
            strategyType: 'Call Ratio Spread',
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: 0.0290,
            lots: 250,
            ratio: '1x2',
            isCalendarSpread: false,
            isLive: true
        })
    })

    it('parses a Ratio Put Spread', () => {
        const input = 'N25 3.50/3.25 1x1.5 ps x3.60 15d TRADES .0550 (800x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'N25',
            expiry2: null,
            strikes: [3.50, 3.25],
            strikes2: null,
            strategyType: 'Put Ratio Spread',
            underlying: 3.60,
            underlying2: null,
            delta: 15,
            delta2: null,
            price: 0.0550,
            lots: 800,
            ratio: '1x1.5',
            isCalendarSpread: false,
            isLive: false
        })
    })

    // Butterflies
    it('parses a Put Butterfly', () => {
        const input = 'JV26 3.50/3.25/3.15 put fly LIVE TRADES .0620 (150/mo=1050x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'JV26',
            expiry2: null,
            strikes: [3.50, 3.25, 3.15],
            strikes2: null,
            strategyType: 'Put Fly',
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: 0.0620,
            lots: 150,
            isCalendarSpread: false,
            isLive: true
        })
    })

    // Straddles and Strangles
    it('parses a Straddle', () => {
        const input = 'SDO 3.25 strad LIVE TRADES .0800 (25x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'SDO',
            expiry2: null,
            strikes: [3.25],
            strikes2: null,
            strategyType: 'Straddle',
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: 0.0800,
            lots: 25,
            isCalendarSpread: false,
            isLive: true
        })
    })

    it('parses a Strangle', () => {
        const input = 'U25 3.00/4.50 strangle TRADES .1200 (100x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'U25',
            expiry2: null,
            strikes: [3.00, 4.50],
            strikes2: null,
            strategyType: 'Strangle',
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: 0.1200,
            lots: 100,
            isCalendarSpread: false,
            isLive: false
        })
    })

    // Fences
    it('parses a Fence', () => {
        const input = 'U25 2.75/4.25 fence x3.31 27d TRADES .0260 (400x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'U25',
            expiry2: null,
            strikes: [2.75, 4.25],
            strikes2: null,
            strategyType: 'Fence',
            underlying: 3.31,
            underlying2: null,
            delta: 27,
            delta2: null,
            price: 0.0260,
            lots: 400,
            isCalendarSpread: false,
            isLive: false
        })
    })

    it('parses a Ratio Fence', () => {
        const input = 'UV25 4.00/3.00 1x1.5 fence x3.71 70d TRADES .1160 (500/mo=1000x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'UV25',
            expiry2: null,
            strikes: [4.00, 3.00],
            strikes2: null,
            strategyType: 'Fence',
            underlying: 3.71,
            underlying2: null,
            delta: 70,
            delta2: null,
            price: 0.1160,
            lots: 500,
            ratio: '1x1.5',
            isCalendarSpread: false,
            isLive: false
        })
    })

    // Calendar Spreads
    it('parses a Horizontal Call Spread (Calendar)', () => {
        const input = 'X25 6.00c x4.00 vs. Z25 7.00c x4.58 8d 13d TRADES .0380 (100x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'X25',
            expiry2: 'Z25',
            strikes: [6.00],
            strikes2: [7.00],
            strategyType: 'Horizontal Call Spread',
            underlying: 4.00,
            underlying2: 4.58,
            delta: 8,
            delta2: 13,
            price: 0.0380,
            lots: 100,
            isCalendarSpread: true,
            isLive: false
        })
    })

    it('parses a Hedged Call (Call vs Future)', () => {
        const input = 'Q25 4.25 Call x3.65 28d TRADES .1160 (100x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'Q25',
            expiry2: null,
            strikes: [4.25],
            strikes2: null,
            strategyType: 'Call Option',
            underlying: 3.65,
            underlying2: null,
            delta: 28,
            delta2: null,
            price: 0.1160,
            lots: 100,
            isCalendarSpread: false,
            isLive: false
        })
    })

    // Three-Way Strategies
    it('parses a 3-Way: Put vs Call Spread', () => {
        const input = 'V25 2.75p vs. 4.00/5.50cs x3.75 45d TRADES .1825 (250x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'V25',
            expiry2: null,
            strikes: [2.75],
            strikes2: [4.00, 5.50],
            strategyType: '3-Way: Put Spread v Call',
            underlying: 3.75,
            underlying2: null,
            delta: 45,
            delta2: null,
            price: 0.1825,
            lots: 250,
            isCalendarSpread: false,
            isLive: false
        })
    })

    // Iron Condors
    it('parses an Iron Condor', () => {
        const input = 'H26 2.50/3.00/4.50/5.00 iron condor TRADES .0850 (200x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'H26',
            expiry2: null,
            strikes: [2.50, 3.00, 4.50, 5.00],
            strikes2: null,
            strategyType: 'Iron Condor',
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: 0.0850,
            lots: 200,
            isCalendarSpread: false,
            isLive: false
        })
    })

    // Iron Butterfly
    it('parses an Iron Butterfly', () => {
        const input = 'V25 3.25/3.75/4.25 iron fly TRADES .0620 (150x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'V25',
            expiry2: null,
            strikes: [3.25, 3.75, 4.25],
            strikes2: null,
            strategyType: 'Iron Butterfly',
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: 0.0620,
            lots: 150,
            isCalendarSpread: false,
            isLive: false
        })
    })

    // Call and Put Trees (extended ratio spreads)
    it('parses a Call Tree', () => {
        const input = 'U25 3.50/4.00/4.50 1x2x1 call tree TRADES .0180 (100x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'U25',
            expiry2: null,
            strikes: [3.50, 4.00, 4.50],
            strikes2: null,
            strategyType: 'Call Tree',
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: 0.0180,
            lots: 100,
            ratio: '1x2x1',
            isCalendarSpread: false,
            isLive: false
        })
    })

    // Condors
    it('parses a Call Condor', () => {
        const input = 'Z25 3.00/3.25/4.25/4.50 call condor TRADES .0420 (200x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'Z25',
            expiry2: null,
            strikes: [3.00, 3.25, 4.25, 4.50],
            strikes2: null,
            strategyType: 'Call Condor',
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: 0.0420,
            lots: 200,
            isCalendarSpread: false,
            isLive: false
        })
    })

    // Conversion/Reversal
    it('parses a Conversion', () => {
        const input = 'H26 3.75 conversion x3.75 TRADES .0050 (100x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'H26',
            expiry2: null,
            strikes: [3.75],
            strikes2: null,
            strategyType: 'Conversion/Reversal',
            underlying: 3.75,
            underlying2: null,
            delta: null,
            delta2: null,
            price: 0.0050,
            lots: 100,
            isCalendarSpread: false,
            isLive: false
        })
    })
})










// describe('parseTradeInput()', () => {
//
//     it('parses a Call Option', () => {
//         const input = 'Z25 70c'
//         const out = parseTradeInput(input)
//
//         expect(out).toEqual({
//             exchange: null,
//             expiry: 'U25',
//             expiry2: null,
//             strikes: [3.50, 3.75],
//             strikes2: null,
//             strategyType: 'Call Spread',
//             underlying: 3.15,
//             underlying2: null,
//             delta: 12,
//             delta2: null,
//             price: 0.0470,
//             lots: 500,
//             isCalendarSpread: false,
//             isLive: false
//         })
//     })
//     it('parses a simple call spread with delta and lots', () => {
//         const input = 'U25 3.50/3.75cs x3.15 12d TRADES .0470 (500x)'
//         const out = parseTradeInput(input)
//
//         expect(out).toEqual({
//             exchange: null,
//             expiry: 'U25',
//             expiry2: null,
//             strikes: [3.50, 3.75],
//             strikes2: null,
//             strategyType: 'Call Spread',
//             underlying: 3.15,
//             underlying2: null,
//             delta: 12,
//             delta2: null,
//             price: 0.0470,
//             lots: 500,
//             isCalendarSpread: false,
//             isLive: false
//         })
//     })
//
//     it('handles a vs‑calendar leg', () => {
//         const input = 'Z25 4.00p x4.34 vs. V25 4.00c x3.37 32d/28d TRADES .1950 (100x)'
//         const out = parseTradeInput(input)
//
//         expect(out).toEqual({
//             exchange: null,
//             expiry: 'Z25',
//             expiry2: 'V25',
//             strikes: [4.00],
//             strikes2: [4.00],
//             strategyType: 'Calendar Single Option',
//             underlying: 4.34,
//             underlying2: 3.37,
//             delta: 32,
//             delta2: 28,
//             price: 0.1950,
//             lots: 100,
//             isCalendarSpread: true,
//             isLive: false
//         })
//     })
//
//     it('handles a fence', () => {
//         const input = 'H26 3.25/8.00 fence x3.87 21/21.25 38d'
//         const out = parseTradeInput(input)
//
//         expect(out).toEqual({
//             exchange: null,
//             expiry: 'H26',
//             expiry2: null,
//             strikes: [3.25,8.00],
//             strikes2: [21,21.5],
//             strategyType: 'Fence',
//             underlying: 3.87,
//             underlying2: null,
//             delta: 38,
//             delta2: null,
//             price: null,
//             lots: 100,
//             isCalendarSpread: false,
//             isLive: false
//         })
//     })
//
//     // …and so on for each pattern you care about
// })
//

// Additional test cases for parseTradeInput based on your trading confirms