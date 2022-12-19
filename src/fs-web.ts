import { loadAudioBuffer } from './utils'
import WebPdWorkletNode, { IncomingMessage } from './WebPdWorkletNode'

const fsWeb = (
    node: WebPdWorkletNode,
    message: MessageEvent<IncomingMessage>
) => {
    const { payload, type } = message.data
    switch (type) {
        case 'FS:REQUEST_READ_SOUND_FILE':
            loadAudioBuffer(payload.url, node.context).then((audioBuffer) => {
                node.port.postMessage({
                    type: 'FS:READ_SOUND_FILE_RESPONSE',
                    payload: {
                        sound: [
                            audioBuffer.getChannelData(0),
                            audioBuffer.getChannelData(1),
                        ],
                        operationId: payload.operationId,
                    },
                })
            })
            break
        default:
            throw new Error(`Unknown message type from node ${type}`)
    }
}

export default fsWeb
