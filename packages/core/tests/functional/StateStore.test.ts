import { NUMBER } from 'metatyper'

import { StateStore, StateManager, type State } from '../../src'

describe('StateStore', () => {
    let store: StateStore

    beforeEach(() => {
        store = new StateStore()
    })

    afterEach(() => {
        store.clearStore()
    })

    it('adds state instances to the store', () => {
        const model = {}

        const state1 = { value: 'state1' } as unknown as State
        const state2 = { value: 'state2' } as unknown as State
        const state3 = { value: 'state3' } as unknown as State

        const key1 = 'value1'
        const key2 = 'value2'

        store.addState(model, state1, key1)
        store.addState(model, state2, key2)
        store.addState(model, state3)

        expect(store.findStates(model)).toEqual([state1, state2, state3])
    })

    it('finds a state by key predicate', () => {
        const model = {}

        const state2 = { _: true }

        store.addState(model, {} as unknown as State, 'value1')
        store.addState(model, state2 as unknown as State, 'value2')
        store.addState(model, {} as unknown as State)

        const resultState = store.findState(model, 'value2')

        expect(resultState).toBe(state2)

        expect(store.findState({}, 'any')).toEqual(null)
    })

    it('finds states by key predicate', () => {
        const model = {}

        const state2 = { _: true }

        store.addState(model, {} as unknown as State, 'value1')
        store.addState(model, state2 as unknown as State, 'value2')
        store.addState(model, {} as unknown as State)

        const resultStates = store.findStates(model, (key) => key === 'value2')

        expect(resultStates).toEqual([state2])

        expect(store.findStates({})).toEqual([])
    })

    it('removes state instances and clears the store', () => {
        const model = {}

        const state1 = { value: 'state1' } as unknown as State
        const state2 = { value: 'state2' } as unknown as State

        store.addState(model, state1, 'key1')
        store.addState(model, state2, 'key2')

        expect(store.findStates(model)).toEqual([state1, state2])

        store.removeState(model, 'key1')
        expect(store.findStates(model)).toEqual([state2])

        store.removeState(model, 'unknown')
        expect(store.findStates(model)).toEqual([state2])

        store.clearStore()
        expect(store.findStates(model)).toEqual([])
    })

    it('falls back to the default store when none is provided', () => {
        class Model {
            field = NUMBER({ default: 1 })
        }

        const [state] = StateManager.getOrCreateState(Model, { key: 'key1' })

        const found = StateStore.defaultStore.findState(Model, 'key1')

        expect(found).toBe(state)
    })

    it('resolves the default store per store subclass', () => {
        class Model {
            field = NUMBER({ default: 1 })
        }

        const [state] = StateManager.getOrCreateState(Model, { key: 'key1' })

        class AnotherStore extends StateStore {}

        const found = AnotherStore.defaultStore.findState(Model, 'key1')

        expect(found).toBe(state)
    })

    it('gets keys for a model', () => {
        class Model {
            field = NUMBER({ default: 1 })
        }

        StateManager.getOrCreateState(Model, { key: 'key1', store })
        StateManager.getOrCreateState(Model, { key: 'key3' })
        StateManager.getOrCreateState(Model, { key: 'key2', store })

        const keys = store.getKeys(Model)

        expect(keys).toEqual(['key1', 'key2'])
    })
})
