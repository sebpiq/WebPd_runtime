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

const GLOBAL_ARRAYS_VARIABLE_NAME = 'GLOBAL_ARRAYS'

class JsEvalWorkletProcessor extends AudioWorkletProcessor {
    constructor(settings) {
        super()
        this.port.onmessage = this.onMessage.bind(this)
        const defaultOutput = new Float32Array(settings.channelCount)
        this.dspLoop = () => defaultOutput
        this.settings = {
            channelCount: settings.outputChannelCount[0]
        }
    }

    process(_, outputs) {
        const output = outputs[0]
        const blockSize = output[0].length
        for (let frame = 0; frame < blockSize; frame++) {
            const dspLoopResult = this.dspLoop()
            for (let channel = 0; channel < this.settings.channelCount; channel++) {
                output[channel][frame] = dspLoopResult[channel]
            }
        }
        return true
    }

    onMessage(message) {
        switch (message.data.type) {
            case 'CODE':
                globalThis[GLOBAL_ARRAYS_VARIABLE_NAME] = message.data.payload.arrays
                this.setDspCode(message.data.payload.code)
                break
            case 'PORT':
                this.callPort(
                    message.data.payload.portName,
                    message.data.payload.args
                )
                break
            default:
                new Error(`unknown message type ${message.type}`)
        }
    }

    setDspCode(code) {
        const { loop, ports } = new Function(code)()
        this.dspLoop = loop
        this.dspPorts = ports
    }

    callPort(portName, args) {
        if (!this.dspPorts[portName]) {
            throw new Error(`Unknown port ${portName}`)
        }
        this.dspPorts[portName].apply(this, args)
    }
}

registerProcessor('js-eval-node', JsEvalWorkletProcessor)
