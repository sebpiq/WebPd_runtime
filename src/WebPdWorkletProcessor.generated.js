/*
 * Copyright (c) 2022-2023 Sébastien Piquemal <sebpiq@protonmail.com>, Chris McCormick.
 *
 * This file is part of WebPd 
 * (see https://github.com/sebpiq/WebPd).
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
const FS_CALLBACK_NAMES = [
    'onReadSoundFile',
    'onOpenSoundReadStream',
    'onWriteSoundFile',
    'onOpenSoundWriteStream',
    'onSoundStreamData',
    'onCloseSoundStream',
]
class WasmWorkletProcessor extends AudioWorkletProcessor {
    constructor() {
        super()
        this.port.onmessage = this.onMessage.bind(this)
        this.settings = {
            blockSize: null,
            sampleRate,
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
    onMessage(messageEvent) {
        const message = messageEvent.data
        switch (message.type) {
            case 'code:WASM':
                this.setWasm(message.payload.wasmBuffer)
                break
            case 'code:JS':
                this.setJsCode(message.payload.jsCode)
                break
            case 'inletCaller':
                this.engine.inletCallers[message.payload.nodeId][
                    message.payload.portletId
                ](message.payload.message)
                break
            case 'fs':
                const returned = this.engine.fs[
                    message.payload.functionName
                ].apply(null, message.payload.arguments)
                this.port.postMessage({
                    type: 'fs',
                    payload: {
                        functionName: message.payload.functionName + '_return',
                        operationId: message.payload.arguments[0],
                        returned,
                    },
                })
                break
            case 'destroy':
                this.destroy()
                break
            default:
                new Error(`unknown message type ${message.type}`)
        }
    }
    // TODO : control for channelCount of wasmModule
    setWasm(wasmBuffer) {
        return AssemblyScriptWasmBindings.createEngine(wasmBuffer).then(
            (engine) => this.setEngine(engine)
        )
    }
    setJsCode(code) {
        const engine = JavaScriptBindings.createEngine(code)
        this.setEngine(engine)
    }
    setEngine(engine) {
        FS_CALLBACK_NAMES.forEach((functionName) => {
            engine.fs[functionName] = (...args) => {
                // We don't use transferables, because that would imply reallocating each time new array in the engine.
                this.port.postMessage({
                    type: 'fs',
                    payload: {
                        functionName,
                        arguments: args,
                    },
                })
            }
        })
        this.engine = engine
        this.dspConfigured = false
    }
    destroy() {
        this.process = () => false
    }
}
registerProcessor('webpd-node', WasmWorkletProcessor)
