import { DefaultStoreSymbol, DEFAULT_STATE_KEY } from './constants'

import { type AnyRecord, type StateModel, type StateKey, type State } from './types'

/**
 * StateStore is responsible for managing and storing state instances.
 * It provides methods to find, retrieve, and add states associated with models.
 *
 * The store uses a two-level map structure:
 * - The outer map uses the model as the key and stores an inner map for each model.
 * - The inner map uses a custom key (or a default symbol) to store individual state instances.
 *
 * This structure allows efficient storage and retrieval of states based on their models and keys from the RAM memory.
 */
export class StateStore {
    static get defaultStore() {
        const globThis = globalThis as any

        let store = globThis[DefaultStoreSymbol]

        if (!store) {
            store = globThis[DefaultStoreSymbol] = new StateStore()
        }

        return store as StateStore
    }

    protected statesMaps = new Map<any, Map<StateKey, State<any>>>()

    /**
     * Finds a state associated with the given model and key.
     *
     * @param model - The model to find the state for.
     * @param key - The key to find the state for.
     * @returns The state if found, otherwise null.
     */
    findState<T extends AnyRecord>(model: StateModel<T>, key: StateKey): State<T> | null {
        const statesMap = this.statesMaps.get(model) as Map<StateKey, State<T>>

        if (!statesMap) {
            return null
        }

        return statesMap.get(key) || null
    }

    /**
     * Retrieves all states associated with the given model.
     *
     * @param model - The model to retrieve states for.
     * @param keyFilterFunc - An optional function to filter states by key.
     * @returns An array of states associated with the model.
     */
    findStates<T extends AnyRecord>(
        model: StateModel<T>,
        keyFilterFunc?: (existsKey: StateKey, state: State<T>) => boolean
    ): State<T>[] {
        const statesMap = this.statesMaps.get(model) as Map<StateKey, State<T>>

        if (!statesMap) {
            return []
        }

        let states = Array.from(statesMap.entries())

        if (keyFilterFunc) {
            states = states.filter(([key, state]) => keyFilterFunc(key, state))
        }

        return states.map(([, state]) => state)
    }

    /**
     * Retrieves all keys associated with the given model.
     *
     * @param model - The model to retrieve keys for.
     * @returns An array of keys associated with the model.
     */
    getKeys<T extends AnyRecord>(model: StateModel<T>): StateKey[] {
        const statesMap = this.statesMaps.get(model) as Map<StateKey, State<T>>

        if (!statesMap) return []

        return Array.from(statesMap.keys())
    }

    /**
     * Adds a state to the store for the given model and key.
     *
     * @param model - The model to add the state for.
     * @param state - The state to add.
     * @param key - An optional custom key for the state. If not provided, the default key will be used.
     */
    addState<T extends AnyRecord>(model: StateModel<T>, state: State<T>, key?: StateKey): void {
        let statesMap = this.statesMaps.get(model) as Map<StateKey, State<T>>

        if (!statesMap) {
            statesMap = new Map()
            this.statesMaps.set(model, statesMap)
        }

        if (!key) {
            key = DEFAULT_STATE_KEY
        }

        statesMap.set(key, state)
    }

    /**
     * Removes a state from the store for the given model and key.
     *
     * @param model - The model to remove the state for.
     * @param key - The key of the state to remove.
     */
    removeState<T extends AnyRecord>(model: StateModel<T>, key: StateKey): void {
        const statesMap = this.statesMaps.get(model) as Map<StateKey, State<T>>

        if (!statesMap) {
            return
        }

        statesMap.delete(key)
    }

    /**
     * Clears the entire state store.
     */
    clearStore() {
        this.statesMaps = new Map()
    }
}
