import type { createEngine as _createEngine } from "@webpd/compiler-js/src/engine-assemblyscript/AssemblyScriptWasmEngine"
import type { Engine } from "@webpd/compiler-js"
import type { OutgoingMessage } from "./src/WebPdWorkletNode"

// These declarations are for types to be correctly defined in WorkletProcessor .ts files.
declare global {
    module AssemblyscriptWasmBindings {
        const createEngine: typeof _createEngine
    }
    
    // When transpiling TS even with module = None, TS generates some export code for esModuleInterop.
    // Only way to deactivate this is to have no export / import statement in the module to transpile.
    // Fix : https://github.com/Microsoft/TypeScript/issues/14351
    module TypesForWorkletProcessor {
        export { Engine, OutgoingMessage }
    }
}