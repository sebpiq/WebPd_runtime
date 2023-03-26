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
import makeFetchRetry from 'fetch-retry'
import { FloatArray, FloatArrayType } from './types'

const fetchRetry = makeFetchRetry(fetch)

/**
 * Note : the audio worklet feature is available only in secure context.
 * This function will fail when used in insecure context (non-https, etc ...)
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet
 */
export const addModule = async (
    context: AudioContext,
    processorCode: string
) => {
    const blob = new Blob([processorCode], { type: 'text/javascript' })
    const workletProcessorUrl = URL.createObjectURL(blob)
    return context.audioWorklet.addModule(workletProcessorUrl)
}

// TODO : testing
export const fetchFile = async (url: string) => {
    let response: Response
    try {
        response = await fetchRetry(url, { retries: 3 })
    } catch (err) {
        throw new FileError(response.status, err.toString())
    }
    if (!response.ok) {
        const responseText = await response.text()
        throw new FileError(response.status, responseText)
    }
    return response.arrayBuffer()
}

export const audioBufferToArray = (
    audioBuffer: AudioBuffer
): Array<FloatArray> => {
    const sound: Array<FloatArray> = []
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        sound.push(audioBuffer.getChannelData(channel))
    }
    return sound
}

// TODO : testing
export const fixSoundChannelCount = (
    sound: Array<FloatArray>,
    targetChannelCount: number
) => {
    if (sound.length === 0) {
        throw new Error(`Received empty sound`)
    }
    const floatArrayType = sound[0].constructor as FloatArrayType
    const frameCount = sound[0].length
    const fixedSound = sound.slice(0, targetChannelCount)
    while (sound.length < targetChannelCount) {
        fixedSound.push(new floatArrayType(frameCount))
    }
    return fixedSound
}

export const urlDirName = (patchUrl: string): string => {
    if (isExternalUrl(patchUrl)) {
        return new URL('.', patchUrl).href
    } else {
        return new URL('.', new URL(patchUrl, document.URL).href).href
    }
}

export const resolveRelativeUrl = (rootUrl: string, relativeUrl: string) => {
    return new URL(relativeUrl, rootUrl).href
}

// REF : https://stackoverflow.com/questions/10687099/how-to-test-if-a-url-string-is-absolute-or-relative
export const isExternalUrl = (urlString: string) => {
    try {
        const url = new URL(urlString)
        if (url.origin !== new URL(document.URL, document.baseURI).origin) {
            return true
        }
    } catch (_e) {
        new URL(urlString, window.document.baseURI)
    }
    return false
}

export class FileError extends Error {
    constructor(status: Response['status'], msg: string) {
        super(`Error ${status} : ${msg}`)
    }
}
