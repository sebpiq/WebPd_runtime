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

type TypedArrayConstructor =
    | typeof Int8Array
    | typeof Uint8Array
    | typeof Int16Array
    | typeof Uint16Array
    | typeof Int32Array
    | typeof Uint32Array
    | typeof Uint8ClampedArray
    | typeof Float32Array
    | typeof Float64Array

export default class WasmWorkletNode extends AudioWorkletNode {
    port: WasmWorkletNodeMessagePort

    /**
     * @param WasmOutputType  Type of TypedArray to use to read the output of the wasm loop.
     */
    constructor(
        context: AudioContext,
        channelCount: number,
        WasmOutputType: TypedArrayConstructor
    ) {
        super(context, 'wasm-node', {
            numberOfOutputs: 1,
            outputChannelCount: [channelCount],
            processorOptions: {
                // Must be sent as a string because it needs to be passed
                // between threads
                WasmOutputType: WasmOutputType.name,
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

interface SetProcessorMessage {
    type: 'WASM'
    payload: {
        wasmBuffer: ArrayBuffer
        arrays: { [arrayName: string]: Float32Array }
    }
}

type WasmWorkletNodeMessage = SetProcessorMessage
