/*
 * Copyright (c) 2022-2023 Sébastien Piquemal <sebpiq@protonmail.com>, Chris McCormick.
 *
 * This file is part of WebPd 
 * (see https://github.com/sebpiq/WebPd).
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

export { default as WebPdWorkletNode } from './WebPdWorkletNode'
import _WebPdWorkletProcessorCode from './WebPdWorkletProcessor.generated'
import AssemblyScriptWasmBindingsCode from '@webpd/compiler/dist/assemblyscript-wasm-bindings.iife'
import JavaScriptBindingsCode from '@webpd/compiler/dist/javascript-bindings.iife'
import { addModule } from './utils'
// Concatenate WorkletProcessor code with the Wasm bindings it needs
export const WebPdWorkletProcessorCode =
    AssemblyScriptWasmBindingsCode + ';\n' + JavaScriptBindingsCode + ';\n' + _WebPdWorkletProcessorCode

export const registerWebPdWorkletNode = (context: AudioContext) => {
    return addModule(context, WebPdWorkletProcessorCode)
}
