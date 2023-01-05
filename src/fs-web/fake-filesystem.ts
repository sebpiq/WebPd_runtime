import { FloatArray } from "../types"
import { audioBufferToArray, fetchFile } from "../utils"

interface FakeSoundFile {
    type: 'sound',
    data: FloatArray[]
}

interface FakeBinaryFile {
    type: 'binary',
    data: ArrayBuffer
}

export type FakeFile = FakeSoundFile | FakeBinaryFile

const FILES: {[url: string]: FakeFile} = {}

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
    console.log(FILES)
}

export default {
    read, writeSound, readSound
}