import { generateTradeLines } from '../utils/generateTradeLines.js'
import { describe, it, expect } from 'vitest'

describe('generateTradeInput()', () => {
    it('parses a simple call spread with delta and lots', () => {
        const input = {
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
        }
        const out = generateTradeLines(input)

        expect(out).toEqual({

        })
    })

    // …and so on for each pattern you care about
})

