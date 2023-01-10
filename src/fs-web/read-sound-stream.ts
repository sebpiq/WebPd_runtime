import { FS_OPERATION_FAILURE, FS_OPERATION_SUCCESS } from '@webpd/compiler-js'
import WebPdWorkletNode, {
    FsOnOpenSoundReadStream,
    FsCloseSoundStreamReturn,
    FsSendSoundStreamDataReturn,
} from '../WebPdWorkletNode'
import fakeFs, { FakeStream, pullBlock } from './fake-filesystem'

const STREAMS: { [operationId: number]: FakeStream } = {}

const BUFFER_HIGH = 10 * 44100
const BUFFER_LOW = BUFFER_HIGH / 2

type SoundReadStreamMessage =
    | FsOnOpenSoundReadStream
    | FsSendSoundStreamDataReturn
    | FsCloseSoundStreamReturn

export default async (
    node: WebPdWorkletNode,
    payload: SoundReadStreamMessage['payload']
) => {
    if (payload.functionName === 'onOpenSoundReadStream') {
        const [operationId, url, [channelCount]] = payload.arguments
        let stream: FakeStream
        try {
            stream = await fakeFs.readStreamSound(url, channelCount, node.context)
        } catch (err) {
            console.error(err)
            node.port.postMessage({
                type: 'fs',
                payload: {
                    functionName: 'closeSoundStream',
                    arguments: [operationId, FS_OPERATION_FAILURE],
                },
            })
            return
        }
        STREAMS[operationId] = stream
        streamLoop(node, STREAMS[operationId], operationId, 0)
    
    } else if (payload.functionName === 'sendSoundStreamData_return') {
        const stream = STREAMS[payload.operationId]
        if (!stream) {
            throw new Error(`unknown stream ${payload.operationId}`)
        }
        streamLoop(node, stream, payload.operationId, payload.returned)

    } else if (payload.functionName === 'closeSoundStream_return') {
        if (STREAMS[payload.operationId]) {
            delete STREAMS[payload.operationId]
        }
    }
}

const streamLoop = (
    node: WebPdWorkletNode, 
    stream: FakeStream, 
    operationId: number,
    framesAvailableInEngine: number
) => {
    const sampleRate = node.context.sampleRate
    const secondsToThreshold =
        Math.max(framesAvailableInEngine - BUFFER_LOW, 10) / sampleRate
    const framesToSend =
        BUFFER_HIGH -
        (framesAvailableInEngine - secondsToThreshold * sampleRate)

    setTimeout(() => {
        if (stream.readPosition < stream.frameCount) {
            const block = pullBlock(stream, framesToSend)
            node.port.postMessage(
                {
                    type: 'fs',
                    payload: {
                        functionName: 'sendSoundStreamData',
                        arguments: [operationId, block],
                    },

                },
                // Add as transferables to avoid copies between threads
                block.map((array) => array.buffer)
            )
        } else {
            node.port.postMessage({
                type: 'fs',
                payload: {
                    functionName: 'closeSoundStream',
                    arguments: [operationId, FS_OPERATION_SUCCESS],
                },
            })
        }
    }, secondsToThreshold * 1000)
}
