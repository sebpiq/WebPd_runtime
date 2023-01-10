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

import { FloatArray } from "../types"
import { audioBufferToArray, fetchFile, fixSoundChannelCount } from "../utils"

const FILES: {[url: string]: FakeFile} = {}

interface FakeSoundFile {
    type: 'sound',
    data: FloatArray[]
}

interface FakeBinaryFile {
    type: 'binary',
    data: ArrayBuffer
}

export type FakeFile = FakeSoundFile | FakeBinaryFile

export class FakeStream {
    public url: string
    public readPosition: number
    public frameCount: number
    public sound: FloatArray[]

    constructor(
        url: string,
        sound: FloatArray[]
    ) {
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
    let fakeFile = FILES[url] || await read(url)
    switch(fakeFile.type) {
        case 'binary':
            const audioBuffer = await context.decodeAudioData(fakeFile.data)
            return audioBufferToArray(audioBuffer)
        case 'sound':
            return fakeFile.data
    }
}

const writeSound = async (sound: FloatArray[], url: string) => {
    FILES[url] = {
        type: 'sound',
        data: sound,
    }
}

const readStreamSound = async (url: string, channelCount: number, context: BaseAudioContext): Promise<FakeStream> => {
    const sound = await readSound(url, context)
    return new FakeStream(
        url,
        fixSoundChannelCount(
            sound, 
            channelCount
        )
    )
}

const writeStreamSound = async (url: string, channelCount: number): Promise<FakeStream> => {
    const emptySound: FloatArray[] = []
    for (let channel = 0; channel < channelCount; channel++) {
        emptySound.push(new Float32Array(0))
    }
    FILES[url] = {
        type: 'sound',
        data: emptySound,
    }
    return new FakeStream(url, emptySound)
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
        const concatenated = new Float32Array(channelData.length + block[channel].length)
        concatenated.set(channelData)
        concatenated.set(block[channel], channelData.length)
        return concatenated
    })
    stream.frameCount = stream.sound[0].length
    FILES[stream.url].data = stream.sound
}

export default {
    writeSound, readSound, readStreamSound, writeStreamSound, pullBlock, pushBlock
}