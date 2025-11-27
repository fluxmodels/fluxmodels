import { StateKey } from './types'

export const IsStateSymbol = Symbol.for('[[IsState]]')
export const IsStateProxySymbol = Symbol.for('[[IsStateProxy]]')
export const StateReferenceSymbol = Symbol.for('[[StateReference]]')
export const StateManagerSymbol = Symbol.for('[[StateManager]]')
export const StateProxyManagerSymbol = Symbol.for('[[StateProxyManager]]')
export const StateProxySnapshotSymbol = Symbol.for('[[StateProxySnapshot]]')
export const EventsHandlersSymbol = Symbol.for('[[EventsHandlers]]')

/**
 * Global key used by `StateStore.defaultStore` to cache the singleton store on `globalThis`.
 * The symbol ensures the default store instance is shared safely across module boundaries.
 */
export const DefaultStoreSymbol = Symbol.for('[[DefaultStore]]')

/**
 * Symbol used to setting state args on a state model
 */
export const STATE_ARGS = Symbol.for('[[StateArgs]]')

/**
 * Marker value for `InjectModel` configurations that should reuse the parent state's store.
 * When encountered, `InjectModelImpl` replaces it with the store resolved from `StateManager.instance()`.
 */
export const INJECT_STORE = Symbol.for('[[InjectStore]]')

/**
 * Marker value for `InjectModel` configurations that should reuse the parent state's key.
 * When `keyFrom` equals `INJECT_KEY`, `InjectModelImpl` reads the key from the current state via `StateManager.instance()`.
 */
export const INJECT_KEY = Symbol.for('[[InjectKey]]')

/**
 * Sentinel key assigned when a state is stored without an explicit key.
 * `StateStore.addState` and `InjectModelImpl` rely on it to group states under a predictable default entry.
 */
export const DEFAULT_STATE_KEY: StateKey = '[[DefaultStateKey]]' // just a string, not a symbol
