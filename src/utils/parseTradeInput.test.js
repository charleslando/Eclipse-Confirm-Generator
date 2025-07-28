// src/utils/parseTradeInput.test.js
import { parseTradeInput } from './parseTradeInput'
import { describe, it, expect } from 'vitest'

describe('parseTradeInput()', () => {
    it('parses a simple call spread with delta and lots', () => {
        const input = 'U25 3.50/3.75cs x3.15 12d TRADES .0470 (500x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'U25',
            expiry2: null,
            strikes: [3.50, 3.75],
            strikes2: null,
            strategyType: 'Call Spread',
            underlying: 3.15,
            underlying2: null,
            delta: 12,
            delta2: null,
            price: 0.0470,
            lots: 500,
            isCalendarSpread: false,
            isLive: false
        })
    })

    it('handles a vs‑calendar leg', () => {
        const input = 'Z25 4.00p x4.34 vs. V25 4.00c x3.37 32d/28d TRADES .1950 (100x)'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'Z25',
            expiry2: 'V25',
            strikes: [4.00],
            strikes2: [4.00],
            strategyType: 'Calendar Single Option',
            underlying: 4.34,
            underlying2: 3.37,
            delta: 32,
            delta2: 28,
            price: 0.1950,
            lots: 100,
            isCalendarSpread: true,
            isLive: false
        })
    })

    it('handles a fence', () => {
        const input = 'H26 3.25/8.00 fence x3.87 21/21.25 38d'
        const out = parseTradeInput(input)

        expect(out).toEqual({
            exchange: null,
            expiry: 'H26',
            expiry2: null,
            strikes: [3.25,8.00],
            strikes2: [21,21.5],
            strategyType: 'Fence',
            underlying: 3.87,
            underlying2: null,
            delta: 38,
            delta2: null,
            price: null,
            lots: 100,
            isCalendarSpread: false,
            isLive: false
        })
    })

    // …and so on for each pattern you care about
})

