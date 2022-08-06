// Custom interface files to allow TS compilation in spite of imports with ".js"
// REF : https://stackoverflow.com/questions/47122504/import-raw-files-from-typescript-with-webpack-using-the-import-statement

declare module '*WorkletProcessor.js' {
    const content: string
    export default content
}

declare module '*/node_modules/@webpd/compiler-js/dist/asc-wasm-bindings.iife.js' {
    const content: string
    export default content
}