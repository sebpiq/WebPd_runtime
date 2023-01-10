import { buildRollupConfig } from '@webpd/dev/configs/rollup.mjs'
export default buildRollupConfig({ 
    importAsString: [
        '/**/assemblyscript-wasm-bindings.iife.js',
        '**/*WorkletProcessor.generated.js',
    ] 
})