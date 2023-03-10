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
import { fixSoundChannelCount } from '../utils'
import fakeFs from './fake-filesystem'
import WebPdWorkletNode, {
    FsOnReadSoundFile,
    FsSendReadSoundFileResponseReturn,
} from '../WebPdWorkletNode'
import { FloatArray, OperationStatus } from '../types'

type ReadSoundFileMessage =
    | FsOnReadSoundFile
    | FsSendReadSoundFileResponseReturn

export default async (
    node: WebPdWorkletNode,
    payload: ReadSoundFileMessage['payload']
) => {
    if (payload.functionName === 'onReadSoundFile') {
        const [operationId, url, [channelCount]] = payload.arguments
        let operationStatus: OperationStatus = FS_OPERATION_SUCCESS
        let sound: FloatArray[] = null

        try {
            sound = await fakeFs.readSound(url, node.context)
        } catch (err) {
            operationStatus = FS_OPERATION_FAILURE
            console.error(err)
        }

        if (sound) {
            sound = fixSoundChannelCount(sound, channelCount)
        }

        node.port.postMessage(
            {
                type: 'fs',
                payload: {
                    functionName: 'sendReadSoundFileResponse',
                    arguments: [operationId, operationStatus, sound],
                },
            },
            // Add as transferables to avoid copies between threads
            sound.map((array) => array.buffer)
        )
    } else if (payload.functionName === 'sendReadSoundFileResponse_return') {
    }
}
