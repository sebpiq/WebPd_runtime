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
        }
        this.dspLoop = null
        this.dspConfigured = false
    }

    process(_, outputs) {
        const output = outputs[0]
        if (!this.dspConfigured) {
            if (!this.dspLoop) {
                return true
            }
            this.settings.blockSize = output[0].length
            this.dspConfigure(this.settings.blockSize)
            this.dspConfigured = true
        }
        this.dspLoop(output)
        return true
    }

    onMessage(message) {
        switch (message.data.type) {
            case 'CODE':
                this.setDspCode(message.data.payload.code)
                Object.entries(message.data.payload.arrays).forEach(([arrayName, array]) => {
                    this.dspSetArray(arrayName, array)
                })
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
        const { loop, ports, configure, setArray } = new Function(code)()
        this.dspConfigured = false
        this.dspConfigure = configure
        this.dspLoop = loop
        this.dspPorts = ports
        this.dspSetArray = setArray
    }

    callPort(portName, args) {
        if (!this.dspPorts[portName]) {
            throw new Error(`Unknown port ${portName}`)
        }
        this.dspPorts[portName].apply(this, args)
    }
}

registerProcessor('js-eval-node', JsEvalWorkletProcessor)
