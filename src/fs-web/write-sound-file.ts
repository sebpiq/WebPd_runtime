import { FS_OPERATION_SUCCESS } from '@webpd/compiler-js'
import { fixSoundChannelCount } from '../utils'
import WebPdWorkletNode, { FsOnWriteSoundFile, FsSendWriteSoundFileResponseReturn } from '../WebPdWorkletNode'
import { OperationStatus } from '../types'
import fakeFs from './fake-filesystem'

type WriteSoundFileMessage = FsOnWriteSoundFile | FsSendWriteSoundFileResponseReturn

export default async (
    node: WebPdWorkletNode,
    payload: WriteSoundFileMessage['payload']
) => {
    if (payload.functionName === 'onWriteSoundFile') {
        const [operationId, sound, url, [channelCount]] = payload.arguments
        const fixedSound = fixSoundChannelCount(sound, channelCount)
        await fakeFs.writeSound(fixedSound, url)
        let operationStatus: OperationStatus = FS_OPERATION_SUCCESS
        node.port.postMessage(
            {
                type: 'fs',
                payload: {
                    functionName: 'sendWriteSoundFileResponse',
                    arguments: [operationId, operationStatus],
                },

            },
        )

    } else if (payload.functionName === 'sendWriteSoundFileResponse_return') {
    }
}
