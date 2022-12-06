import { buildRollupConfig } from '@webpd/dev/configs/rollup.mjs'
export default buildRollupConfig({ 
    importAsString: [
        '**/node_modules/@webpd/compiler-js/dist/assemblyscript-wasm-bindings.iife.js',
        '**/*WorkletProcessor.js',
    ] 
})