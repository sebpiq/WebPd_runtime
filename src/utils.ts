export const addModule = async (
    context: AudioContext,
    processorCode: string
) => {
    const blob = new Blob([processorCode], { type: 'text/javascript' })
    const workletProcessorUrl = URL.createObjectURL(blob)
    return context.audioWorklet.addModule(workletProcessorUrl)
}

// TODO : Error handling
export const loadAudioBuffer = async (
    url: string,
    context: BaseAudioContext
) => {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return context.decodeAudioData(arrayBuffer)
}
