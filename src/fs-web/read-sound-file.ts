import { FS_OPERATION_FAILURE, FS_OPERATION_SUCCESS } from '@webpd/compiler-js'
import { fixSoundChannelCount } from '../utils'
import fakeFs from './fake-filesystem'
import WebPdWorkletNode, {
    FsRequestReadSoundFile,
    ReadSoundFileResponseReturn,
} from '../WebPdWorkletNode'
import { FloatArray, OperationStatus } from '../types'

type ReadSoundFileMessage = FsRequestReadSoundFile | ReadSoundFileResponseReturn

export default async (
    node: WebPdWorkletNode,
    payload: ReadSoundFileMessage['payload']
) => {
    if (payload.functionName === 'onRequestReadSoundFile') {
        const [operationId, url, [channelCount]] = payload.arguments
        let operationStatus: OperationStatus = FS_OPERATION_SUCCESS
        let sound: FloatArray[] = null
        
        try {
            sound = await fakeFs.readSound(url, node.context)
        } catch (err) {
            operationStatus = FS_OPERATION_FAILURE
            console.error(err)
        }

        if (sound) {
            sound = fixSoundChannelCount(
                sound, 
                channelCount
            )
        }

        node.port.postMessage(
            {
                type: 'fs',
                payload: {
                    functionName: 'readSoundFileResponse',
                    arguments: [operationId, operationStatus, sound],
                },

            },
            // Add as transferables to avoid copies between threads
            sound.map((array) => array.buffer)
        )
    } else if (payload.functionName === 'readSoundFileResponse_return') {
    }
}
