import WebPdWorkletNode, { IncomingMessage } from '../WebPdWorkletNode'
import readSoundFile from './read-sound-file'
import readSoundStream from './read-sound-stream'
import writeSoundFile from './write-sound-file'

export default async (
    node: WebPdWorkletNode,
    messageEvent: MessageEvent<IncomingMessage>
) => {
    const message = messageEvent.data
    console.log(message)
    const { payload } = message
    if (message.type !== 'fs') {
        throw new Error(`Unknown message type from node ${message.type}`)
    }

    if (
        payload.functionName === 'onRequestReadSoundFile' ||
        payload.functionName === 'readSoundFileResponse_return'
    ) {
        readSoundFile(node, payload)
    } else if (
        payload.functionName === 'onRequestReadSoundStream' ||
        payload.functionName === 'soundStreamClose_return' ||
        payload.functionName === 'soundStreamData_return'
    ) {
        readSoundStream(node, payload)
    } else if (
        payload.functionName === 'onRequestWriteSoundFile' ||
        payload.functionName === 'writeSoundFileResponse_return'
    ) {
        writeSoundFile(node, payload)
    } else {
        throw new Error(`Unknown callback ${(payload as any).functionName}`)
    }
}
