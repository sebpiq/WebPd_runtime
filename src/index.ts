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

export { default as WebPdWorkletNode } from './WebPdWorkletNode'
import _WebPdWorkletProcessorCode from './WebPdWorkletProcessor.js'
import AssemblyscriptWasmBindingsCode from '../node_modules/@webpd/compiler-js/dist/assemblyscript-wasm-bindings.iife.js'
import { addModule } from './utils'
// Concatenate WorkletProcessor code with the Wasm bindings it needs
export const WebPdWorkletProcessorCode =
    AssemblyscriptWasmBindingsCode + ';\n' + _WebPdWorkletProcessorCode

export const registerWebPdWorkletNode = (context: AudioContext) => {
    return addModule(context, WebPdWorkletProcessorCode)
}
