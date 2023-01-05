import makeFetchRetry from 'fetch-retry'
import { FloatArray, FloatArrayType } from './types'

const fetchRetry = makeFetchRetry(fetch)

export const addModule = async (
    context: AudioContext,
    processorCode: string
) => {
    const blob = new Blob([processorCode], { type: 'text/javascript' })
    const workletProcessorUrl = URL.createObjectURL(blob)
    return context.audioWorklet.addModule(workletProcessorUrl)
}

// TODO : testing
export const fetchFile = async (
    url: string,
) => {
    let response: Response
    try {
        response = await fetchRetry(url, { retries: 3 })
    } catch (err) {
        throw new FileError(response.status, err.toString())
    }
    if (!response.ok) {
        const responseText = await response.text()
        throw new FileError(response.status, responseText)
    }
    return response.arrayBuffer()
}

export const audioBufferToArray = (
    audioBuffer: AudioBuffer
): Array<FloatArray> => {
    const sound: Array<FloatArray> = []
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        sound.push(audioBuffer.getChannelData(channel))
    }
    return sound
}

// TODO : testing
export const fixSoundChannelCount = (
    sound: Array<FloatArray>, 
    targetChannelCount: number
) => {
    if (sound.length === 0) {
        throw new Error(`Received empty sound`)
    }
    const floatArrayType = sound[0].constructor as FloatArrayType
    const frameCount = sound[0].length
    const fixedSound = sound.slice(0, targetChannelCount)
    while (sound.length < targetChannelCount) {
        fixedSound.push(new floatArrayType(frameCount))
    }
    return fixedSound
}

export class FileError extends Error {
    constructor(status: Response['status'], msg: string) {
        super(`Error ${status} : ${msg}`)
    }
}
