import { FS_OPERATION_SUCCESS } from '@webpd/compiler-js'
import { fixSoundChannelCount } from '../utils'
import WebPdWorkletNode, {
    FsRequestWriteSoundFile,
    WriteSoundFileResponseReturn,
} from '../WebPdWorkletNode'
import { OperationStatus } from '../types'
import fakeFs from './fake-filesystem'

type WriteSoundFileMessage = FsRequestWriteSoundFile | WriteSoundFileResponseReturn

export default async (
    node: WebPdWorkletNode,
    payload: WriteSoundFileMessage['payload']
) => {
    if (payload.functionName === 'onRequestWriteSoundFile') {
        const [operationId, sound, url, [channelCount]] = payload.arguments
        const fixedSound = fixSoundChannelCount(sound, channelCount)
        await fakeFs.writeSound(fixedSound, url)
        let operationStatus: OperationStatus = FS_OPERATION_SUCCESS
        node.port.postMessage(
            {
                type: 'fs',
                payload: {
                    functionName: 'writeSoundFileResponse',
                    arguments: [operationId, operationStatus],
                },

            },
        )

    } else if (payload.functionName === 'writeSoundFileResponse_return') {
    }
}
