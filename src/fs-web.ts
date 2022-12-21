import { FS_OPERATION_FAILURE, FS_OPERATION_SUCCESS } from '@webpd/compiler-js'
import { loadAudioBuffer } from './utils'
import WebPdWorkletNode, { IncomingMessage } from './WebPdWorkletNode'

const fsWeb = (
    node: WebPdWorkletNode,
    message: MessageEvent<IncomingMessage>
) => {
    const { payload, type } = message.data
    if (type !== 'fs') {
        throw new Error(`Unknown message type from node ${type}`)
    }
    switch (payload.functionName) {
        case 'readSound':
            const [operationId, url] = payload.arguments
            loadAudioBuffer(url, node.context)
                .then((audioBuffer) => {
                    node.port.postMessage({
                        type: 'fs',
                        payload: {
                            functionName: 'readSoundFileResponse',
                            arguments: [
                                operationId,
                                FS_OPERATION_SUCCESS,
                                [
                                    audioBuffer.getChannelData(0),
                                    audioBuffer.getChannelData(1),
                                ],
                            ]
                        },
                    })
                })
                .catch(() => {
                    node.port.postMessage({
                        type: 'fs',
                        payload: {
                            functionName: 'readSoundFileResponse',
                            arguments: [
                                operationId,
                                FS_OPERATION_FAILURE,
                            ]
                        },
                    })
                })
            break
        default:
            throw new Error(`Unknown callback ${payload.functionName}`)
    }
}

export default fsWeb
