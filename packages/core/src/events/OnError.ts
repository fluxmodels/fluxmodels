import { MetaErrorHandlerPlaceType } from 'metatyper'

import { EventsManager } from '../EventsManager'

export type OnErrorHandlerArgsType = {
    state: any
    error: Error
    errorPlace: MetaErrorHandlerPlaceType // 'init' | 'get' | 'set' | 'define' | 'delete' | 'validate' | 'deserialize' | 'serialize'
}
export type OnErrorHandlerType = (args: OnErrorHandlerArgsType) => any

/**
 * OnError is an event that is triggered when an error occurs while states are being changed.
 *
 * @example
 *
 * ```ts
 * class Model {
 *     error = ''
 *
 *     @OnError()
 *     errorHandler(args: OnErrorHandlerArgsType) {
 *         // will be called when an error occurs while states are being changed
 *
 *         this.error = args.error.message
 *     }
 * }
 *
 * // or
 *
 * const Model = {
 *     errorHandler: OnError((args: OnErrorHandlerArgsType) => {
 *         // will be called when an error occurs while states are being changed
 *     })
 * }
 * ```
 */
export const OnError = EventsManager.newEvent<OnErrorHandlerType>('OnError')
