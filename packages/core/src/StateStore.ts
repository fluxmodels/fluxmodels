import { type StateType } from './StateManager'

export const StateDefaultKeySymbol = Symbol('[[StateDefaultKey]]')

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
    static readonly defaultStore = new StateStore()

    protected statesMaps = new Map<any, Map<any, StateType<any>>>()

    /**
     * Finds a state associated with the given model and key.
     *
     * @param model - The model to find the state for.
     * @param keyFindFunc - A function that takes the existing key and state, and returns true if the state matches the criteria.
     * @returns The state if found, otherwise null.
     */
    findState<T extends Record<keyof any, any>>(
        model: (new (...args: any[]) => T) | ((...args: any[]) => T) | T,
        keyFindFunc: (existsKey: any, state: T) => boolean
    ): StateType<T> | null {
        const statesMap = this.statesMaps.get(model)

        if (!statesMap) return null

        return (
            Array.from(statesMap.entries()).find(([existsKey, state]) =>
                keyFindFunc(existsKey, state)
            )?.[1] || null
        )
    }

    /**
     * Retrieves all states associated with the given model.
     *
     * @param model - The model to retrieve states for.
     * @param keyFilterFunc - An optional function to filter states by key.
     * @returns An array of states associated with the model.
     */
    getStates<T extends Record<keyof any, any>>(
        model: (new (...args: any[]) => T) | ((...args: any[]) => T) | T,
        keyFilterFunc?: (existsKey: any, state: T) => boolean
    ): StateType<T>[] {
        const statesMap = this.statesMaps.get(model)

        if (!statesMap) return []

        let states = Array.from(statesMap.entries())

        if (keyFilterFunc) {
            states = states.filter(([key, state]) => keyFilterFunc(key, state))
        }

        return states.map(([, state]) => state)
    }

    /**
     * Adds a state to the store for the given model and key.
     *
     * @param model - The model to add the state for.
     * @param state - The state to add.
     * @param key - An optional custom key for the state.
     */
    addState<T extends Record<keyof any, any>>(
        model: (new (...args: any[]) => T) | ((...args: any[]) => T) | T,
        state: StateType<T>,
        key?: any
    ): void {
        let statesMap = this.statesMaps.get(model)

        if (!statesMap) {
            statesMap = new Map()
            this.statesMaps.set(model, statesMap)
        }

        if (!key) {
            key = StateDefaultKeySymbol
        }

        statesMap.set(key, state)
    }

    /**
     * Clears the entire state store.
     */
    clearStore() {
        this.statesMaps = new Map()
    }
}
