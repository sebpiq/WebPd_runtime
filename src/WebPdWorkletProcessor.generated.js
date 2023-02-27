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
const FS_CALLBACK_NAMES = [
    'onReadSoundFile',
    'onOpenSoundReadStream',
    'onWriteSoundFile',
    'onOpenSoundWriteStream',
    'onSoundStreamData',
    'onCloseSoundStream',
];
class WasmWorkletProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.port.onmessage = this.onMessage.bind(this);
        this.settings = {
            blockSize: null,
            sampleRate,
        };
        this.dspConfigured = false;
        this.engine = null;
    }
    process(inputs, outputs) {
        const output = outputs[0];
        const input = inputs[0];
        if (!this.dspConfigured) {
            if (!this.engine) {
                return true;
            }
            this.settings.blockSize = output[0].length;
            this.engine.configure(this.settings.sampleRate, this.settings.blockSize);
            this.dspConfigured = true;
        }
        this.engine.loop(input, output);
        return true;
    }
    onMessage(messageEvent) {
        const message = messageEvent.data;
        switch (message.type) {
            case 'code:WASM':
                this.setWasm(message.payload.wasmBuffer);
                break;
            case 'code:JS':
                this.setJsCode(message.payload.jsCode);
                break;
            case 'inletCaller':
                this.engine.inletCallers[message.payload.nodeId][message.payload.portletId](message.payload.message);
                break;
            case 'fs':
                const returned = this.engine.fs[message.payload.functionName].apply(null, message.payload.arguments);
                this.port.postMessage({
                    type: 'fs',
                    payload: {
                        functionName: message.payload.functionName + '_return',
                        operationId: message.payload.arguments[0],
                        returned,
                    },
                });
                break;
            case 'destroy':
                this.destroy();
                break;
            default:
                new Error(`unknown message type ${message.type}`);
        }
    }
    // TODO : control for channelCount of wasmModule
    setWasm(wasmBuffer) {
        return AssemblyscriptWasmBindings.createEngine(wasmBuffer).then((engine) => {
            this.setEngine(engine);
            return engine;
        });
    }
    setJsCode(code) {
        const engine = new Function(`
            ${code}
            return exports
        `)();
        this.setEngine(engine);
    }
    setEngine(engine) {
        FS_CALLBACK_NAMES.forEach((functionName) => {
            ;
            engine.fs[functionName] = (...args) => {
                // We don't use transferables, because that would imply reallocating each time new array in the engine.
                this.port.postMessage({
                    type: 'fs',
                    payload: {
                        functionName,
                        arguments: args,
                    },
                });
            };
        });
        this.engine = engine;
        this.dspConfigured = false;
    }
    destroy() {
        this.process = () => false;
    }
}
registerProcessor('webpd-node', WasmWorkletProcessor);
