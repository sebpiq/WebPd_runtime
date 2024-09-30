/*
 * Copyright (c) 2022-2023 Sébastien Piquemal <sebpiq@protonmail.com>, Chris McCormick.
 *
 * This file is part of WebPd
 * (see https://github.com/sebpiq/WebPd).
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import type { createAssemblyScriptWasmEngine } from "@webpd/compiler"
import type { createJavaScriptEngine } from "@webpd/compiler"
import type { Engine } from "@webpd/compiler"
import type { OutgoingMessage } from './types'

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
