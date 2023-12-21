import { buildRollupConfig } from '@webpd/dev/configs/dist.rollup.mjs'
export default buildRollupConfig({ 
    importAsString: [
        '/**/javascript-bindings.iife.js',
        '/**/assemblyscript-wasm-bindings.iife.js',
        'src/assets/*',
    ]
})