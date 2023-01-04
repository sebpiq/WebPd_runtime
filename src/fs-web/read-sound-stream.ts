import { FS_OPERATION_FAILURE, FS_OPERATION_SUCCESS } from '@webpd/compiler-js'
import { audioBufferToArray, loadAudioBuffer } from '../utils'
import WebPdWorkletNode, {
    FsRequestReadSoundStream,
    FsSoundStreamCloseReturn,
    FsSoundStreamDataReturn,
    IncomingMessage,
} from '../WebPdWorkletNode'

const BUFFER_HIGH = 10 * 44100
const BUFFER_LOW = BUFFER_HIGH / 2
const STREAMS: { [operationId: number]: FakeStream } = {}

type ReadSoundStreamMessage =
    | FsRequestReadSoundStream
    | FsSoundStreamDataReturn
    | FsSoundStreamCloseReturn

export default async (
    node: WebPdWorkletNode,
    payload: ReadSoundStreamMessage['payload']
) => {
    if (payload.functionName === 'onRequestReadSoundStream') {
        const [operationId, url] = payload.arguments
        let audioBuffer: AudioBuffer
        try {
            audioBuffer = await loadAudioBuffer(url, node.context)
        } catch (err) {
            console.error(err)
            node.port.postMessage({
                type: 'fs',
                payload: {
                    functionName: 'soundStreamClose',
                    arguments: [operationId, FS_OPERATION_FAILURE],
                },
            })
            return
        }

        if (audioBuffer) {
            const sound = audioBufferToArray(audioBuffer)
            STREAMS[operationId] = new FakeStream(node, operationId, sound)
            streamLoop(STREAMS[operationId], 0)
        }
    } else if (payload.functionName === 'soundStreamData_return') {
        const stream = STREAMS[payload.operationId]
        if (!stream) {
            throw new Error(`unknown stream ${payload.operationId}`)
        }
        streamLoop(stream, payload.returned)
    } else if (payload.functionName === 'soundStreamClose_return') {
    }
}

class FakeStream {
    public node: WebPdWorkletNode
    public readPosition: number
    public frameCount: number
    public operationId: number
    public sound: Float32Array[]

    constructor(
        node: WebPdWorkletNode,
        operationId: number,
        sound: Float32Array[]
    ) {
        this.node = node
        this.sound = sound
        this.frameCount = sound[0].length
        this.readPosition = 0
        this.operationId = operationId
    }
}

const pullBlock = (stream: FakeStream, frameCount: number) => {
    const block = stream.sound.map((array) =>
        array.slice(stream.readPosition, stream.readPosition + frameCount)
    )
    stream.readPosition += frameCount
    return block
}

const streamLoop = (stream: FakeStream, framesAvailableInEngine: number) => {
    const sampleRate = stream.node.context.sampleRate
    const secondsToThreshold =
        Math.max(framesAvailableInEngine - BUFFER_LOW, 10) / sampleRate
    const framesToSend =
        BUFFER_HIGH -
        (framesAvailableInEngine - secondsToThreshold * sampleRate)

    setTimeout(() => {
        if (stream.readPosition < stream.frameCount) {
            const block = pullBlock(stream, framesToSend)
            stream.node.port.postMessage(
                {
                    type: 'fs',
                    payload: {
                        functionName: 'soundStreamData',
                        arguments: [stream.operationId, block],
                    },

                    // Add as transferables to avoid copies between threads
                },
                block.map((array) => array.buffer)
            )
        } else {
            stream.node.port.postMessage({
                type: 'fs',
                payload: {
                    functionName: 'soundStreamClose',
                    arguments: [stream.operationId, FS_OPERATION_SUCCESS],
                },
            })
        }
    }, secondsToThreshold * 1000)
}
