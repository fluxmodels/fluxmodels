import { StateManager } from '../StateManager'
import { type AnyRecord, type StateProxy } from '../types'

/**
 * Returns the key of the state.
 *
 * @example
 * ```ts
 * class UserModel {
 *     username = '',
 *
 *     get key() {
 *         return getKey(this)
 *     }
 * }
 *
 * const [userState] = StateManager.getOrCreateState(UserModel, { key: 1 })
 * console.log(getKey(userState)) // 1
 * ```
 *
 * @param state - The state object.
 * @returns The key of the state.
 */
export function getKey(state: AnyRecord) {
    return StateManager.instance(state as StateProxy)?.key
}

/**
 * Returns the store of the state.
 *
 * Example:
 * ```ts
 * class UserModel {
 *     username = '',
 *
 *     get store() {
 *         return getStore(this)
 *     }
 * }
 *
 * const [userState] = StateManager.getOrCreateState(UserModel)
 * console.log(getStore(userState)) // StateStore.defaultStore
 * ```
 *
 * @param state - The state object.
 * @returns The store of the state.
 */
export function getStore(state: AnyRecord) {
    return StateManager.instance(state as StateProxy)?.store
}

/**
 * Returns the model of the state.
 *
 * @param state - The state object.
 * @returns The model of the state.
 */
export function getModel(state: AnyRecord) {
    return StateManager.instance(state as StateProxy)?.model
}
