import { buildRollupConfig } from '@webpd/shared/configs/rollup.mjs'
export default buildRollupConfig({ 
    importAsString: [
        '**/node_modules/@webpd/compiler-js/dist/bindings.js',
        '**/*WorkletProcessor.js',
    ] 
})