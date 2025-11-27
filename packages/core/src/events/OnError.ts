import { MetaErrorHandlerPlaceType } from 'metatyper'

import { EventsManager } from '../EventsManager'
import { type AnyRecord, type State, type StateProxy } from '../types'

/**
 * Arguments passed to {@link OnError} handlers.
 */
export type OnErrorArgs<T extends AnyRecord = AnyRecord> = {
    /** State instance whose operation caused the error. */
    state: State<T> | StateProxy<T>
    /** Error thrown by the state lifecycle or metadata hooks. */
    error: Error
    /**
     * Stage of the state lifecycle where the error occurred.
     *
     * Matches the MetaErrorHandlerPlaceType emitted by [metatyper](https://github.com/metatyper/metatyper?tab=readme-ov-file#errors) (init | get | set | define | delete | validate | deserialize | serialize).
     */
    errorPlace: MetaErrorHandlerPlaceType
}

/**
 * Handler signature for {@link OnError} events.
 */
export type OnErrorHandler = (args: OnErrorArgs) => any

/**
 * Creates an event that fires when an error occurs while mutating or resolving state.
 *
 * Handlers must satisfy {@link OnErrorHandler}.
 *
 * @returns Event used to subscribe to error notifications.
 * @example
 * ```ts
 * class FormModel {
 *     error = ''
 *
 *     @OnError()
 *     handleError(args: OnErrorArgs) {
 *         this.error = `Failed during ${args.errorPlace}: ${args.error.message}`
 *     }
 * }
 *
 * const FormModel = {
 *     error: '',
 *     handleError: OnError((args: OnErrorArgs) => {
 *         console.error('State error', args.error)
 *     })
 * }
 * ```
 */
export const OnError = EventsManager.newEvent<OnErrorHandler>('OnError')
