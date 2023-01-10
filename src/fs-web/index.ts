import WebPdWorkletNode, { IncomingMessage } from '../WebPdWorkletNode'
import readSoundFile from './read-sound-file'
import readSoundStream from './read-sound-stream'
import writeSoundFile from './write-sound-file'
import writeSoundStream from './write-sound-stream'

export default async (
    node: WebPdWorkletNode,
    messageEvent: MessageEvent<IncomingMessage>
) => {
    const message = messageEvent.data
    const { payload } = message
    if (message.type !== 'fs') {
        throw new Error(`Unknown message type from node ${message.type}`)
    }

    if (
        payload.functionName === 'onReadSoundFile' ||
        payload.functionName === 'sendReadSoundFileResponse_return'
    ) {
        readSoundFile(node, payload)
    } else if (
        payload.functionName === 'onOpenSoundReadStream' ||
        payload.functionName === 'sendSoundStreamData_return'
    ) {
        readSoundStream(node, payload)
    } else if (
        payload.functionName === 'onWriteSoundFile' ||
        payload.functionName === 'sendWriteSoundFileResponse_return'
    ) {
        writeSoundFile(node, payload)
    } else if (
        payload.functionName === 'onOpenSoundWriteStream' ||
        payload.functionName === 'onSoundStreamData'
    ) {
        writeSoundStream(node, payload)
    } else if (
        payload.functionName === 'closeSoundStream_return'
    ) {
        writeSoundStream(node, payload)
        readSoundStream(node, payload)
    } else {
        throw new Error(`Unknown callback ${(payload as any).functionName}`)
    }
}
