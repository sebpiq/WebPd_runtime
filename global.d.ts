// Custom interface files to allow TS compilation in spite of imports with ".js"
// REF : https://stackoverflow.com/questions/47122504/import-raw-files-from-typescript-with-webpack-using-the-import-statement
import type { createAssemblyScriptWasmEngine } from "@webpd/compiler"
import type { createJavaScriptEngine } from "@webpd/compiler"
import type { Engine } from "@webpd/compiler"
import type { OutgoingMessage } from "./src/WebPdWorkletNode"

// These declarations are for types to be correctly defined in WorkletProcessor .ts files.
declare global {
    module AssemblyScriptWasmBindings {
        const createEngine: typeof createAssemblyScriptWasmEngine
    }

    module JavaScriptBindings {
        const createEngine: typeof createJavaScriptEngine
    }
    
    // When transpiling TS even with module = None, TS generates some export code for esModuleInterop.
    // Only way to deactivate this is to have no export / import statement in the module to transpile.
    // Fix : https://github.com/Microsoft/TypeScript/issues/14351
    module TypesForWorkletProcessor {
        export { Engine, OutgoingMessage }
    }
}

declare module '*WorkletProcessor.generated' {
    const content: string
    export default content
}

declare module '*-bindings.iife' {
    const content: string
    export default content
}