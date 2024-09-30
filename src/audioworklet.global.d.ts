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


/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletGlobalScope/currentFrame) */
declare const currentFrame: number
/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletGlobalScope/currentTime) */
declare const currentTime: number
/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletGlobalScope/sampleRate) */
declare const sampleRate: number
/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletGlobalScope/registerProcessor) */
declare const registerProcessor: (
    name: string,
    processorCtor: typeof AudioWorkletProcessor
) => void

interface AudioWorkletProcessor {
    readonly port: MessagePort
}

interface AudioWorkletProcessorImpl extends AudioWorkletProcessor {
    process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: Record<string, Float32Array>
    ): boolean
}

declare const AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor
    new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor
}