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
import { FS_OPERATION_FAILURE, FS_OPERATION_SUCCESS } from '@webpd/compiler'
import { resolveRelativeUrl } from '../utils'
import WebPdWorkletNode, {
    FsOnOpenSoundReadStream,
    FsCloseSoundStreamReturn,
    FsSendSoundStreamDataReturn,
} from '../WebPdWorkletNode'
import fakeFs, { getStream, killStream, pullBlock } from './fake-filesystem'
import { Settings } from './types'

const BUFFER_HIGH = 10 * 44100
const BUFFER_LOW = BUFFER_HIGH / 2

type SoundReadStreamMessage =
    | FsOnOpenSoundReadStream
    | FsSendSoundStreamDataReturn
    | FsCloseSoundStreamReturn

export default async (
    node: WebPdWorkletNode,
    payload: SoundReadStreamMessage['payload'],
    settings: Settings,
) => {
    if (payload.functionName === 'onOpenSoundReadStream') {
        const [operationId, url, [channelCount]] = payload.arguments
        try {
            const absoluteUrl = resolveRelativeUrl(settings.rootUrl, url)
            await fakeFs.readStreamSound(
                operationId,
                absoluteUrl,
                channelCount,
                node.context
            )
        } catch (err) {
            console.error(err)
            node.port.postMessage({
                type: 'fs',
                payload: {
                    functionName: 'closeSoundStream',
                    arguments: [operationId, FS_OPERATION_FAILURE],
                },
            })
            return
        }
        streamLoop(node, operationId, 0)
    } else if (payload.functionName === 'sendSoundStreamData_return') {
        const stream = getStream(payload.operationId)
        if (!stream) {
            throw new Error(`unknown stream ${payload.operationId}`)
        }
        streamLoop(node, payload.operationId, payload.returned)
    } else if (payload.functionName === 'closeSoundStream_return') {
        const stream = getStream(payload.operationId)
        if (stream) {
            killStream(payload.operationId)
        }
    }
}

const streamLoop = (
    node: WebPdWorkletNode,
    operationId: number,
    framesAvailableInEngine: number
) => {
    const sampleRate = node.context.sampleRate
    const secondsToThreshold =
        Math.max(framesAvailableInEngine - BUFFER_LOW, 10) / sampleRate
    const framesToSend =
        BUFFER_HIGH -
        (framesAvailableInEngine - secondsToThreshold * sampleRate)

    setTimeout(() => {
        const stream = getStream(operationId)
        if (!stream) {
            console.log(`stream ${operationId} was maybe closed`)
            return
        }

        if (stream.readPosition < stream.frameCount) {
            const block = pullBlock(stream, framesToSend)
            node.port.postMessage(
                {
                    type: 'fs',
                    payload: {
                        functionName: 'sendSoundStreamData',
                        arguments: [operationId, block],
                    },
                },
                // Add as transferables to avoid copies between threads
                block.map((array) => array.buffer)
            )
        } else {
            node.port.postMessage({
                type: 'fs',
                payload: {
                    functionName: 'closeSoundStream',
                    arguments: [operationId, FS_OPERATION_SUCCESS],
                },
            })
        }
    }, secondsToThreshold * 1000)
}
