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

import { IncomingMessage, OutgoingMessage } from './types'
import WEB_PD_WORKLET_PROCESSOR_CODE from './assets/WebPdWorkletProcessor.js.txt'
import ASSEMBLY_SCRIPT_WASM_BINDINGS_CODE from '@webpd/compiler/dist/assemblyscript-wasm-bindings.iife'
import JAVA_SCRIPT_BINDINGS_CODE from '@webpd/compiler/dist/javascript-bindings.iife'
import { addModule } from './utils'

export type WebPdWorkletNodeMessageHandler = (
    messageEvent: MessageEvent<IncomingMessage>
) => void

interface WebPdWorkletNodeMessagePort extends MessagePort {
    postMessage(message: OutgoingMessage, transfer: Transferable[]): void
    postMessage(
        message: OutgoingMessage,
        options?: StructuredSerializeOptions
    ): void
    onmessage: (messageEvent: MessageEvent<IncomingMessage>) => void
}

// TODO : manage transferables
export default class WebPdWorkletNode extends AudioWorkletNode {
    override port: WebPdWorkletNodeMessagePort

    constructor(context: AudioContext) {
        super(context, 'webpd-node', {
            numberOfOutputs: 1,
            outputChannelCount: [2],
        })
    }

    destroy() {
        this.port.postMessage({
            type: 'destroy',
            payload: {},
        })
    }
}

// Concatenate WorkletProcessor code with the Wasm bindings it needs
const WEBPD_WORKLET_PROCESSOR_CODE =
    ASSEMBLY_SCRIPT_WASM_BINDINGS_CODE +
    ';\n' +
    JAVA_SCRIPT_BINDINGS_CODE +
    ';\n' +
    WEB_PD_WORKLET_PROCESSOR_CODE

export const registerWebPdWorkletNode = (context: AudioContext) => {
    return addModule(context, WEBPD_WORKLET_PROCESSOR_CODE)
}
