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
import {
    Engine,
    FS_OPERATION_FAILURE,
    FS_OPERATION_SUCCESS,
} from '@webpd/compiler'
import { Message } from '@webpd/compiler/src/run/types'

export type FloatArrayType = typeof Float32Array | typeof Float64Array

export type FloatArray = Float32Array | Float64Array

export type OperationStatus =
    | typeof FS_OPERATION_FAILURE
    | typeof FS_OPERATION_SUCCESS

interface SetWasmMessage {
    type: 'code:WASM'
    payload: {
        wasmBuffer: ArrayBuffer
    }
}
interface SetJsMessage {
    type: 'code:JS'
    payload: {
        jsCode: string
    }
}
interface IoMessageReceiver {
    type: 'io:messageReceiver'
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
        arguments: Parameters<Engine['globals']['fs']['sendReadSoundFileResponse']>
    }
}
interface FsWriteSoundFileResponse {
    type: 'fs'
    payload: {
        functionName: 'sendWriteSoundFileResponse'
        arguments: Parameters<Engine['globals']['fs']['sendWriteSoundFileResponse']>
    }
}
interface FsSoundStreamData {
    type: 'fs'
    payload: {
        functionName: 'sendSoundStreamData'
        arguments: Parameters<Engine['globals']['fs']['sendSoundStreamData']>
    }
}
interface FsSoundStreamClose {
    type: 'fs'
    payload: {
        functionName: 'closeSoundStream'
        arguments: Parameters<Engine['globals']['fs']['closeSoundStream']>
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
    | IoMessageReceiver

export interface FsOnReadSoundFile {
    type: 'fs'
    payload: {
        functionName: 'onReadSoundFile'
        arguments: Parameters<Engine['globals']['fs']['onReadSoundFile']>
    }
}

export interface FsOnWriteSoundFile {
    type: 'fs'
    payload: {
        functionName: 'onWriteSoundFile'
        arguments: Parameters<Engine['globals']['fs']['onWriteSoundFile']>
    }
}

export interface FsOnOpenSoundReadStream {
    type: 'fs'
    payload: {
        functionName: 'onOpenSoundReadStream'
        arguments: Parameters<Engine['globals']['fs']['onOpenSoundReadStream']>
    }
}

export interface FsOnOpenSoundWriteStream {
    type: 'fs'
    payload: {
        functionName: 'onOpenSoundWriteStream'
        arguments: Parameters<Engine['globals']['fs']['onOpenSoundWriteStream']>
    }
}

export interface FsOnSoundStreamData {
    type: 'fs'
    payload: {
        functionName: 'onSoundStreamData'
        arguments: Parameters<Engine['globals']['fs']['onSoundStreamData']>
    }
}

export interface FsOnCloseSoundStream {
    type: 'fs'
    payload: {
        functionName: 'onCloseSoundStream'
        arguments: Parameters<Engine['globals']['fs']['onCloseSoundStream']>
    }
}

export interface FsSendSoundStreamDataReturn {
    type: 'fs'
    payload: {
        functionName: 'sendSoundStreamData_return'
        operationId: number
        returned: ReturnType<Engine['globals']['fs']['sendSoundStreamData']>
    }
}

export interface FsCloseSoundStreamReturn {
    type: 'fs'
    payload: {
        functionName: 'closeSoundStream_return'
        operationId: number
        returned: ReturnType<Engine['globals']['fs']['closeSoundStream']>
    }
}

export interface FsSendReadSoundFileResponseReturn {
    type: 'fs'
    payload: {
        functionName: 'sendReadSoundFileResponse_return'
        operationId: number
        returned: ReturnType<Engine['globals']['fs']['sendReadSoundFileResponse']>
    }
}

export interface FsSendWriteSoundFileResponseReturn {
    type: 'fs'
    payload: {
        functionName: 'sendWriteSoundFileResponse_return'
        operationId: number
        returned: ReturnType<Engine['globals']['fs']['sendWriteSoundFileResponse']>
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
