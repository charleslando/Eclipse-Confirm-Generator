//src/utils/parseTradeInput.test.js
import { TradeParser } from '../utils/TradeParser.js'
import { describe, it, expect } from 'vitest'

const parser = new TradeParser()

describe('TradeParser.parse() - Additional Strategy Examples', () => {

    // Basic Options
    it('Live Call Option', () => {
        const input = 'Z25 5.00c LIVE'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'Z25',
            expiry2: 'Z25',
            strikes: [5.00],
            strikes2: [5.00],
            strategyType: 'Call Option',
            underlying: 0,
            underlying2: 0,
            delta: 0,
            delta2: 0,
            price: null,
            isLive: true,
            isVersus: false,
            ratio: undefined
        })
    })

    it('Live Call Option With Trades', () => {
        const input = 'V25 4.50c LIVE TRADES 0.290'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'V25',
            expiry2: 'V25',
            strikes: [4.50],
            strikes2: [4.50],
            strategyType: 'Call Option',
            underlying: 0,
            underlying2: 0,
            delta: 0,
            delta2: 0,
            price: 0.290,
            isLive: true,
            isVersus: false,
            ratio: undefined
        })
    })

    it('Hedged Call Option', () => {
        const input = 'J26 4.50c x3.58 32d'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'J26',
            expiry2: 'J26',
            strikes: [4.50],
            strikes2: [4.50],
            strategyType: 'Call Option',
            underlying: 3.58,
            underlying2: 3.58,
            delta: 32,
            delta2: 32,
            price: null,
            isLive: false,
            isVersus: false,
            ratio: undefined
        })
    })

    it('Hedged Call Option With Trades', () => {
        const input = 'J26 4.50c x3.58 32d TRADES 0.250'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'J26',
            expiry2: 'J26',
            strikes: [4.50],
            strikes2: [4.50],
            strategyType: 'Call Option',
            underlying: 3.58,
            underlying2: 3.58,
            delta: 32,
            delta2: 32,
            price: 0.250,
            isLive: false,
            isVersus: false,
            ratio: undefined
        })
    })

    it('Live Put Option', () => {
        const input = 'Z25 3.25p LIVE'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'Z25',
            expiry2: 'Z25',
            strikes: [3.25],
            strikes2: [3.25],
            strategyType: 'Put Option',
            underlying: 0,
            underlying2: 0,
            delta: 0,
            delta2: 0,
            price: null,
            isLive: true,
            isVersus: false,
            ratio: undefined
        })
    })

    it('Live Put Option With Trades', () => {
        const input = 'Z25 3.25p LIVE TRADES 0.0125'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'Z25',
            expiry2: 'Z25',
            strikes: [3.25],
            strikes2: [3.25],
            strategyType: 'Put Option',
            underlying: 0,
            underlying2: 0,
            delta: 0,
            delta2: 0,
            price: 0.0125,
            isLive: true,
            isVersus: false,
            ratio: undefined
        })
    })

    it('Hedged Put Option', () => {
        const input = 'Q25 3.00p x3.25 15d'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'Q25',
            expiry2: 'Q25',
            strikes: [3.00],
            strikes2: [3.00],
            strategyType: 'Put Option',
            underlying: 3.25,
            underlying2: 3.25,
            delta: 15,
            delta2: 15,
            price: null,
            isLive: false,
            isVersus: false,
            ratio: undefined
        })
    })

    it('Hedged Put Option With Trades', () => {
        const input = 'Q25 3.00p x3.25 15d TRADES 0.015'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'Q25',
            expiry2: 'Q25',
            strikes: [3.00],
            strikes2: [3.00],
            strategyType: 'Put Option',
            underlying: 3.25,
            underlying2: 3.25,
            delta: 15,
            delta2: 15,
            price: 0.015,
            isLive: false,
            isVersus: false,
            ratio: undefined
        })
    })

    // Vertical Spreads
    it('Live Vertical Call Spread', () => {
        const input = 'Q25 3.65/4.00 cs LIVE'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'Q25',
            expiry2: 'Q25',
            strikes: [3.65, 4.00],
            strikes2: [3.65, 4.00],
            strategyType: 'Call Spread',
            underlying: 0,
            underlying2: 0,
            delta: 0,
            delta2: 0,
            price: null,
            isLive: true,
            isVersus: false,
            ratio: undefined
        })
    })

    it('parses a Vertical Put Spread', () => {
        const input = 'V25 2.10/2.00 ps LIVE'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'V25',
            expiry2: 'V25',
            strikes: [2.10, 2.00],
            strikes2: [2.10, 2.00],
            strategyType: 'Put Spread',
            underlying: 0,
            underlying2: 0,
            delta: 0,
            delta2: 0,
            price: null,
            isLive: true,
            isVersus: false,
            ratio: undefined
        })
    })

    // Ratio Spreads
    it('parses a Ratio Call Spread', () => {
        const input = 'U25 3.75/4.00 1x2 cs LIVE'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'U25',
            expiry2: 'U25',
            strikes: [3.75, 4.00],
            strikes2: [3.75, 4.00],
            strategyType: 'Call Spread',
            underlying: 0,
            underlying2: 0,
            delta: 0,
            delta2: 0,
            price: null,
            isLive: true,
            isVersus: false,
            ratio: '1x2'
        })
    })

    it('parses a Ratio Put Spread', () => {
        const input = 'N25 3.50/3.25 1x1.5 ps x3.60 15d'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'N25',
            expiry2: 'N25',
            strikes: [3.50, 3.25],
            strikes2: [3.50, 3.25],
            strategyType: 'Put Spread',
            underlying: 3.60,
            underlying2: 3.60,
            delta: 15,
            delta2: 15,
            price: null,
            isLive: false,
            isVersus: false,
            ratio: '1x1.5'
        })
    })

    // Butterflies
    it('parses a Put Butterfly', () => {
        const input = 'JV26 3.50/3.25/3.15 put fly LIVE'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'Summer 26',
            expiry2: 'Summer 26',
            strikes: [3.50, 3.25, 3.15],
            strikes2: [3.50, 3.25, 3.15],
            strategyType: 'Put Fly',
            underlying: 0,
            underlying2: 0,
            delta: 0,
            delta2: 0,
            price: null,
            isLive: true,
            isVersus: false,
            ratio: undefined
        })
    })

    // Straddles and Strangles
    it('parses a Straddle', () => {
        const input = 'Z25 3.25 strad LIVE'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'Z25',
            expiry2: 'Z25',
            strikes: [3.25],
            strikes2: [3.25],
            strategyType: 'Straddle',
            underlying: 0,
            underlying2: 0,
            delta: 0,
            delta2: 0,
            price: null,
            isLive: true,
            isVersus: false,
            ratio: undefined
        })
    })

    it('parses a Strangle', () => {
        const input = 'U25 3.00/4.50 strangle'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'U25',
            expiry2: 'U25',
            strikes: [3.00, 4.50],
            strikes2: [3.00, 4.50],
            strategyType: 'Strangle',
            underlying: 0,
            underlying2: 0,
            delta: 0,
            delta2: 0,
            price: null,
            isLive: false,
            isVersus: false,
            ratio: undefined
        })
    })

    // Fences
    it('parses a Fence', () => {
        const input = 'U25 2.75/4.25 fence x3.31 27d'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'U25',
            expiry2: 'U25',
            strikes: [2.75, 4.25],
            strikes2: [2.75, 4.25],
            strategyType: 'Fence',
            underlying: 3.31,
            underlying2: 3.31,
            delta: 27,
            delta2: 27,
            price: null,
            isLive: false,
            isVersus: false,
            ratio: undefined
        })
    })

    // Three-Way Strategies
    it('parses a 3-Way: Put vs Call Spread', () => {
        const input = 'V25 2.75p vs. 4.00/5.50cs x3.75 45d'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'V25',
            expiry2: 'V25',
            strikes: [2.75],
            strikes2: [4.00, 5.50],
            strategyType: '3-Way: Put Spread v Call',
            underlying: 3.75,
            underlying2: 3.75,
            delta: 45,
            delta2: 45,
            price: null,
            isLive: false,
            isVersus: true,
            ratio: undefined
        })
    })

    // Iron Condors
    it('parses an Iron Condor', () => {
        const input = 'H26 2.50/3.00/4.50/5.00 iron condor'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'H26',
            expiry2: 'H26',
            strikes: [2.50, 3.00],
            strikes2: [4.50, 5.00],
            strategyType: 'Iron Condor',
            underlying: 0,
            underlying2: 0,
            delta: 0,
            delta2: 0,
            price: null,
            isLive: false,
            isVersus: false,
            ratio: undefined
        })
    })

    // Iron Butterfly
    it('parses an Iron Butterfly', () => {
        const input = 'V25 3.25/3.75/4.25 iron fly'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'V25',
            expiry2: 'V25',
            strikes: [3.25, 3.75],
            strikes2: [3.75, 4.25],
            strategyType: 'Iron Butterfly',
            underlying: 0,
            underlying2: 0,
            delta: 0,
            delta2: 0,
            price: null,
            isLive: false,
            isVersus: false,
            ratio: undefined
        })
    })

    // Conversion/Reversal
    it('parses a Conversion', () => {
        const input = 'H26 3.75 conversion x3.75'
        const out = parser.parse(input)

        expect(out).toEqual({
            exchange: '',
            expiry: 'H26',
            expiry2: 'H26',
            strikes: [3.75],
            strikes2: [3.75],
            strategyType: 'Conversion/Reversal',
            underlying: 3.75,
            underlying2: 3.75,
            delta: 0,
            delta2: 0,
            price: null,
            isLive: false,
            isVersus: false,
            ratio: undefined
        })
    })
})