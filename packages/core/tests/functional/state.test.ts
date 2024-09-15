import { Meta, NUMBER } from 'metatyper'

import {
    InjectModel,
    StateStore,
    StateManager,
    StateProxyManager,
    type StateType
} from '../../src'

describe('Models States', () => {
    let store: StateStore

    beforeEach(() => {
        store = new StateStore()
    })

    describe('Models State Store', () => {
        it('adds state', () => {
            const model = {}

            const state1 = { value: 'state1' } as unknown as StateType
            const state2 = { value: 'state2' } as unknown as StateType
            const state3 = { value: 'state3' } as unknown as StateType

            const key1 = { someValue: { prop: 'value1' } }
            const key2 = { someValue: { prop: 'value2' } }
            const key3 = { someValue: undefined }

            store.addState(model, state1, key1)
            store.addState(model, state2, key2)
            store.addState(model, state3, key3)

            expect(store.getStates(model)).toEqual([state1, state2, state3])
        })

        it('finds state', () => {
            const model = {}

            const state2 = { _: true }

            store.addState(model, {} as unknown as StateType, { someValue: { prop: 'value1' } })
            store.addState(model, state2 as unknown as StateType, {
                someValue: { prop: 'value2' }
            })
            store.addState(model, {} as unknown as StateType, { someValue: undefined })

            const resultState = store.findState(model, (existsKey) => {
                return existsKey.someValue?.prop === 'value2'
            })

            expect(resultState).toBe(state2)
        })
    })

    describe('Model State', () => {
        it('creates a new model state (from obj)', () => {
            const model = {
                field1: NUMBER({ default: 1 })
            }
            const key = { _: 'key1' }
            const state = StateManager.createState(model, { store, key })

            expect(Meta.isMetaObject(state)).toBeTruthy()
            expect(state.field1).toBe(1)
            expect(store.findState(model, (existsKey) => existsKey === key)).toBe(state)
        })

        it('creates a new model state (from cls)', () => {
            class model {
                field1 = NUMBER({ default: 1 })
            }

            const key = { _: 'key1' }
            const state = StateManager.createState(model, { store, key })

            expect(Meta.isMetaObject(state)).toBeTruthy()
            expect(state.field1).toBe(1)
            expect(store.findState(model, (existsKey) => existsKey === key)).toBe(state)
        })

        it('gets or creates a new model state', () => {
            class model {
                field1 = NUMBER({ default: 1 })
            }

            const key = { _: 'key1' }
            const [state1] = StateManager.getOrCreateState(model, { store, key })
            const [state2] = StateManager.getOrCreateState(model, { store, key })

            expect(state1).toBe(state2)
        })

        it('gets model state info', () => {
            class model {
                field1 = NUMBER({ default: 1 })
            }

            const key = { _: 'key1' }
            const state = StateManager.createState(model, { store, key })

            const stateManager = StateManager.instance(state)

            expect(stateManager.model).toBe(model)
            expect(stateManager.store).toBe(store)
            expect(stateManager.key).toBe(key)
        })
    })

    describe('Proxy State', () => {
        it('creates and uses proxy state', () => {
            class model {
                field1 = NUMBER({ default: 1 })
                field2 = {
                    prop1: 1
                }
            }

            const key = { _: 'key1' }
            const state = StateManager.createState(model, { store, key })

            const stateProxy = StateProxyManager.createStateProxy(state, {
                observeProps: {
                    field1: true
                }
            })

            const stateProxyManager = StateProxyManager.instance(stateProxy)

            expect(stateProxyManager.observableProps).toEqual({
                field1: true
            })
            expect(stateProxy.field2).toEqual(state.field2)
            expect(stateProxyManager.observableProps).toEqual({
                field1: true,
                field2: true
            })
        })
    })

    describe('Inject Model', () => {
        it('injects a model and uses it', () => {
            class model1 {
                field1 = NUMBER({ default: 1 })
                field2 = {
                    prop1: 1
                }
            }

            class model2 {
                field3 = InjectModel(model1)
            }

            const key = { _: 'key1' }
            const state1 = StateManager.createState(model1, { store, key })
            const state2 = StateManager.createState(model2, { store, key })

            const stateProxy1 = StateProxyManager.createStateProxy(state1)
            const stateProxy1Manager = StateProxyManager.instance(stateProxy1)
            const stateProxy2 = StateProxyManager.createStateProxy(state2)
            const stateProxy2Manager = StateProxyManager.instance(stateProxy2)
            const stateProxyManager2Injected = StateProxyManager.instance(stateProxy2.field3)!

            expect(stateProxy1.field2).toEqual({ prop1: 1 })
            expect(stateProxy1Manager.observableProps).toEqual({
                field2: true
            })

            expect(stateProxyManager2Injected.observableProps).toEqual({})
            expect(stateProxy2.field3.field1).toBe(1)
            expect(stateProxyManager2Injected.observableProps).toEqual({
                field1: true
            })

            expect(stateProxy2Manager.observableProps).toEqual({})
        })

        it('injects circular models', () => {
            class Model1 {
                mode1 = 1
                injected2 = InjectModel(() => Model2)
            }

            class Model2 {
                mode2 = 2
                injected1 = InjectModel(() => Model1, {
                    autoResolveObservableProps: false
                })
            }

            const [state1] = StateManager.getOrCreateState(Model1)
            const [state2] = StateManager.getOrCreateState(Model2)

            expect(state1.injected2).toBe(state2)
            expect(state2.injected1).toBe(state1)

            const state1Proxy = StateProxyManager.createStateProxy(state1, {
                observeProps: {
                    mode1: true
                }
            })
            const state2Proxy = StateProxyManager.createStateProxy(state2, {
                observeProps: {
                    mode2: true
                }
            })

            expect(state1Proxy.injected2).toEqual(state2)
            expect(state2Proxy.injected1).toEqual(state1)

            expect(state1Proxy.injected2.mode2).toBe(state2.mode2)
            expect(state2Proxy.injected1.mode1).toBe(state1.mode1)

            const state1ProxyManager = StateProxyManager.instance(state1Proxy)
            const state2ProxyManager = StateProxyManager.instance(state2Proxy)

            const mockRerender1 = jest.fn()
            const mockRerender2 = jest.fn()

            state1ProxyManager.mount(mockRerender1)
            state2ProxyManager.mount(mockRerender2)

            state1Proxy.injected2.mode2 = 22

            expect(mockRerender1).toHaveBeenCalledTimes(1)
            expect(mockRerender2).toHaveBeenCalledTimes(2)

            state2Proxy.injected1.mode1 = 11

            expect(mockRerender1).toHaveBeenCalledTimes(2)
            expect(mockRerender2).toHaveBeenCalledTimes(2)

            const state1ProxySnapshot = state1ProxyManager.createSnapshot()
            const state2ProxySnapshot = state2ProxyManager.createSnapshot()

            expect(state1ProxySnapshot.injected2.mode2).toBe(state2ProxySnapshot.mode2)
            expect(state2ProxySnapshot.injected1.mode1).toBe(state1ProxySnapshot.mode1)

            expect(Object.isFrozen(state1ProxySnapshot.injected2)).toBeTruthy()
            expect(Object.isFrozen(state2ProxySnapshot.injected1)).toBeTruthy()
        })

        it('injects models with dynamic args', () => {
            class A {
                a = 1
            }

            const B = {
                b: 2
            }

            class Hub {
                modelName = 'A'
                key = 'key1'

                state = InjectModel(
                    (state: Hub) => {
                        switch (state.modelName) {
                            case 'A':
                                return A
                            case 'B':
                                return B
                        }
                    },
                    (state: Hub) => ({
                        key: state.key
                    })
                )
            }

            const hub = StateManager.createState(Hub)

            let stateAsA = hub.state as A

            expect((stateAsA as any).b).toBe(undefined)
            expect(stateAsA.a).toBe(1)
            stateAsA.a = 11
            expect(stateAsA.a).toBe(11)

            hub.key = 'key2'

            expect(stateAsA.a).toBe(11)

            stateAsA = hub.state as A
            expect(stateAsA.a).toBe(1)

            hub.modelName = 'B'

            let stateAsB = hub.state as typeof B

            expect((stateAsB as any).a).toBe(undefined)
            expect(stateAsB.b).toBe(2)
            stateAsB.b = 22
            expect(stateAsB.b).toBe(22)

            hub.key = 'key3'

            expect(stateAsB.b).toBe(22)

            stateAsB = hub.state as typeof B

            expect(stateAsB.b).toBe(2)

            hub.modelName = 'C'

            expect(hub.state).toBe(undefined)
        })
    })
})
