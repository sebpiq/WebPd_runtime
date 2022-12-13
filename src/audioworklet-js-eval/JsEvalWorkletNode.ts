/*
 * Copyright (c) 2012-2020 Sébastien Piquemal <sebpiq@gmail.com>
 *
 * BSD Simplified License.
 * For information on usage and redistribution, and for a DISCLAIMER OF ALL
 * WARRANTIES, see the file, "LICENSE.txt," in this distribution.
 *
 * See https://github.com/sebpiq/WebPd_pd-parser for documentation
 *
 */

export default class JsEvalNode extends AudioWorkletNode {
    override port: JsEvalNodeMessagePort

    constructor(
        context: AudioContext,
    ) {
        super(context, 'js-eval-node', {
            numberOfOutputs: 1,
            processorOptions: {
                sampleRate: context.sampleRate
            },
        })
    }
}

interface JsEvalNodeMessagePort extends MessagePort {
    postMessage(message: JsEvalNodeMessage, transfer: Transferable[]): void
    postMessage(
        message: JsEvalNodeMessage,
        options?: StructuredSerializeOptions
    ): void
}

interface SetProcessorMessage {
    type: 'CODE'
    payload: {
        code: string
        arrays: { [arrayName: string]: Float32Array }
    }
}

type JsEvalNodeMessage = SetProcessorMessage
