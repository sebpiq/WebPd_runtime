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
    type: 'CODE:WASM'
    payload: {
        wasmBuffer: ArrayBuffer
        arrays: { [arrayName: string]: Float32Array | Float64Array }
    }
}

interface SetJsMessage {
    type: 'CODE:JS'
    payload: {
        jsCode: string
        arrays: { [arrayName: string]: Float32Array | Float64Array }
    }
}

interface FsReadSoundFileResponse {
    type: 'FS:READ_SOUND_FILE_RESPONSE'
    payload: {
        operationId: number
        sound: Array<Float32Array | Float64Array>
    }
}

type OutgoingMessage = SetWasmMessage | SetJsMessage | FsReadSoundFileResponse

interface FsRequestReadSoundFile {
    type: 'FS:REQUEST_READ_SOUND_FILE'
    payload: {
        operationId: number
        url: string
    }
}

export type IncomingMessage = FsRequestReadSoundFile
