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

import { FloatArray } from '../types'
import { audioBufferToArray, fetchFile, fixSoundChannelCount } from '../utils'

const FILES: { [url: string]: FakeFile } = {}
const STREAMS: { [operationId: number]: FakeStream } = {}

interface FakeSoundFile {
    type: 'sound'
    data: FloatArray[]
}

interface FakeBinaryFile {
    type: 'binary'
    data: ArrayBuffer
}

export type FakeFile = FakeSoundFile | FakeBinaryFile

export class FakeStream {
    public url: string
    public readPosition: number
    public frameCount: number
    public sound: FloatArray[]

    constructor(url: string, sound: FloatArray[]) {
        this.url = url
        this.sound = sound
        this.frameCount = sound[0].length
        this.readPosition = 0
    }
}

const read = async (url: string): Promise<FakeFile> => {
    if (FILES[url]) {
        return FILES[url]
    }
    const arrayBuffer = await fetchFile(url)
    return {
        type: 'binary',
        data: arrayBuffer,
    }
}

// TODO : testing
export const readSound = async (
    url: string,
    context: BaseAudioContext
): Promise<FloatArray[]> => {
    let fakeFile = FILES[url] || (await read(url))
    switch (fakeFile.type) {
        case 'binary':
            const audioBuffer = await context.decodeAudioData(fakeFile.data)
            return audioBufferToArray(audioBuffer)
        case 'sound':
            // We copy the data here o it can be manipulated freely by the host.
            // e.g. if the buffer is sent as transferrable to the node we don't want the original to be transferred.
            return fakeFile.data.map((array) => array.slice())
    }
}

const writeSound = async (sound: FloatArray[], url: string) => {
    FILES[url] = {
        type: 'sound',
        data: sound,
    }
}

const readStreamSound = async (
    operationId: number,
    url: string,
    channelCount: number,
    context: BaseAudioContext
): Promise<FakeStream> => {
    const sound = await readSound(url, context)
    STREAMS[operationId] = new FakeStream(
        url,
        fixSoundChannelCount(sound, channelCount)
    )
    return STREAMS[operationId]
}

const writeStreamSound = async (
    operationId: number,
    url: string,
    channelCount: number
): Promise<FakeStream> => {
    const emptySound: FloatArray[] = []
    for (let channel = 0; channel < channelCount; channel++) {
        emptySound.push(new Float32Array(0))
    }
    STREAMS[operationId] = new FakeStream(url, emptySound)
    FILES[url] = {
        type: 'sound',
        data: emptySound,
    }
    return STREAMS[operationId]
}

export const getStream = (operationId: number) => {
    return STREAMS[operationId]
}

export const killStream = (operationId: number) => {
    console.log('KILL STREAM', operationId)
    delete STREAMS[operationId]
}

export const pullBlock = (stream: FakeStream, frameCount: number) => {
    const block = stream.sound.map((array) =>
        array.slice(stream.readPosition, stream.readPosition + frameCount)
    )
    stream.readPosition += frameCount
    return block
}

export const pushBlock = (stream: FakeStream, block: FloatArray[]) => {
    stream.sound = stream.sound.map((channelData, channel) => {
        const concatenated = new Float32Array(
            channelData.length + block[channel].length
        )
        concatenated.set(channelData)
        concatenated.set(block[channel], channelData.length)
        return concatenated
    })
    stream.frameCount = stream.sound[0].length
    FILES[stream.url].data = stream.sound
}

export default {
    writeSound,
    readSound,
    readStreamSound,
    writeStreamSound,
    pullBlock,
    pushBlock,
}
