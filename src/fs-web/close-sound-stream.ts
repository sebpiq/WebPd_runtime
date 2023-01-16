import WebPdWorkletNode, { FsOnCloseSoundStream } from "../WebPdWorkletNode";
import { killStream } from "./fake-filesystem";

type CloseSoundStreamMessage =
    | FsOnCloseSoundStream

export default async (
    node: WebPdWorkletNode,
    payload: CloseSoundStreamMessage['payload']
) => {
    if (payload.functionName === 'onCloseSoundStream') {
        killStream(payload.arguments[0])
    }
}