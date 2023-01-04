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

import { Engine } from '@webpd/compiler-js'

// TODO : manage transferables
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
        arguments: Parameters<Engine['fs']['readSoundFileResponse']>
    }
}

interface FsSoundStreamData {
    type: 'fs'
    payload: {
        functionName: 'soundStreamData'
        arguments: Parameters<Engine['fs']['soundStreamData']>
    }
}

interface FsSoundStreamClose {
    type: 'fs'
    payload: {
        functionName: 'soundStreamClose'
        arguments: Parameters<Engine['fs']['soundStreamClose']>
    }
}

type OutgoingMessage =
    | SetWasmMessage
    | SetJsMessage
    | FsReadSoundFileResponse
    | FsSoundStreamData
    | FsSoundStreamClose

export interface FsRequestReadSoundFile {
    type: 'fs'
    payload: {
        functionName: 'onRequestReadSoundFile'
        arguments: Parameters<Engine['fs']['onRequestReadSoundFile']>
    }
}

export interface FsRequestReadSoundStream {
    type: 'fs'
    payload: {
        functionName: 'onRequestReadSoundStream'
        arguments: Parameters<Engine['fs']['onRequestReadSoundStream']>
    }
}

export interface FsSoundStreamDataReturn {
    type: 'fs'
    payload: {
        functionName: 'soundStreamData_return'
        operationId: number
        returned: ReturnType<Engine['fs']['soundStreamData']>
    }
}

export interface FsSoundStreamCloseReturn {
    type: 'fs'
    payload: {
        functionName: 'soundStreamClose_return'
        operationId: number
        returned: ReturnType<Engine['fs']['soundStreamClose']>
    }
}

export interface ReadSoundFileResponseReturn {
    type: 'fs'
    payload: {
        functionName: 'readSoundFileResponse_return'
        operationId: number
        returned: ReturnType<Engine['fs']['readSoundFileResponse']>
    }
}

export type IncomingMessage =
    | FsRequestReadSoundFile
    | FsRequestReadSoundStream
    | FsSoundStreamDataReturn
    | ReadSoundFileResponseReturn
    | FsSoundStreamCloseReturn
