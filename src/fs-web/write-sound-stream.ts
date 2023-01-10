import WebPdWorkletNode, { FsCloseSoundStreamReturn, FsOnOpenSoundWriteStream, FsOnSoundStreamData } from '../WebPdWorkletNode'
import fakeFs, { FakeStream, pushBlock } from './fake-filesystem'

const STREAMS: { [operationId: number]: FakeStream } = {}

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
        const stream = await fakeFs.writeStreamSound(url, channelCount)
        STREAMS[operationId] = stream

    } else if (payload.functionName === 'onSoundStreamData') {
        const [operationId, sound] = payload.arguments
        const stream = STREAMS[operationId]
        if (!stream) {
            throw new Error(`unknown stream ${operationId}`)
        }
        pushBlock(stream, sound)
        
    } else if (payload.functionName === 'closeSoundStream_return') {
        if (STREAMS[payload.operationId]) {
            delete STREAMS[payload.operationId]
        }
    }
}