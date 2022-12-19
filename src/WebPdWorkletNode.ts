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

export default class WebPdWorkletNode extends AudioWorkletNode {
    override port: WebPdWorkletNodeMessagePort

    constructor(
        context: AudioContext,
    ) {
        super(context, 'webpd-node', {
            numberOfOutputs: 1,
            processorOptions: {
                sampleRate: context.sampleRate
            },
        })
    }
}

interface WebPdWorkletNodeMessagePort extends MessagePort {
    postMessage(message: WebPdWorkletNodeMessage, transfer: Transferable[]): void
    postMessage(
        message: WebPdWorkletNodeMessage,
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

type WebPdWorkletNodeMessage = SetWasmMessage | SetJsMessage