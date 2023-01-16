import { FS_OPERATION_FAILURE, FS_OPERATION_SUCCESS } from '@webpd/compiler-js'
import WebPdWorkletNode, {
    FsOnOpenSoundReadStream,
    FsCloseSoundStreamReturn,
    FsSendSoundStreamDataReturn,
} from '../WebPdWorkletNode'
import fakeFs, { getStream, killStream, pullBlock } from './fake-filesystem'

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
        try {
            await fakeFs.readStreamSound(operationId, url, channelCount, node.context)
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
        streamLoop(node, operationId, 0)
    
    } else if (payload.functionName === 'sendSoundStreamData_return') {
        const stream = getStream(payload.operationId)
        if (!stream) {
            throw new Error(`unknown stream ${payload.operationId}`)
        }
        streamLoop(node, payload.operationId, payload.returned)

    } else if (payload.functionName === 'closeSoundStream_return') {
        const stream = getStream(payload.operationId)
        if (stream) {
            killStream(payload.operationId)
        }
    }
}

const streamLoop = (
    node: WebPdWorkletNode, 
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
        const stream = getStream(operationId)
        if (!stream) {
            console.log(`stream ${operationId} was maybe closed`)
            return
        }

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
