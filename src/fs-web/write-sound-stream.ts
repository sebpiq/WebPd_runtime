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
import { resolveRelativeUrl } from '../utils'
import WebPdWorkletNode from '../WebPdWorkletNode'
import {
    FsCloseSoundStreamReturn,
    FsOnOpenSoundWriteStream,
    FsOnSoundStreamData,
} from '../types'
import fakeFs, { getStream, killStream, pushBlock } from './fake-filesystem'
import { FsHandlerSettings } from './types'

type OpenSoundWriteStreamMessage =
    | FsOnOpenSoundWriteStream
    | FsOnSoundStreamData
    | FsCloseSoundStreamReturn

export default async (
    _: WebPdWorkletNode,
    payload: OpenSoundWriteStreamMessage['payload'],
    settings: FsHandlerSettings
) => {
    if (payload.functionName === 'onOpenSoundWriteStream') {
        const [operationId, url, [channelCount]] = payload.arguments
        const absoluteUrl = resolveRelativeUrl(settings.rootUrl, url)
        await fakeFs.writeStreamSound(operationId, absoluteUrl, channelCount)
    } else if (payload.functionName === 'onSoundStreamData') {
        const [operationId, sound] = payload.arguments
        const stream = getStream(operationId)
        if (!stream) {
            throw new Error(`unknown stream ${operationId}`)
        }
        pushBlock(stream, sound)
    } else if (payload.functionName === 'closeSoundStream_return') {
        const stream = getStream(payload.operationId)
        if (stream) {
            killStream(payload.operationId)
        }
    }
}
