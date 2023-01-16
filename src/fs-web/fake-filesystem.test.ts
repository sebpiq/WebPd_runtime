/*
 * Copyright (c) 2012-2020 Sébastien Piquemal <sebpiq@gmail.com>
 *
 * BSD Simplified License.
 * For information on usage and redistribution, and for a DISCLAIMER OF ALL
 * WARRANTIES, see the file, "LICENSE.txt," in this distribution.
 *
 * See https://github.com/sebpiq/WebPd_pd-parser for documentation
 *
 */

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ test: 100 }),
    })
) as jest.Mock

describe('fake-filesystem', () => {
    describe('read', () => {})
})
