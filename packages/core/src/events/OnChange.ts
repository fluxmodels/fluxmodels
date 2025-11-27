import { EventsManager } from '../EventsManager'
import { type AnyRecord, type State, type StateProxy } from '../types'

/**
 * Arguments passed to {@link OnChange} handlers.
 */
export type OnChangeArgs<T extends AnyRecord = AnyRecord> = {
    /** State instance that triggered the change notification. */
    state: State<T> | StateProxy<T>
    /** Property that changed on the state object. */
    propName: string | symbol
    /** Previous value of the property. */
    prevValue: any
    /** New value assigned to the property. */
    newValue: any
}

/**
 * Handler signature for {@link OnChange} events.
 */
export type OnChangeHandler = (args: OnChangeArgs) => any

/**
 * Creates an event that fires whenever a state property changes.
 *
 * Handlers must satisfy {@link OnChangeHandler}.
 *
 * @returns Event used to subscribe to state change notifications.
 * @example
 * ```ts
 * class CounterModel {
 *     count = 0
 *
 *     @OnChange()
 *     handleChange(args: OnChangeArgs) {
 *         console.log(`${String(args.propName)} changed from`, args.prevValue, 'to', args.newValue)
 *     }
 * }
 *
 * const CounterModel = {
 *     count: 0,
 *     handleChange: OnChange((args: OnChangeArgs) => {
 *         console.log('Changed prop:', args.propName)
 *     })
 * }
 * ```
 */
export const OnChange = EventsManager.newEvent<OnChangeHandler>('OnChange')
