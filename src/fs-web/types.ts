import { FS_OPERATION_FAILURE, FS_OPERATION_SUCCESS } from '@webpd/compiler-js'

export type OperationStatus =
    | typeof FS_OPERATION_FAILURE
    | typeof FS_OPERATION_SUCCESS
