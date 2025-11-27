import { EventsManager } from '../EventsManager'
import { type AnyRecord, type State } from '../types'

/**
 * Arguments passed to {@link OnInit} handlers.
 */
export type OnInitArgs<T extends AnyRecord = AnyRecord> = {
    /** State instance that has just been initialized. */
    state: State<T>
}

/**
 * Handler signature for {@link OnInit} events.
 */
export type OnInitHandler = (args: OnInitArgs) => any

/**
 * Creates an event that fires when a state finishes initialization.
 *
 * Handlers must satisfy {@link OnInitHandler}.
 *
 * @returns Event used to subscribe to init notifications.
 * @example
 * ```ts
 * class SessionModel {
 *     token = ''
 *
 *     @OnInit()
 *     hydrate(args: OnInitArgs) {
 *         args.state.token = window.sessionStorage.getItem('token') ?? ''
 *     }
 * }
 * ```
 * @example
 * ```ts
 * class UserProfileModel {
 *     name = ''
 * }
 * class UserModel {
 *     profile = InjectModel(UserProfileModel, { keyFrom: INJECT_KEY })
 *
 *     @OnInit()
 *     async loadProfile(args: OnInitArgs) {
 *         args.state.profile = await fetch('/api/profile').then(r => r.json())
 *     }
 * }
 * ```
 */
export const OnInit = EventsManager.newEvent<OnInitHandler>('OnInit')
