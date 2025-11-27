import { Meta, NUMBER } from 'metatyper'

import {
    StateStore,
    StateManager,
    StateProxyManager,
    InjectModel,
    OnInit,
    OnMount,
    OnUnmount,
    KEY
} from '../../src'

describe('States', () => {
    describe('State', () => {
        let store: StateStore

        beforeEach(() => {
            store = new StateStore()
        })

        afterEach(() => {
            store.clearStore()
        })

        it('creates model state from an object literal', () => {
            const model = {
                field1: NUMBER({ default: 1 })
            }
            const key = 'key1'
            const [state] = StateManager.getOrCreateState(model, { store, key })

            expect(Meta.isMetaObject(state)).toBeTruthy()
            expect(state.field1).toBe(1)
            expect(store.findState(model, key)).toBe(state)
        })

        it('creates model state from a class', () => {
            class Model {
                field1 = NUMBER({ default: 1 })
            }

            const key = 'key1'
            const [state] = StateManager.getOrCreateState(Model, { store, key })

            expect(Meta.isMetaObject(state)).toBeTruthy()
            expect(state.field1).toBe(1)
            expect(store.findState(Model, key)).toBe(state)
        })

        it('reuses an existing state when key and store match', () => {
            class Model {
                field1 = NUMBER({ default: 1 })
            }

            const key = 'key1'
            const [state1] = StateManager.getOrCreateState(Model, { store, key })
            const [state2] = StateManager.getOrCreateState(Model, { store, key })

            expect(state1).toBe(state2)
        })

        it('exposes state info via StateManager.instance', () => {
            class Model {
                field1 = NUMBER({ default: 1 })
            }

            const key = 'key1'
            const [state] = StateManager.getOrCreateState(Model, { store, key })

            const stateManager = StateManager.instance(state)

            expect(stateManager.model).toBe(Model)
            expect(stateManager.store).toBe(store)
            expect(stateManager.key).toBe(key)
        })

        it('identifies state instances and stringifies metadata', () => {
            class Model {
                field = NUMBER({ default: 1 })
            }

            const [state] = StateManager.getOrCreateState(Model, { key: 'k1' })

            expect(StateManager.isState(state)).toBe(true)
            expect(StateManager.instance(state)?.model).toBe(Model)
            expect(StateManager.instance({} as any)).toBeUndefined()

            const str = state.toString()

            expect(str).toContain('State(')
            expect(str).toContain('model: Model')
            expect(str).toContain('key: k1')
        })

        it('assigns initial values via initialValues', () => {
            class Model {
                a = NUMBER({ default: 0 })
                b = NUMBER({ default: 0 })
            }

            const [state] = StateManager.getOrCreateState(Model, {
                initialValues: { a: 10 }
            })

            expect(state.a).toBe(10)
            expect(state.b).toBe(0)
        })

        it('respects store isolation and key defaults', () => {
            class Model {
                f = NUMBER({ default: 1 })
            }

            const storeA = new StateStore()
            const storeB = new StateStore()

            const [s1, isNew1] = StateManager.getOrCreateState(Model, { store: storeA })
            const [s2, isNew2] = StateManager.getOrCreateState(Model, { store: storeA })
            const [s3, isNew3] = StateManager.getOrCreateState(Model, { store: storeB })

            expect(isNew1).toBe(true)
            expect(isNew2).toBe(false)
            expect(isNew3).toBe(true)
            expect(s1).toBe(s2)
            expect(s1).not.toBe(s3)
        })

        it('skips validation when disableValidation=true', () => {
            class Model {
                field = NUMBER({ default: 0 })
            }

            const [state] = StateManager.getOrCreateState(Model, { disableValidation: true })

            expect(state.field).toBe(0)

            state.field = '2' as any
            expect(state.field).toBe('2')
        })

        it('stringifies anonymous models safely', () => {
            const model = {
                field1: NUMBER({ default: 1 })
            }

            const [state] = StateManager.getOrCreateState(model, { key: 'obj1' })

            const str = state.toString()

            expect(str).toContain('State(')
            expect(str).toContain('model: Object')
            expect(str).toContain('key: obj1')
        })

        it('waits for nested @OnInit hooks via waitForInit', async () => {
            class Model1 {
                field1 = NUMBER({ default: 1 })
            }

            class Model2Inner {
                field1 = NUMBER({ default: 1 })

                parent = InjectModel(() => Model2)

                @OnInit()
                async init() {
                    await new Promise((resolve) => setTimeout(resolve, 0))
                    this.field1 = 5
                }
            }

            class Model2 {
                field1 = NUMBER({ default: 1 })

                inner = InjectModel(Model2Inner)

                innerArrayKey = ['k1', 'k2']
                innerArray = InjectModel([Model2Inner])

                @OnInit()
                async init() {
                    await new Promise((resolve) => setTimeout(resolve, 0))
                    this.field1 = 4
                    this.innerArrayKey = ['k2', 'k3']
                }
            }

            const [state1, isNew1] = StateManager.getOrCreateState(Model1, {
                initialValues: { field1: 2 }
            })
            const [state2, isNew2] = StateManager.getOrCreateState(Model2, {
                initialValues: { field1: 3 }
            })

            expect(isNew1).toBe(true)
            expect(isNew2).toBe(true)

            expect(state1.field1).toBe(2)
            expect(state2.field1).toBe(3)
            expect(state2.inner.field1).toBe(1)
            expect(state2.innerArrayKey).toEqual(['k1', 'k2'])

            await StateManager.waitForInit(state2)

            expect(state2.field1).toBe(4)
            expect(state2.inner.field1).toBe(5)
            expect(state2.innerArrayKey).toEqual(['k2', 'k3'])
        })

        it('upserts multiple states and updates existing entries', () => {
            class Model {
                value = NUMBER({ default: 0 })
            }

            const [existingK1, isNewK1] = StateManager.getOrCreateState(Model, {
                store,
                key: 'k1',
                initialValues: { value: 1 }
            })

            const [stateK1, stateK2] = StateManager.upsertStates(
                Model,
                {
                    k1: { value: 5 },
                    k2: { value: 10 }
                },
                { store }
            )

            const [existingK2, isNewK2] = StateManager.getOrCreateState(Model, {
                store,
                key: 'k2',
                initialValues: { value: 15 }
            })

            expect(isNewK1).toBe(true)
            expect(isNewK2).toBe(false)

            expect(stateK2).toBe(existingK2)

            expect(stateK1).toBe(existingK1)
            expect(stateK1.value).toBe(5)

            expect(stateK2).not.toBe(existingK1)
            expect(stateK2.value).toBe(10)

            const fromStoreK1 = store.findState(Model, 'k1')
            const fromStoreK2 = store.findState(Model, 'k2')

            expect(fromStoreK1).toBe(existingK1)
            expect(fromStoreK1?.value).toBe(5)
            expect(fromStoreK2).toBe(stateK2)
            expect(fromStoreK2?.value).toBe(10)
        })

        it('removes state from store via removeState', () => {
            class Model {
                value = NUMBER({ default: 0 })
            }

            const [state] = StateManager.getOrCreateState(Model, {
                store,
                key: 'toRemove'
            })

            expect(store.findState(Model, 'toRemove')).toBe(state)

            StateManager.removeState(state)

            expect(store.findState(Model, 'toRemove')).toBeNull()
        })
    })

    describe('StateProxy', () => {
        it('creates proxies and tracks observed props', () => {
            class Model {
                field1 = NUMBER({ default: 1 })
                field2 = {
                    prop1: 1
                }
            }

            const key = 'key1'
            const [state] = StateManager.getOrCreateState(Model, { key })

            const [stateProxy] = StateProxyManager.getOrCreateStateProxy(state, {
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

        it('mounts and unmounts proxy state correctly', () => {
            class Model {
                field = NUMBER({ default: 0 })
            }

            const [state] = StateManager.getOrCreateState(Model)
            const [proxy] = StateProxyManager.getOrCreateStateProxy(state, {
                observeProps: { field: true }
            })
            const mgr = StateProxyManager.instance(proxy)

            const rerender = jest.fn()

            mgr.mount(rerender)

            proxy.field = 1
            expect(rerender).toHaveBeenCalledTimes(1)

            mgr.unmount()
            proxy.field = 2
            expect(rerender).toHaveBeenCalledTimes(1)
        })

        it('tracks mounted proxies by state', () => {
            class Model {
                a = NUMBER({ default: 1 })
            }

            const [state] = StateManager.getOrCreateState(Model)
            const [proxy] = StateProxyManager.getOrCreateStateProxy(state)
            const mgr = StateProxyManager.instance(proxy)

            expect(StateProxyManager.getMountedStateProxies(state).size).toBe(0)
            mgr.mount(() => {})
            expect(StateProxyManager.getMountedStateProxies(state).has(proxy)).toBe(true)
            mgr.unmount()
            expect(StateProxyManager.getMountedStateProxies(state).size).toBe(0)
        })

        it('respects autoResolveObservableProps=false', () => {
            class Model {
                f1 = NUMBER({ default: 0 })
                f2 = NUMBER({ default: 0 })
            }

            const [state] = StateManager.getOrCreateState(Model)
            const [proxy] = StateProxyManager.getOrCreateStateProxy(state, {
                autoResolveObservableProps: false,
                observeProps: { f1: true }
            })
            const mgr = StateProxyManager.instance(proxy)
            const rerender = jest.fn()

            mgr.mount(rerender)

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            proxy.f2
            proxy.f2 = 1
            expect(rerender).toHaveBeenCalledTimes(0)

            proxy.f1 = 1
            expect(rerender).toHaveBeenCalledTimes(1)
        })

        it('handles null in isStateProxy guard', () => {
            expect(StateProxyManager.isStateProxy(null as any)).toBe(false)
        })

        it('mount new injected state proxy', () => {
            const onInitChild2Handler = jest.fn()
            const onMountChild2Handler = jest.fn()
            const onUnmountChild2Handler = jest.fn()

            const onInitChild1Handler = jest.fn()
            const onMountChild1Handler = jest.fn()
            const onUnmountChild1Handler = jest.fn()

            const onInitModelHandler = jest.fn()
            const onMountModelHandler = jest.fn()
            const onUnmountModelHandler = jest.fn()

            const onRerenderHandler = jest.fn()

            class Child2 {
                key = KEY()
                fieldChild2 = NUMBER({ default: 0 })

                modelKey = 'test'
                model = InjectModel(Model)

                @OnInit()
                onInit(args: any) {
                    onInitChild2Handler(args)
                }

                @OnMount()
                onMount(args: any) {
                    onMountChild2Handler(args)
                }

                @OnUnmount()
                onUnmount(args: any) {
                    onUnmountChild2Handler(args)
                }
            }

            class Child1 {
                key = KEY()
                fieldChild1 = NUMBER({ default: 0 })

                child2Key = 'c2test'
                child2 = InjectModel(Child2)

                @OnInit()
                onInit(args: any) {
                    onInitChild1Handler(args)
                }

                @OnMount()
                onMount(args: any) {
                    onMountChild1Handler(args)
                }

                @OnUnmount()
                onUnmount(args: any) {
                    onUnmountChild1Handler(args)
                }
            }

            class Model {
                key = KEY()
                fieldModel = NUMBER({ default: 0 })

                child1Key = 'c1test'
                child1 = InjectModel(Child1)

                child2Key = Array.from({ length: 3 }, (_, i) => 'c2test-' + i)
                child2 = InjectModel([Child2])

                @OnInit()
                onInit(args: any) {
                    onInitModelHandler(args)
                }

                @OnMount()
                onMount(args: any) {
                    onMountModelHandler(args)
                }

                @OnUnmount()
                onUnmount(args: any) {
                    onUnmountModelHandler(args)
                }
            }

            const [state] = StateManager.getOrCreateState(Model, { key: 'test' })
            const [proxy] = StateProxyManager.getOrCreateStateProxy(state)

            const stateProxyManager = StateProxyManager.instance(proxy)

            stateProxyManager.mount(onRerenderHandler)

            expect(stateProxyManager.childrenStateProxyMap.size).toBe(4)

            expect(onInitModelHandler).toHaveBeenCalledTimes(1)
            expect(onInitChild1Handler).toHaveBeenCalledTimes(1)
            expect(onInitChild2Handler).toHaveBeenCalledTimes(4)

            expect(onMountModelHandler).toHaveBeenCalledTimes(1)
            expect(onMountChild1Handler).toHaveBeenCalledTimes(1)
            expect(onMountChild2Handler).toHaveBeenCalledTimes(4)

            expect(onRerenderHandler).toHaveBeenCalledTimes(0)

            proxy.child2Key = Array.from({ length: 3 }, (_, i) => 'c2test-' + (i + 1))

            expect(stateProxyManager.childrenStateProxyMap.size).toBe(4)

            expect(onInitModelHandler).toHaveBeenCalledTimes(1)
            expect(onInitChild1Handler).toHaveBeenCalledTimes(1)
            expect(onInitChild2Handler).toHaveBeenCalledTimes(4)

            expect(onMountModelHandler).toHaveBeenCalledTimes(1)
            expect(onMountChild1Handler).toHaveBeenCalledTimes(1)
            expect(onMountChild2Handler).toHaveBeenCalledTimes(4)

            expect(onRerenderHandler).toHaveBeenCalledTimes(0)

            Reflect.get(state, 'child2')

            expect(stateProxyManager.childrenStateProxyMap.size).toBe(4)

            expect(onInitModelHandler).toHaveBeenCalledTimes(1)
            expect(onInitChild1Handler).toHaveBeenCalledTimes(1)
            expect(onInitChild2Handler).toHaveBeenCalledTimes(5)

            expect(onMountModelHandler).toHaveBeenCalledTimes(1)
            expect(onMountChild1Handler).toHaveBeenCalledTimes(1)
            expect(onMountChild2Handler).toHaveBeenCalledTimes(4)

            expect(onRerenderHandler).toHaveBeenCalledTimes(0)

            Reflect.get(proxy, 'child2')

            expect(stateProxyManager.childrenStateProxyMap.size).toBe(5)

            expect(onInitModelHandler).toHaveBeenCalledTimes(1)
            expect(onInitChild1Handler).toHaveBeenCalledTimes(1)
            expect(onInitChild2Handler).toHaveBeenCalledTimes(5)

            expect(onMountModelHandler).toHaveBeenCalledTimes(1)
            expect(onMountChild1Handler).toHaveBeenCalledTimes(1)
            expect(onMountChild2Handler).toHaveBeenCalledTimes(4)

            expect(onUnmountModelHandler).toHaveBeenCalledTimes(0)
            expect(onUnmountChild1Handler).toHaveBeenCalledTimes(0)
            expect(onUnmountChild2Handler).toHaveBeenCalledTimes(0)

            expect(onRerenderHandler).toHaveBeenCalledTimes(0)

            stateProxyManager.refresh()

            expect(stateProxyManager.childrenStateProxyMap.size).toBe(4)

            expect(onInitModelHandler).toHaveBeenCalledTimes(1)
            expect(onInitChild1Handler).toHaveBeenCalledTimes(1)
            expect(onInitChild2Handler).toHaveBeenCalledTimes(5)

            expect(onMountModelHandler).toHaveBeenCalledTimes(1)
            expect(onMountChild1Handler).toHaveBeenCalledTimes(1)
            expect(onMountChild2Handler).toHaveBeenCalledTimes(5)

            expect(onUnmountModelHandler).toHaveBeenCalledTimes(0)
            expect(onUnmountChild1Handler).toHaveBeenCalledTimes(0)
            expect(onUnmountChild2Handler).toHaveBeenCalledTimes(1)

            expect(onRerenderHandler).toHaveBeenCalledTimes(0)

            proxy.child2Key = Array.from({ length: 3 }, (_, i) => 'c2test-' + (i + 2))

            expect(stateProxyManager.childrenStateProxyMap.size).toBe(4)

            expect(onInitModelHandler).toHaveBeenCalledTimes(1)
            expect(onInitChild1Handler).toHaveBeenCalledTimes(1)
            expect(onInitChild2Handler).toHaveBeenCalledTimes(5)

            expect(onMountModelHandler).toHaveBeenCalledTimes(1)
            expect(onMountChild1Handler).toHaveBeenCalledTimes(1)
            expect(onMountChild2Handler).toHaveBeenCalledTimes(5)

            expect(onUnmountModelHandler).toHaveBeenCalledTimes(0)
            expect(onUnmountChild1Handler).toHaveBeenCalledTimes(0)
            expect(onUnmountChild2Handler).toHaveBeenCalledTimes(1)

            // because proxy.child2 was accessed, and proxy.child2Key become observable, so rerender is triggered
            expect(onRerenderHandler).toHaveBeenCalledTimes(1)

            stateProxyManager.refresh()

            expect(stateProxyManager.childrenStateProxyMap.size).toBe(4)

            expect(onInitModelHandler).toHaveBeenCalledTimes(1)
            expect(onInitChild1Handler).toHaveBeenCalledTimes(1)
            expect(onInitChild2Handler).toHaveBeenCalledTimes(6)

            expect(onMountModelHandler).toHaveBeenCalledTimes(1)
            expect(onMountChild1Handler).toHaveBeenCalledTimes(1)
            expect(onMountChild2Handler).toHaveBeenCalledTimes(6)

            expect(onUnmountModelHandler).toHaveBeenCalledTimes(0)
            expect(onUnmountChild1Handler).toHaveBeenCalledTimes(0)
            expect(onUnmountChild2Handler).toHaveBeenCalledTimes(2)

            expect(onRerenderHandler).toHaveBeenCalledTimes(1)
        })
    })

    describe('StateSnapshot', () => {
        it('creates immutable snapshots with nested proxies', () => {
            class Inner {
                key = KEY()

                v = NUMBER({ default: 1 })
            }

            class Outer {
                innerKey = 'ki0'
                inner = InjectModel(Inner)

                innerArrayKey = ['k1', 'k2']
                innerArray = InjectModel([Inner])

                x = NUMBER({ default: 0 })
            }

            const [state] = StateManager.getOrCreateState(Outer)
            const [proxy] = StateProxyManager.getOrCreateStateProxy(state)
            const stateProxyManager = StateProxyManager.instance(proxy)

            const snap = stateProxyManager.createSnapshot()

            expect(Object.isFrozen(snap)).toBe(true)
            expect(Object.isFrozen(snap.inner)).toBe(true)
            expect(Object.isFrozen(snap.innerArray)).toBe(true)

            const str = snap.toString()

            expect(str).toContain('StateProxySnapshot(')

            proxy.x = 5

            proxy.inner.v = 2
            proxy.innerKey = 'ki1'
            proxy.inner.v = 3

            proxy.innerArray[0].v = 11
            proxy.innerArray[1].v = 12
            proxy.innerArrayKey = ['k3', 'k4']
            proxy.innerArray[0].v = 13
            proxy.innerArray[1].v = 14

            stateProxyManager.refresh()

            expect(snap.x).toBe(0)
            expect(snap.inner.v).toBe(1)
            expect(snap.innerArrayKey).toEqual(['k1', 'k2'])
            expect(snap.innerArray[0].key).toBe('k1')
            expect(snap.innerArray[0].v).toBe(1)
            expect(snap.innerArray[1].key).toBe('k2')
            expect(snap.innerArray[1].v).toBe(1)
        })

        it('adds related props to observable props', () => {
            class Child {
                key = KEY()
                fieldChild = NUMBER({ default: 0 })
            }

            class Parent {
                childKey = 'c1test'
                child = InjectModel(Child)

                childrenKey = ['c1test', 'c2test']
                children = InjectModel([Child])

                type = 'child'
                dynamicChildId = 'c3test'
                dynamicChild = InjectModel(
                    (state) => (state.type === 'child' ? Child : undefined),
                    { optional: true, keyFrom: 'dynamicChildId' }
                )

                arrType = 'child'
                dynamicChildrenKey = ['c3test']
                dynamicChildren = InjectModel(
                    [(state) => (state.arrType === 'child' ? Child : null)],
                    { nullable: true, keyFrom: 'dynamicChildrenKey' }
                )
            }

            const [state] = StateManager.getOrCreateState(Parent)
            const stateManager = StateManager.instance(state)
            const [proxy] = StateProxyManager.getOrCreateStateProxy(state)
            const stateProxyManager = StateProxyManager.instance(proxy)
            const snapshot = stateProxyManager.createSnapshot()

            expect(stateManager.getRelatedProps('child')).toEqual(['childKey'])
            expect(stateManager.getRelatedProps('children')).toEqual(['childrenKey'])
            expect(stateManager.getRelatedProps('dynamicChild')).toEqual([
                'dynamicChildId',
                'type'
            ])
            expect(stateManager.getRelatedProps('dynamicChildren')).toEqual([
                'dynamicChildrenKey',
                'arrType'
            ])

            expect(stateProxyManager.observableProps).toEqual({})

            Reflect.get(snapshot, 'child')
            expect(stateProxyManager.observableProps).toEqual({
                child: true,
                childKey: true
            })

            Reflect.get(snapshot, 'children')
            expect(stateProxyManager.observableProps).toEqual({
                child: true,
                childKey: true,
                children: true,
                childrenKey: true
            })

            Reflect.get(snapshot, 'dynamicChild')
            expect(stateProxyManager.observableProps).toEqual({
                child: true,
                childKey: true,
                children: true,
                childrenKey: true,
                dynamicChild: true,
                dynamicChildId: true,
                type: true
            })

            Reflect.get(snapshot, 'dynamicChildren')
            expect(stateProxyManager.observableProps).toEqual({
                child: true,
                childKey: true,
                children: true,
                childrenKey: true,
                dynamicChild: true,
                dynamicChildId: true,
                dynamicChildren: true,
                dynamicChildrenKey: true,
                type: true,
                arrType: true
            })
        })
    })
})
