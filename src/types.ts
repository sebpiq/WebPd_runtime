import { FS_OPERATION_FAILURE, FS_OPERATION_SUCCESS } from '@webpd/compiler-js'

export type FloatArrayType = typeof Float32Array | typeof Float64Array

export type FloatArray = Float32Array | Float64Array

export type OperationStatus =
    | typeof FS_OPERATION_FAILURE
    | typeof FS_OPERATION_SUCCESS
