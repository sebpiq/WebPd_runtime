import { FS_OPERATION_FAILURE, FS_OPERATION_SUCCESS } from '@webpd/compiler-js'
import { audioBufferToArray, loadAudioBuffer } from '../utils'
import WebPdWorkletNode, {
    FsRequestReadSoundFile,
    ReadSoundFileResponseReturn,
} from '../WebPdWorkletNode'
import { OperationStatus } from './types'

type ReadSoundFileMessage = FsRequestReadSoundFile | ReadSoundFileResponseReturn

export default async (
    node: WebPdWorkletNode,
    payload: ReadSoundFileMessage['payload']
) => {
    if (payload.functionName === 'onRequestReadSoundFile') {
        const [operationId, url, [channelCount]] = payload.arguments
        let operationStatus: OperationStatus = FS_OPERATION_SUCCESS
        let audioBuffer: AudioBuffer
        try {
            audioBuffer = await loadAudioBuffer(url, node.context)
        } catch (err) {
            operationStatus = FS_OPERATION_FAILURE
            console.error(err)
        }

        let sound: Array<Float32Array> = []
        if (audioBuffer) {
            sound = audioBufferToArray(audioBuffer)
        }

        node.port.postMessage(
            {
                type: 'fs',
                payload: {
                    functionName: 'readSoundFileResponse',
                    arguments: [operationId, operationStatus, sound],
                },

                // Add as transferables to avoid copies between threads
            },
            sound.map((array) => array.buffer)
        )
    } else if (payload.functionName === 'readSoundFileResponse_return') {
    }
}
