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

import { EngineFs, EngineFsCallbacks } from '@webpd/compiler-js'

export default class WebPdWorkletNode extends AudioWorkletNode {
    override port: WebPdWorkletNodeMessagePort

    constructor(context: AudioContext) {
        super(context, 'webpd-node', {
            numberOfOutputs: 1,
            processorOptions: {
                sampleRate: context.sampleRate,
            },
        })
    }
}

interface WebPdWorkletNodeMessagePort extends MessagePort {
    postMessage(message: OutgoingMessage, transfer: Transferable[]): void
    postMessage(
        message: OutgoingMessage,
        options?: StructuredSerializeOptions
    ): void
    onmessage(messageEvent: MessageEvent<IncomingMessage>): void
}

interface SetWasmMessage {
    type: 'code:WASM'
    payload: {
        wasmBuffer: ArrayBuffer
        arrays: { [arrayName: string]: Float32Array | Float64Array }
    }
}

interface SetJsMessage {
    type: 'code:JS'
    payload: {
        jsCode: string
        arrays: { [arrayName: string]: Float32Array | Float64Array }
    }
}

interface FsReadSoundFileResponse {
    type: 'fs'
    payload: {
        functionName: 'readSoundFileResponse'
        arguments: Parameters<EngineFs['readSoundFileResponse']>
    }
}

type OutgoingMessage = SetWasmMessage | SetJsMessage | FsReadSoundFileResponse

interface FsRequestReadSoundFile {
    type: 'fs'
    payload: {
        functionName: 'readSound'
        arguments: Parameters<EngineFsCallbacks['readSound']>
    }
}

export type IncomingMessage = FsRequestReadSoundFile
