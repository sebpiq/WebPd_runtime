/**
 * This script transpiles the WorkletProcessor file to a JavaScript file.
 */
import ts from 'typescript'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
const { transpileModule } = ts

const WORKLET_PROCESSOR_TS_CODE = readFileSync('./src/WebPdWorkletProcessor.ts').toString('utf-8')
const WORKLET_PROCESSOR_JS_PATH = './src/assets/WebPdWorkletProcessor.js.txt'

const TRANSPILATION_SETTINGS: ts.TranspileOptions = {
    compilerOptions: {
        target: ts.ScriptTarget.ES2021,
        module: ts.ModuleKind.None,
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { outputText } = transpileModule(
        WORKLET_PROCESSOR_TS_CODE,
        TRANSPILATION_SETTINGS
    )
    writeFileSync(WORKLET_PROCESSOR_JS_PATH, outputText)
    console.log(`> ${WORKLET_PROCESSOR_JS_PATH} WRITTEN !`)
}