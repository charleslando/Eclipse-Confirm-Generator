//src/utils/parseTradeInput.test.js
import { parseTradeInput } from '../utils/TradeCreator.js'
import { describe, it, expect } from 'vitest'

//bugs
//V25 2.25/1.85 1x2 ps
//V25 3.00/2.50/2.25 put fly (2x) vs 4.00c x3.15 48d

describe('parseTradeInput() - Additional Strategy Examples', () => {

    // Basic Options (you already have these)
    it('Live Call Option', () => {
        const input = 'Z25 5.00c LIVE'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'Z25',
            expiry2: null,
            strikes: [5.00],
            strikes2: null,
            strategyType: 'Call Option',
            strategyType2: null,
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: true
        })
    })

    it('Live Call Option With Trades', () => {
        const input = 'V25 4.50c LIVE TRADES 0.290 (200x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'V25',
            expiry2: null,
            strikes: [4.50],
            strikes2: null,
            strategyType: 'Call Option',
            strategyType2: null,
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: 0.290,
            lots: 200,
            isDualStructure: false,
            isLive: true
        })
    })

    it('Hedged Call Option', () => {
        const input = 'J26 4.50c x3.58 32d'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'J26',
            expiry2: null,
            strikes: [4.50],
            strikes2: null,
            strategyType: 'Call Option',
            strategyType2: null,
            underlying: 3.58,
            underlying2: null,
            delta: 32,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: false
        })
    })

    it('Hedged Call Option With Trades', () => {
        const input = 'J26 4.50c x3.58 32d TRADES 0.250 (300x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'J26',
            expiry2: null,
            strikes: [4.50],
            strikes2: null,
            strategyType: 'Call Option',
            strategyType2: null,
            underlying: 3.58,
            underlying2: null,
            delta: 32,
            delta2: null,
            price: 0.250,
            lots: 300,
            isDualStructure: false,
            isLive: false
        })
    })

    it('Live Put Option', () => {
        const input = 'Z25 3.25p LIVE'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'Z25',
            expiry2: null,
            strikes: [3.25],
            strikes2: null,
            strategyType: 'Put Option',
            strategyType2: null,
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: true
        })
    })
    it('Live Put Option With Trades', () => {
        const input = 'Z25 3.25p LIVE TRADES 0.0125 (200x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'Z25',
            expiry2: null,
            strikes: [3.25],
            strikes2: null,
            strategyType: 'Put Option',
            strategyType2: null,
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: 0.0125,
            lots: 200,
            isDualStructure: false,
            isLive: true
        })
    })
    it('Hedged Put Option', () => {
        const input = 'Q25 3.00p x3.25 15d'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'Q25',
            expiry2: null,
            strikes: [3.00],
            strikes2: null,
            strategyType: 'Put Option',
            strategyType2: null,
            underlying: 3.25,
            underlying2: null,
            delta: 15,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: false
        })
    })

    it('Hedged Put Option With Trades', () => {
        const input = 'Q25 3.00p x3.25 15d TRADES 0.015 (150x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'Q25',
            expiry2: null,
            strikes: [3.00],
            strikes2: null,
            strategyType: 'Put Option',
            strategyType2: null,
            underlying: 3.25,
            underlying2: null,
            delta: 15,
            delta2: null,
            price: 0.015,
            lots: 150,
            isDualStructure: false,
            isLive: false
        })
    })

    // Vertical Spreads
    it('Live Vertical Call Spread', () => {
        const input = 'Q25 3.65/4.00 cs LIVE'

        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'Q25',
            expiry2: null,
            strikes: [3.65, 4.00],
            strikes2: null,
            strategyType: 'Vertical Call Spread',
            strategyType2: null,
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: true
        })
    })



    it('parses a Vertical Put Spread', () => {
        const input = 'V25 2.10/2.00 ps LIVE'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'V25',
            expiry2: null,
            strikes: [2.10, 2.00],
            strikes2: null,
            strategyType: 'Vertical Put Spread',
            strategyType2: null,
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: true
        })
    })

    // Ratio Spreads
    it('parses a Ratio Call Spread', () => {
        const input = 'U25 3.75/4.00 1x2 cs LIVE'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'U25',
            expiry2: null,
            strikes: [3.75, 4.00],
            strikes2: null,
            strategyType: 'Call Ratio Spread',
            strategyType2: null,
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            ratio: '1x2',
            isDualStructure: false,
            isLive: true
        })
    })

    it('parses a Ratio Put Spread', () => {
        const input = 'N25 3.50/3.25 1x1.5 ps x3.60 15d'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'N25',
            expiry2: null,
            strikes: [3.50, 3.25],
            strikes2: null,
            strategyType: 'Put Ratio Spread',
            strategyType2: null,
            underlying: 3.60,
            underlying2: null,
            delta: 15,
            delta2: null,
            price: null,
            lots: 100,
            ratio: '1x1.5',
            isDualStructure: false,
            isLive: false
        })
    })

    // Butterflies
    it('parses a Put Butterfly', () => {
        const input = 'JV26 3.50/3.25/3.15 put fly LIVE'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'JV26',
            expiry2: null,
            strikes: [3.50, 3.25, 3.15],
            strikes2: null,
            strategyType: 'Put Fly',
            strategyType2: null,
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: true
        })
    })

    // Straddles and Strangles
    it('parses a Straddle', () => {
        const input = 'SDO 3.25 strad LIVE'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'SDO',
            expiry2: null,
            strikes: [3.25],
            strikes2: null,
            strategyType: 'Straddle',
            strategyType2: null,
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: true
        })
    })

    it('parses a Strangle', () => {
        const input = 'U25 3.00/4.50 strangle'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'U25',
            expiry2: null,
            strikes: [3.00, 4.50],
            strikes2: null,
            strategyType: 'Strangle',
            strategyType2: null,
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: false
        })
    })

    // Fences
    it('parses a Fence', () => {
        const input = 'U25 2.75/4.25 fence x3.31 27d'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'U25',
            expiry2: null,
            strikes: [2.75, 4.25],
            strikes2: null,
            strategyType: 'Fence',
            strategyType2: null,
            underlying: 3.31,
            underlying2: null,
            delta: 27,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: false
        })
    })

    it('parses a Ratio Fence', () => {
        const input = 'UV25 4.00/3.00 1x1.5 fence x3.71 70d'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'UV25',
            expiry2: null,
            strikes: [4.00, 3.00],
            strikes2: null,
            strategyType: 'Fence',
            strategyType2: null,
            underlying: 3.71,
            underlying2: null,
            delta: 70,
            delta2: null,
            price: null,
            lots: 100,
            ratio: '1x1.5',
            isDualStructure: false,
            isLive: false
        })
    })

    // Calendar Spreads
    it('parses a Horizontal Call Spread (Calendar)', () => {
        const input = 'X25 6.00c x4.00 vs. Z25 7.00c x4.58 8d 13d'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'X25',
            expiry2: 'Z25',
            strikes: [6.00],
            strikes2: [7.00],
            strategyType: 'Horizontal Call Spread',
            strategyType2: null,
            underlying: 4.00,
            underlying2: 4.58,
            delta: 8,
            delta2: 13,
            price: null,
            lots: 100,
            isDualStructure: true,
            isLive: false
        })
    })


    // Three-Way Strategies
    it('parses a 3-Way: Put vs Call Spread', () => {
        const input = 'V25 2.75p vs. 4.00/5.50cs x3.75 45d'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'V25',
            expiry2: null,
            strikes: [2.75],
            strikes2: [4.00, 5.50],
            strategyType: '3-Way: Put Spread v Call',
            strategyType2: null,
            underlying: 3.75,
            underlying2: null,
            delta: 45,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: false
        })
    })

    // Iron Condors
    it('parses an Iron Condor', () => {
        const input = 'H26 2.50/3.00/4.50/5.00 iron condor'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'H26',
            expiry2: null,
            strikes: [2.50, 3.00, 4.50, 5.00],
            strikes2: null,
            strategyType: 'Iron Condor',
            strategyType2: null,
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: false
        })
    })

    // Iron Butterfly
    it('parses an Iron Butterfly', () => {
        const input = 'V25 3.25/3.75/4.25 iron fly'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'V25',
            expiry2: null,
            strikes: [3.25, 3.75, 4.25],
            strikes2: null,
            strategyType: 'Iron Butterfly',
            strategyType2: null,
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: false
        })
    })

    // Call and Put Trees (extended ratio spreads)
    it('parses a Call Tree', () => {
        const input = 'U25 3.50/4.00/4.50 1x2x1 call tree'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'U25',
            expiry2: null,
            strikes: [3.50, 4.00, 4.50],
            strikes2: null,
            strategyType: 'Call Tree',
            strategyType2: null,
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            ratio: '1x2x1',
            isDualStructure: false,
            isLive: false
        })
    })

    // Condors
    it('parses a Call Condor', () => {
        const input = 'Z25 3.00/3.25/4.25/4.50 call condor'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'Z25',
            expiry2: null,
            strikes: [3.00, 3.25, 4.25, 4.50],
            strikes2: null,
            strategyType: 'Call Condor',
            strategyType2: null,
            underlying: null,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: false
        })
    })

    // Conversion/Reversal
    it('parses a Conversion', () => {
        const input = 'H26 3.75 conversion x3.75'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'H26',
            expiry2: null,
            strikes: [3.75],
            strikes2: null,
            strategyType: 'Conversion/Reversal',
            strategyType2: null,
            underlying: 3.75,
            underlying2: null,
            delta: null,
            delta2: null,
            price: null,
            lots: 100,
            isDualStructure: false,
            isLive: false
        })
    })
})
