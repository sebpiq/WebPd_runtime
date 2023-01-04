import makeFetchRetry from 'fetch-retry'

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
export const loadAudioBuffer = async (
    url: string,
    context: BaseAudioContext
) => {
    let response: Response
    try {
        response = await fetchRetry(url, { retries: 3 })
    } catch(err) {
        throw new FileError(response.status, err.toString())
    }
    if (!response.ok) {
        const responseText = await response.text()
        throw new FileError(response.status, responseText)
    }
    const arrayBuffer = await response.arrayBuffer()
    return context.decodeAudioData(arrayBuffer)
}

export const audioBufferToArray = (audioBuffer: AudioBuffer): Array<Float32Array> => {
    const sound: Array<Float32Array> = []
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        sound.push(audioBuffer.getChannelData(channel))
    }
    return sound
}

export class FileError extends Error {
    constructor(status: Response['status'], msg: string) {
        super(`Error ${status} : ${msg}`)
    }
}