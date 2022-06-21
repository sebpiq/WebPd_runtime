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
    port: WasmWorkletNodeMessagePort
    constructor(context: AudioContext, channelCount: number) {
        super(context, 'wasm-node', { numberOfOutputs: 1, outputChannelCount: [channelCount] })
    }
}

interface WasmWorkletNodeMessagePort extends MessagePort {
    postMessage(message: WasmWorkletNodeMessage, transfer: Transferable[]): void;
    postMessage(message: WasmWorkletNodeMessage, options?: StructuredSerializeOptions): void;
}

interface SetProcessorMessage {
    type: 'WASM'
    payload: {
        wasmBuffer: ArrayBuffer
        arrays: { [arrayName: string]: Float32Array }
    }
}

type WasmWorkletNodeMessage = SetProcessorMessage