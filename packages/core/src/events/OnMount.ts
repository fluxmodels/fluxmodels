import { EventsManager } from '../EventsManager'
import { type AnyRecord, type StateProxy } from '../types'

/**
 * Arguments passed to {@link OnMount} handlers.
 */
export type OnMountArgs<T extends AnyRecord = AnyRecord> = {
    /** State proxy that has just mounted. */
    stateProxy: StateProxy<T>
    /** Optional context provided when mounting the proxy (e.g., render metadata). */
    context?: Record<string, any>
}

/**
 * Handler signature for {@link OnMount} events.
 */
export type OnMountHandler = (args: OnMountArgs) => any

/**
 * Creates an event that fires when a state proxy is mounted.
 *
 * Handlers must satisfy {@link OnMountHandler}.
 *
 * @returns Event used to subscribe to mount notifications.
 * @example
 * ```ts
 * class TodoListModel {
 *     items: string[] = []
 *
 *     @OnMount()
 *     setupEffects({ context }: OnMountArgs) {
 *         console.log('Mounted with render context', context)
 *     }
 * }
 * ```
 */
export const OnMount = EventsManager.newEvent<OnMountHandler>('OnMount')
