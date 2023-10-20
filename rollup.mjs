import { buildRollupConfig } from '@webpd/dev/configs/rollup.mjs'
export default buildRollupConfig({ 
    importAsString: [
        '/**/javascript-bindings.iife.js',
        '/**/assemblyscript-wasm-bindings.iife.js',
        '**/*WorkletProcessor.generated.js',
    ]
})