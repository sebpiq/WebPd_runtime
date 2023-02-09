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
import { Message } from '@webpd/compiler-js/src/types'

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

interface InletCallerMessage {
    type: 'inletCaller'
    payload: {
        nodeId: string
        portletId: string
        message: Message
    }
}

interface FsReadSoundFileResponse {
    type: 'fs'
    payload: {
        functionName: 'sendReadSoundFileResponse'
        arguments: Parameters<Engine['fs']['sendReadSoundFileResponse']>
    }
}

interface FsWriteSoundFileResponse {
    type: 'fs'
    payload: {
        functionName: 'sendWriteSoundFileResponse'
        arguments: Parameters<Engine['fs']['sendWriteSoundFileResponse']>
    }
}

interface FsSoundStreamData {
    type: 'fs'
    payload: {
        functionName: 'sendSoundStreamData'
        arguments: Parameters<Engine['fs']['sendSoundStreamData']>
    }
}

interface FsSoundStreamClose {
    type: 'fs'
    payload: {
        functionName: 'closeSoundStream'
        arguments: Parameters<Engine['fs']['closeSoundStream']>
    }
}

interface DestroyMessage {
    type: 'destroy'
    payload: {}
}

export type OutgoingMessage =
    | SetWasmMessage
    | SetJsMessage
    | FsReadSoundFileResponse
    | FsSoundStreamData
    | FsSoundStreamClose
    | FsWriteSoundFileResponse
    | DestroyMessage
    | InletCallerMessage

export interface FsOnReadSoundFile {
    type: 'fs'
    payload: {
        functionName: 'onReadSoundFile'
        arguments: Parameters<Engine['fs']['onReadSoundFile']>
    }
}

export interface FsOnWriteSoundFile {
    type: 'fs'
    payload: {
        functionName: 'onWriteSoundFile'
        arguments: Parameters<Engine['fs']['onWriteSoundFile']>
    }
}

export interface FsOnOpenSoundReadStream {
    type: 'fs'
    payload: {
        functionName: 'onOpenSoundReadStream'
        arguments: Parameters<Engine['fs']['onOpenSoundReadStream']>
    }
}

export interface FsOnOpenSoundWriteStream {
    type: 'fs'
    payload: {
        functionName: 'onOpenSoundWriteStream'
        arguments: Parameters<Engine['fs']['onOpenSoundWriteStream']>
    }
}

export interface FsOnSoundStreamData {
    type: 'fs'
    payload: {
        functionName: 'onSoundStreamData'
        arguments: Parameters<Engine['fs']['onSoundStreamData']>
    }
}

export interface FsOnCloseSoundStream {
    type: 'fs'
    payload: {
        functionName: 'onCloseSoundStream'
        arguments: Parameters<Engine['fs']['onCloseSoundStream']>
    }
}

export interface FsSendSoundStreamDataReturn {
    type: 'fs'
    payload: {
        functionName: 'sendSoundStreamData_return'
        operationId: number
        returned: ReturnType<Engine['fs']['sendSoundStreamData']>
    }
}

export interface FsCloseSoundStreamReturn {
    type: 'fs'
    payload: {
        functionName: 'closeSoundStream_return'
        operationId: number
        returned: ReturnType<Engine['fs']['closeSoundStream']>
    }
}

export interface FsSendReadSoundFileResponseReturn {
    type: 'fs'
    payload: {
        functionName: 'sendReadSoundFileResponse_return'
        operationId: number
        returned: ReturnType<Engine['fs']['sendReadSoundFileResponse']>
    }
}

export interface FsSendWriteSoundFileResponseReturn {
    type: 'fs'
    payload: {
        functionName: 'sendWriteSoundFileResponse_return'
        operationId: number
        returned: ReturnType<Engine['fs']['sendWriteSoundFileResponse']>
    }
}

export type IncomingMessage =
    | FsOnReadSoundFile
    | FsOnWriteSoundFile
    | FsOnOpenSoundReadStream
    | FsOnOpenSoundWriteStream
    | FsOnSoundStreamData
    | FsOnCloseSoundStream
    | FsSendSoundStreamDataReturn
    | FsCloseSoundStreamReturn
    | FsSendReadSoundFileResponseReturn
    | FsSendWriteSoundFileResponseReturn