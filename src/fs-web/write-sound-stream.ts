import WebPdWorkletNode, {
    FsCloseSoundStreamReturn,
    FsOnOpenSoundWriteStream,
    FsOnSoundStreamData,
} from '../WebPdWorkletNode'
import fakeFs, {
    FakeStream,
    getStream,
    killStream,
    pushBlock,
} from './fake-filesystem'

type OpenSoundWriteStreamMessage =
    | FsOnOpenSoundWriteStream
    | FsOnSoundStreamData
    | FsCloseSoundStreamReturn

export default async (
    _: WebPdWorkletNode,
    payload: OpenSoundWriteStreamMessage['payload']
) => {
    if (payload.functionName === 'onOpenSoundWriteStream') {
        const [operationId, url, [channelCount]] = payload.arguments
        await fakeFs.writeStreamSound(operationId, url, channelCount)
    } else if (payload.functionName === 'onSoundStreamData') {
        const [operationId, sound] = payload.arguments
        const stream = getStream(operationId)
        if (!stream) {
            throw new Error(`unknown stream ${operationId}`)
        }
        pushBlock(stream, sound)
    } else if (payload.functionName === 'closeSoundStream_return') {
        const stream = getStream(payload.operationId)
        if (stream) {
            killStream(payload.operationId)
        }
    }
}
