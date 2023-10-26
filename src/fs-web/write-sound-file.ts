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
import { FS_OPERATION_SUCCESS } from '@webpd/compiler'
import { fixSoundChannelCount, resolveRelativeUrl } from '../utils'
import WebPdWorkletNode from '../WebPdWorkletNode'
import {
    FsOnWriteSoundFile,
    FsSendWriteSoundFileResponseReturn
} from '../types'
import { OperationStatus } from '../types'
import fakeFs from './fake-filesystem'
import { FsHandlerSettings } from './types'

type WriteSoundFileMessage =
    | FsOnWriteSoundFile
    | FsSendWriteSoundFileResponseReturn

export default async (
    node: WebPdWorkletNode,
    payload: WriteSoundFileMessage['payload'],
    settings: FsHandlerSettings,
) => {
    if (payload.functionName === 'onWriteSoundFile') {
        const [operationId, sound, url, [channelCount]] = payload.arguments
        const fixedSound = fixSoundChannelCount(sound, channelCount)
        const absoluteUrl = resolveRelativeUrl(settings.rootUrl, url)
        await fakeFs.writeSound(fixedSound, absoluteUrl)
        let operationStatus: OperationStatus = FS_OPERATION_SUCCESS
        node.port.postMessage({
            type: 'fs',
            payload: {
                functionName: 'sendWriteSoundFileResponse',
                arguments: [operationId, operationStatus],
            },
        })
    } else if (payload.functionName === 'sendWriteSoundFileResponse_return') {
    }
}
