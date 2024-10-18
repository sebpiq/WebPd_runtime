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
import WebPdWorkletNode from '../WebPdWorkletNode'
import { IncomingMessage } from '../types'
import closeSoundStream from './close-sound-stream'
import readSoundFile from './read-sound-file'
import readSoundStream from './read-sound-stream'
import writeSoundFile from './write-sound-file'
import writeSoundStream from './write-sound-stream'
import { FsHandlerSettings } from './types'

export default async (
    node: WebPdWorkletNode,
    messageEvent: MessageEvent<IncomingMessage>,
    settings: FsHandlerSettings
) => {
    const message = messageEvent.data
    if (message.type !== 'fs') {
        throw new Error(`Unknown message type from node ${message.type}`)
    }
    const { payload } = message

    if (
        payload.functionName === 'onReadSoundFile' ||
        payload.functionName === 'sendReadSoundFileResponse_return'
    ) {
        readSoundFile(node, payload, settings)
    } else if (
        payload.functionName === 'onOpenSoundReadStream' ||
        payload.functionName === 'sendSoundStreamData_return'
    ) {
        readSoundStream(node, payload, settings)
    } else if (
        payload.functionName === 'onWriteSoundFile' ||
        payload.functionName === 'sendWriteSoundFileResponse_return'
    ) {
        writeSoundFile(node, payload, settings)
    } else if (
        payload.functionName === 'onOpenSoundWriteStream' ||
        payload.functionName === 'onSoundStreamData'
    ) {
        writeSoundStream(node, payload, settings)
    } else if (payload.functionName === 'closeSoundStream_return') {
        writeSoundStream(node, payload, settings)
        readSoundStream(node, payload, settings)
    } else if (payload.functionName === 'onCloseSoundStream') {
        closeSoundStream(node, payload, settings)
    } else {
        throw new Error(`Unknown callback ${(payload as any).functionName}`)
    }
}
