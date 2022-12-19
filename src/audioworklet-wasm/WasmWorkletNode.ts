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

export default class WasmWorkletNode extends AudioWorkletNode {
    override port: WasmWorkletNodeMessagePort

    constructor(
        context: AudioContext,
    ) {
        super(context, 'wasm-node', {
            numberOfOutputs: 1,
            processorOptions: {
                sampleRate: context.sampleRate
            },
        })
    }
}

interface WasmWorkletNodeMessagePort extends MessagePort {
    postMessage(message: WasmWorkletNodeMessage, transfer: Transferable[]): void
    postMessage(
        message: WasmWorkletNodeMessage,
        options?: StructuredSerializeOptions
    ): void
}

interface SetWasmMessage {
    type: 'WASM'
    payload: {
        wasmBuffer: ArrayBuffer
        arrays: { [arrayName: string]: Float32Array | Float64Array }
    }
}

interface SetJsMessage {
    type: 'JS'
    payload: {
        jsCode: string
        arrays: { [arrayName: string]: Float32Array | Float64Array }
    }
}

type WasmWorkletNodeMessage = SetWasmMessage | SetJsMessage
