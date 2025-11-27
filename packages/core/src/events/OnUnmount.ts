import { EventsManager } from '../EventsManager'
import { type AnyRecord, type StateProxy } from '../types'

/**
 * Arguments passed to {@link OnUnmount} handlers.
 */
export type OnUnmountArgs<T extends AnyRecord = AnyRecord> = {
    /** State proxy that is about to be unmounted. */
    stateProxy: StateProxy<T>
    /** Optional context supplied when the proxy was mounted. */
    context?: Record<string, any>
}

/**
 * Handler signature for {@link OnUnmount} events.
 */
export type OnUnmountHandler = (args: OnUnmountArgs) => any

/**
 * Creates an event that fires when a state proxy is unmounted.
 *
 * Handlers must satisfy {@link OnUnmountHandler}.
 *
 * @returns Event used to subscribe to unmount notifications.
 * @example
 * ```ts
 * class TodoListModel {
 *     @OnUnmount()
 *     teardown({ stateProxy }: OnUnmountArgs) {
 *         console.log('Unmounting proxy', stateProxy)
 *     }
 * }
 * ```
 */
export const OnUnmount = EventsManager.newEvent<OnUnmountHandler>('OnUnmount')
