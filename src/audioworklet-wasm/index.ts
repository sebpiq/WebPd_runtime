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

export { default as WorkletNode } from './WasmWorkletNode'
import _WorkletProcessorCode from './WasmWorkletProcessor.js'
import AcmWasmBindingsCode from '../../node_modules/@webpd/compiler-js/dist/assemblyscript-wasm-bindings.iife.js'
// Concatenate WorkletProcessor code with the Wasm bindings it needs
export const WorkletProcessorCode = AcmWasmBindingsCode + ';\n' + _WorkletProcessorCode
