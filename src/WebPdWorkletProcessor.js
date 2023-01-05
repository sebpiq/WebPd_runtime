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
            bitDepth: settings.processorOptions.bitDepth,
            sampleRate: settings.processorOptions.sampleRate,
        }
        this.dspConfigured = false
        this.engine = null
    }

    process(inputs, outputs) {
        const output = outputs[0]
        const input = inputs[0]
        if (!this.dspConfigured) {
            if (!this.engine) {
                return true
            }
            this.settings.blockSize = output[0].length
            this.engine.configure(
                this.settings.sampleRate,
                this.settings.blockSize
            )
            this.dspConfigured = true
        }

        this.engine.loop(input, output)
        return true
    }

    onMessage(message) {
        console.log(message.data)
        switch (message.data.type) {
            case 'code:WASM':
                this.setWasm(message.data.payload.wasmBuffer).then(() =>
                    this.setArrays(message.data.payload.arrays)
                )
                break
            case 'code:JS':
                this.setJsCode(message.data.payload.jsCode)
                this.setArrays(message.data.payload.arrays)
                break
            case 'fs':
                const returned = this.engine.fs[
                    message.data.payload.functionName
                ](...message.data.payload.arguments)
                this.port.postMessage({
                    type: 'fs',
                    payload: {
                        functionName:
                            message.data.payload.functionName + '_return',
                        operationId: message.data.payload.arguments[0],
                        returned,
                    },
                })
                break
            default:
                new Error(`unknown message type ${message.type}`)
        }
    }

    // TODO : control for channelCount of wasmModule
    setWasm(wasmBuffer) {
        return AssemblyscriptWasmBindings.createEngine(wasmBuffer).then(
            (engine) => {
                this.setEngine(engine)
                return engine
            }
        )
    }

    setJsCode(code) {
        const engine = new Function(`
            ${code}
            return exports
        `)()
        this.setEngine(engine)
    }

    setEngine(engine) {
        ;['onRequestReadSoundFile', 'onRequestReadSoundStream', 'onRequestWriteSoundFile'].forEach(
            (functionName) => {
                engine.fs[functionName] = (...args) => {
                    this.port.postMessage({
                        type: 'fs',
                        payload: {
                            functionName,
                            arguments: args,
                        },
                    })
                }
            }
        )
        this.engine = engine
        this.dspConfigured = false
    }

    setArrays(arrays) {
        Object.entries(arrays).forEach(([arrayName, arrayData]) => {
            if (
                (this.settings.bitDepth === 32 &&
                    arrayData.constructor !== Float32Array) ||
                (this.settings.bitDepth === 64 &&
                    arrayData.constructor !== Float64Array)
            ) {
                console.error(
                    `Received invalid array ${arrayName} : ${arrayData.constructor}, wrong type for bit-depth ${this.bitDepth}`
                )
                return
            }
            this.engine.setArray(arrayName, arrayData)
        })
    }
}

registerProcessor('webpd-node', WasmWorkletProcessor)
