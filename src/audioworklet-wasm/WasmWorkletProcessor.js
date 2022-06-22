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
            // `WasmOutputType` arrives as a string because it needs to be passed
            // between threads
            WasmOutputType:
                globalThis[settings.processorOptions.WasmOutputType],
        }
        this.dspConfigured = false
        this.wasmModule = null
    }

    process(_, outputs) {
        const output = outputs[0]
        if (!this.dspConfigured) {
            if (!this.wasmModule) {
                return true
            }
            this.settings.blockSize = output[0].length
            this.wasmOutputPointer = this.dspConfigure(this.settings.blockSize)
            this.dspConfigured = true
        }

        this.dspLoop()
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

    setWasm(wasmBuffer) {
        instantiateWasmModule(wasmBuffer).then((wasmModule) => {
            this.wasmModule = wasmModule
            this.wasmModuleMemory = wasmModule.instance.exports.memory
            this.dspConfigured = false
            this.dspLoop = wasmModule.instance.exports.loop
            this.dspConfigure = wasmModule.instance.exports.configure
        })
    }

    readChannel(channel, destination) {
        const wasmOutput = liftTypedArray(
            this.settings.WasmOutputType,
            this.wasmModuleMemory,
            this.wasmOutputPointer
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
const instantiateWasmModule = (wasmBuffer) => {
    return WebAssembly.instantiate(wasmBuffer, {
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
                console.log(text)
            },
        },
    })
}

// REF : Assemblyscript ESM bindings
const liftTypedArray = (TypedArrayConstructor, memory, pointer) => {
    pointer = pointer >>> 0
    const memoryU32 = new Uint32Array(memory.buffer)
    const source = new TypedArrayConstructor(
        memory.buffer,
        memoryU32[(pointer + 4) >>> 2],
        memoryU32[(pointer + 8) >>> 2] / TypedArrayConstructor.BYTES_PER_ELEMENT
    )
    return source
}

// REF : Assemblyscript ESM bindings
const liftString = (pointer) => {
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
