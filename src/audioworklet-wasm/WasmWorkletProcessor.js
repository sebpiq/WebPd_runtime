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

class WasmWorkletProcessor extends AudioWorkletProcessor {
    constructor(settings) {
        super()
        this.port.onmessage = this.onMessage.bind(this)
        this.settings = {
            blockSize: null,
            channelCount: settings.outputChannelCount[0],
            bitDepth:
                settings.processorOptions.bitDepth,
            sampleRate: 
                settings.processorOptions.sampleRate,
        }
        this.dspConfigured = false
        this.engine = null
    }

    process(_, outputs) {
        const output = outputs[0]
        if (!this.dspConfigured) {
            if (!this.engine) {
                return true
            }
            this.settings.blockSize = output[0].length
            this.wasmOutputPointer = this.engine.configure(
                this.settings.sampleRate,
                this.settings.blockSize,
            )
            this.dspConfigured = true
        }

        const wasmOutput = this.engine.loop()
        for (let channel = 0; channel < this.settings.channelCount; channel++) {
            output[channel].set(
                wasmOutput.subarray(
                    this.settings.blockSize * channel,
                    this.settings.blockSize * (channel + 1)
                )
            )
        }
        return true
    }

    onMessage(message) {
        switch (message.data.type) {
            case 'WASM':
                this.setWasm(message.data.payload.wasmBuffer)
                    .then(() => this.setArrays(message.data.payload.arrays))
                break
            default:
                new Error(`unknown message type ${message.type}`)
        }
    }

    // TODO : control for channelCount of wasmModule
    setWasm(wasmBuffer) {
        return AssemblyscriptWasmBindings.createEngine(wasmBuffer, {
            bitDepth: this.settings.bitDepth,
            portSpecs: {},
        }).then(engine => {
            this.dspConfigured = false
            this.engine = engine
        })
    }

    setArrays(arrays) {
        Object.entries(arrays).forEach(([arrayName, arrayData]) => {
            if ((this.settings.bitDepth === 32 && arrayData.constructor !== Float32Array) 
                || (this.settings.bitDepth === 64 && arrayData.constructor !== Float64Array)) {
                console.error(`Received invalid array ${arrayName} : ${arrayData.constructor}, wrong type for bit-depth ${this.bitDepth}`)
                return
            }
            this.engine.setArray(arrayName, arrayData)
        })
    }
}

registerProcessor('wasm-node', WasmWorkletProcessor)
