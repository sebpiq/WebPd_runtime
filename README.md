WasmWorkletProcessor
----------------------

Problems with bitDepth 32. Probably because of float roundings of Wasm module generated with AssemblyScript.

Problem with bundling the ASC Wasm bindings. A solution would have been to import the module from the worklet with a simple ES `import` statement, but that isn't possible in Firefox (see ticket : https://bugzilla.mozilla.org/show_bug.cgi?id=1572644). For now we must therefore use a module built as an iife and concatenate the code with the worklet code.


TODO 
-----

Unit tests

