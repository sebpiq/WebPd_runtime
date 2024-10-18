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

interface Settings {
    sampleRate: number
    blockSize: number
}

const FS_CALLBACK_NAMES = [
    'onReadSoundFile',
    'onOpenSoundReadStream',
    'onWriteSoundFile',
    'onOpenSoundWriteStream',
    'onSoundStreamData',
    'onCloseSoundStream',
] as const

class WasmWorkletProcessor extends AudioWorkletProcessor {
    private settings: Settings
    private dspConfigured: boolean
    private engine: TypesForWorkletProcessor.Engine

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

    process(inputs: Float32Array[][], outputs: Float32Array[][]) {
        const output = outputs[0]
        const input = inputs[0]
        if (!this.dspConfigured) {
            if (!this.engine) {
                return true
            }
            this.settings.blockSize = output[0].length
            this.engine.initialize(
                this.settings.sampleRate,
                this.settings.blockSize
            )
            this.dspConfigured = true
        }

        this.engine.dspLoop(input, output)
        return true
    }

    onMessage(
        messageEvent: MessageEvent<TypesForWorkletProcessor.OutgoingMessage>
    ) {
        const message = messageEvent.data
        switch (message.type) {
            case 'code:WASM':
                this.setWasm(message.payload.wasmBuffer)
                break

            case 'code:JS':
                this.setJsCode(message.payload.jsCode)
                break

            case 'io:messageReceiver':
                this.engine.io.messageReceivers[message.payload.nodeId][
                    message.payload.portletId
                ](message.payload.message)
                break

            case 'fs':
                const returned = this.engine.globals.fs[
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
                new Error(`unknown message type ${(message as any).type}`)
        }
    }

    // TODO : control for channelCount of wasmModule
    setWasm(wasmBuffer: ArrayBuffer) {
        return AssemblyScriptWasmBindings.createEngine(wasmBuffer).then(
            (engine) => this.setEngine(engine)
        )
    }

    setJsCode(code: string) {
        const engine = JavaScriptBindings.createEngine(code)
        this.setEngine(engine)
    }

    setEngine(engine: TypesForWorkletProcessor.Engine) {
        if (engine.globals.fs) {
            FS_CALLBACK_NAMES.forEach((functionName) => {
                engine.globals.fs[functionName] = (...args: any) => {
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
        }
        Object.entries(engine.metadata.settings.io.messageSenders).forEach(
            ([nodeId, { portletIds }]) => {
                portletIds.forEach((portletId) => {
                    engine.io.messageSenders[nodeId][portletId] = (message) => {
                        this.port.postMessage({
                            type: 'io:messageSender',
                            payload: {
                                nodeId,
                                portletId,
                                message,
                            },
                        })
                    }
                })
            }
        )
        this.engine = engine
        this.dspConfigured = false
    }

    destroy() {
        this.process = () => false
    }
}

registerProcessor('webpd-node', WasmWorkletProcessor)
