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

class JsEvalWorkletProcessor extends AudioWorkletProcessor {
    constructor(settings) {
        super()
        this.port.onmessage = this.onMessage.bind(this)
        this.settings = {
            channelCount: settings.outputChannelCount[0],
            sampleRate: 
                settings.processorOptions.sampleRate,
        }
        this.dspConfigured = false
    }

    process(_, outputs) {
        const output = outputs[0]
        if (!this.dspConfigured) {
            if (!this.engine) {
                return true
            }
            this.settings.blockSize = output[0].length
            this.engine.configure(
                this.settings.sampleRate,
                this.settings.blockSize,
            )
            this.dspConfigured = true
        }
        this.engine.loop(output)
        return true
    }

    onMessage(message) {
        switch (message.data.type) {
            case 'CODE':
                this.setCode(message.data.payload.code)
                this.setArrays(message.data.payload.arrays)
                break
            default:
                new Error(`unknown message type ${message.type}`)
        }
    }

    setCode(code) {
        this.engine = new Function(code)()
        this.dspConfigured = false
    }

    setArrays(arrays) {
        Object.entries(arrays).forEach(([arrayName, array]) => {
            this.engine.setArray(arrayName, array)
        })
    }
}

registerProcessor('js-eval-node', JsEvalWorkletProcessor)
