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

        this.engine.loop()
        for (let channel = 0; channel < this.settings.channelCount; channel++) {
            this.readChannel(channel, output[channel])
        }
        return true
    }

    onMessage(message) {
        switch (message.data.type) {
            case 'WASM':
                // globalThis[GLOBAL_ARRAYS_VARIABLE_NAME] = message.data.payload.arrays
                this.setWasm(message.data.payload.wasmBuffer)
                break
            default:
                new Error(`unknown message type ${message.type}`)
        }
    }

    // TODO : control for channelCount of wasmModule
    setWasm(wasmBuffer) {
        instantiateWasmModule(wasmBuffer).then((wasmModule) => {
            this.engine = wasmModule.instance.exports
            this.dspConfigured = false
        })
    }

    readChannel(channel, destination) {
        const wasmOutput = liftTypedArray(
            this.engine,
            this.settings.bitDepth === 32 ? Float32Array : Float64Array,
            this.wasmOutputPointer,
        )
        destination.set(
            wasmOutput.subarray(
                this.settings.blockSize * channel,
                this.settings.blockSize * (channel + 1)
            )
        )
    }
}

// REF : Assemblyscript ESM bindings
const instantiateWasmModule = async (wasmBuffer) => {
    const wasmModule = await WebAssembly.instantiate(wasmBuffer, {
        env: {
            abort(message, fileName, lineNumber, columnNumber) {
                message = liftString(message >>> 0)
                fileName = liftString(fileName >>> 0)
                lineNumber = lineNumber >>> 0
                columnNumber =
                    columnNumber >>>
                    0(() => {
                        throw Error(
                            `${message} in ${fileName}:${lineNumber}:${columnNumber}`
                        )
                    })()
            },
            seed() {
                return (() => {
                    return Date.now() * Math.random()
                })()
            },
            'console.log'(text) {
                console.log(liftString(wasmModule.instance.exports.memory, text))
            },
        },
    })
    return wasmModule
}

// REF : Assemblyscript ESM bindings
export const liftTypedArray = (
    engine,
    constructor,
    pointer,
) => {
    if (!pointer) return null
    const memoryU32 = new Uint32Array(engine.memory.buffer)
    return new constructor(
        engine.memory.buffer,
        memoryU32[(pointer + 4) >>> 2],
        memoryU32[(pointer + 8) >>> 2] / constructor.BYTES_PER_ELEMENT
    ).slice()
}

// REF : Assemblyscript ESM bindings
const liftString = (memory, pointer) => {
    if (!pointer) return null
    const end =
        (pointer + new Uint32Array(memory.buffer)[(pointer - 4) >>> 2]) >>> 1
    const memoryU16 = new Uint16Array(memory.buffer)
    let start = pointer >>> 1
    let string = ''
    while (end - start > 1024) {
        string += String.fromCharCode(
            ...memoryU16.subarray(start, (start += 1024))
        )
    }
    return string + String.fromCharCode(...memoryU16.subarray(start, end))
}

registerProcessor('wasm-node', WasmWorkletProcessor)
