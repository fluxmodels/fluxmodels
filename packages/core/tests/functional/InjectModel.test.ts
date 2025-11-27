import { ARRAY, NUMBER, STRING } from 'metatyper'

import {
    InjectModel,
    OnInit,
    OnInitArgs,
    OnMount,
    OnMountArgs,
    OnUnmount,
    OnUnmountArgs,
    StateManager,
    StateProxyManager,
    StateStore
} from '../../src'

describe('InjectModel', () => {
    it('injects a model and uses it', () => {
        class Model1 {
            field1 = NUMBER({ default: 1 })
            field2 = {
                prop1: 1
            }
        }

        class Model2 {
            field3 = InjectModel(Model1)
        }

        const key = 'key1'
        const [state1] = StateManager.getOrCreateState(Model1, { key })
        const [state2] = StateManager.getOrCreateState(Model2, { key })

        const [stateProxy1] = StateProxyManager.getOrCreateStateProxy(state1)
        const stateProxy1Manager = StateProxyManager.instance(stateProxy1)
        const [stateProxy2] = StateProxyManager.getOrCreateStateProxy(state2)
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

        expect(stateProxy2Manager.observableProps).toEqual({
            field3: true,
            field3Key: true
        })
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

        const [state1Proxy] = StateProxyManager.getOrCreateStateProxy(state1, {
            observeProps: {
                mode1: true
            }
        })
        const [state2Proxy] = StateProxyManager.getOrCreateStateProxy(state2, {
            observeProps: {
                mode2: true
            }
        })

        expect(state1Proxy.injected2.mode2).toBe(state2.mode2)
        expect(state2Proxy.injected1.mode1).toBe(state1.mode1)

        expect(state1Proxy.injected2).not.toBe(state2Proxy)

        const state1ProxyManager = StateProxyManager.instance(state1Proxy)
        const state2ProxyManager = StateProxyManager.instance(state2Proxy)

        const mockRerender1 = jest.fn()
        const mockRerender2 = jest.fn()

        state1ProxyManager.mount(mockRerender1)
        state2ProxyManager.mount(mockRerender2)

        state1Proxy.injected2.mode2 = 22

        expect(mockRerender1).toHaveBeenCalledTimes(1)
        expect(mockRerender2).toHaveBeenCalledTimes(1)

        state2Proxy.injected1.mode1 = 11

        expect(mockRerender1).toHaveBeenCalledTimes(2)
        expect(mockRerender2).toHaveBeenCalledTimes(1)

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
                        default:
                            return A
                    }
                },
                () => ({
                    keyFrom: 'key'
                })
            )
        }

        const [hub] = StateManager.getOrCreateState(Hub)

        let stateAsA = hub.state as any as A

        expect((stateAsA as any).b).toBe(undefined)
        expect(stateAsA.a).toBe(1)
        stateAsA.a = 11
        expect(stateAsA.a).toBe(11)

        hub.key = 'key2'

        expect(stateAsA.a).toBe(11)

        stateAsA = hub.state as any as A
        expect(stateAsA.a).toBe(1)

        hub.modelName = 'B'

        let stateAsB = hub.state as any as typeof B

        expect((stateAsB as any).a).toBe(undefined)
        expect(stateAsB.b).toBe(2)
        stateAsB.b = 22
        expect(stateAsB.b).toBe(22)

        hub.key = 'key3'

        expect(stateAsB.b).toBe(22)

        stateAsB = hub.state as any as typeof B

        expect(stateAsB.b).toBe(2)

        hub.modelName = 'C'
        stateAsA = hub.state as any as A

        expect(stateAsA.a).toBe(1)
    })

    it('throws when optional=false and key is missing', () => {
        class Target {
            a = 1
        }

        class Host {
            kid = STRING({ optional: true })
            inj = InjectModel(Target, { keyFrom: 'kid', optional: false })
        }

        expect(() => {
            StateManager.getOrCreateState(Host)
        }).toThrow()
    })

    it('throws when nullable=false and key is null', () => {
        class Target {
            a = 1
        }

        class Host {
            kid = null
            inj = InjectModel(Target, { keyFrom: 'kid', nullable: false })
        }

        expect(() => {
            StateManager.getOrCreateState(Host)
        }).toThrow()

        // expect(() => {
        //     StateManager.getOrCreateState(Host, {
        //         disableValidation: true
        //     })
        // }).not.toThrow()
    })

    it('returns the same injected proxy on repeated access (cached)', () => {
        class Target {
            a = 1
        }

        class Host {
            injKey = 'k1'
            inj = InjectModel(Target)
        }

        const [host] = StateManager.getOrCreateState(Host)
        const [proxy] = StateProxyManager.getOrCreateStateProxy(host)

        const inj1 = proxy.inj
        const inj2 = proxy.inj

        expect(inj1).toBe(inj2)

        proxy.injKey = 'k2'

        const inj3 = proxy.inj

        expect(inj3).not.toBe(inj1)
    })

    it('observes nested injected props according to observeProps', () => {
        class Inner {
            a = NUMBER({ default: 0 })
            b = NUMBER({ default: 0 })
        }

        class Outer {
            inner = InjectModel(Inner)
        }

        const [outer] = StateManager.getOrCreateState(Outer)
        const [proxy] = StateProxyManager.getOrCreateStateProxy(outer, {
            observeProps: { inner: { a: true } }
        })
        const mgr = StateProxyManager.instance(proxy)
        const rerender = jest.fn()

        mgr.mount(rerender)

        proxy.inner.a = 1
        expect(rerender).toHaveBeenCalledTimes(1)

        proxy.inner.b = 1
        expect(rerender).toHaveBeenCalledTimes(1)
    })

    it('throws by default when model factory returns undefined/null', () => {
        class HostSingle {
            injUndefined = InjectModel((() => undefined) as any)
            injNull = InjectModel((() => null) as any)
        }

        expect(() => {
            StateManager.getOrCreateState(HostSingle)
        }).toThrow()
    })

    it('returns undefined and null when allowed (optional=true, nullable=true)', () => {
        class HostSingle {
            injUndefined = InjectModel((() => undefined) as any, { optional: true })
            injNull = InjectModel((() => null) as any, { nullable: true })
        }

        const [host] = StateManager.getOrCreateState(HostSingle)

        expect(host.injUndefined).toBeUndefined()
        expect(host.injNull).toBeNull()
    })

    it('throws by default when keyFrom is undefined (optional=false)', () => {
        class Target {
            a = 1
        }

        class Host {
            injKey?: string
            inj = InjectModel(Target)
        }

        expect(() => {
            StateManager.getOrCreateState(Host)
        }).toThrow()
    })

    it('throws by default when keyFrom is null when nullable is false', () => {
        class Target {
            a = 1
        }

        class Host {
            kid: string | null = null
            inj = InjectModel(Target, { keyFrom: 'kid' })
        }

        expect(() => {
            StateManager.getOrCreateState(Host)
        }).toThrow()
    })

    it('returns undefined when keyFrom is undefined and optional is true', () => {
        class Target {
            a = 1
        }

        class Host {
            kid?: string
            inj = InjectModel(Target, { keyFrom: 'kid', optional: true })
        }

        const [host] = StateManager.getOrCreateState(Host)

        expect(host.inj).toBeUndefined()
    })

    it('returns null when keyFrom is null and nullable is true', () => {
        class Target {
            a = 1
        }

        class Host {
            injKey: string | null = null
            inj = InjectModel(Target, { nullable: true })
        }

        const [host] = StateManager.getOrCreateState(Host)

        expect(host.inj).toBeNull()

        host.injKey = 'k1'
        expect(host.inj?.a).toBe(1)
    })

    it('allows assigning to injected state when keyResolver is provided', () => {
        class Item {
            id = ''
            value = NUMBER({ default: 0 })
        }

        class Holder {
            itemKey?: string
            item = InjectModel(Item, { keyResolver: 'id', optional: true })
        }

        const [holder] = StateManager.getOrCreateState(Holder)

        holder.item = { id: 'assign-1', value: 5 }

        expect(holder.itemKey).toBe('assign-1')

        const firstResolved = holder.item

        expect(firstResolved.value).toBe(5)

        holder.item = { id: 'assign-1', value: 42 }

        expect(holder.itemKey).toBe('assign-1')

        expect(holder.item).not.toBe(firstResolved)
        expect(holder.item.value).toBe(42)

        holder.item = { id: 'assign-2', value: 100 }

        expect(holder.itemKey).toBe('assign-2')

        expect(holder.item).not.toBe(firstResolved)
        expect(holder.item.value).toBe(100)

        const [stateFromStore] = StateManager.getOrCreateState(Item, { key: 'assign-2' })

        expect(stateFromStore).toBe(holder.item)
    })

    describe('InjectModel array', () => {
        it('injects a model array and uses it', () => {
            const store = new StateStore()

            class Model1 {
                field1 = NUMBER({ default: 1 })
                field2 = {
                    prop1: 1
                }
            }

            class Model2 {
                field3Key: string[] = []
                field3 = InjectModel([Model1], { store })
            }

            const key = 'key1'
            const [state2] = StateManager.getOrCreateState(Model2, { store, key })

            const [stateProxy2] = StateProxyManager.getOrCreateStateProxy(state2)
            const stateProxy2Manager = StateProxyManager.instance(stateProxy2)

            expect(stateProxy2Manager.observableProps).toEqual({})

            expect(stateProxy2.field3.length).toBe(0)

            expect(stateProxy2Manager.observableProps).toEqual({
                field3: true,
                field3Key: true
            })

            stateProxy2.field3Key = ['1', '2']

            expect(stateProxy2.field3.length).toBe(2)

            expect(stateProxy2Manager.observableProps).toEqual({
                field3: true,
                field3Key: true
            })

            const [state1V1, state1V1IsNew] = StateManager.getOrCreateState(Model1, {
                store,
                key: '1'
            })
            const [state1V2, state1V2IsNew] = StateManager.getOrCreateState(Model1, {
                store,
                key: '2'
            })
            const [, state1V2AnotherStoreIsNew] = StateManager.getOrCreateState(Model1, {
                key: '2'
            })

            expect(state1V1IsNew).toBe(false)
            expect(state1V2IsNew).toBe(false)
            expect(state1V2AnotherStoreIsNew).toBe(true)

            const stateProxy2Field3V1 = stateProxy2.field3[0]
            const stateProxy2Field3V2 = stateProxy2.field3[1]

            expect(StateProxyManager.isStateProxy(stateProxy2Field3V1)).toBe(true)
            expect(stateProxy2Field3V1).toEqual(state1V1)
            expect(stateProxy2Field3V2).toEqual(state1V2)
        })

        it('injects circular models', () => {
            const store = new StateStore()

            class Model1 {
                mode1 = 1
                injected2Key: string[] = []
                injected2 = InjectModel([() => Model2], { store })
            }

            class Model2 {
                mode2 = 2
                injected1Key: string[] = []
                injected1 = InjectModel([() => Model1], {
                    store,
                    autoResolveObservableProps: false
                })
            }

            const [state1] = StateManager.getOrCreateState(Model1, { store, key: '2' })
            const [state2] = StateManager.getOrCreateState(Model2, { store, key: '1' })

            state1.injected2Key = ['1']
            state2.injected1Key = ['2']

            expect(state1.injected2[0]).toEqual(state2)
            expect(state2.injected1[0]).toEqual(state1)

            const [state1Proxy] = StateProxyManager.getOrCreateStateProxy(state1, {
                observeProps: {
                    mode1: true
                }
            })
            const [state2Proxy] = StateProxyManager.getOrCreateStateProxy(state2, {
                observeProps: {
                    mode2: true
                }
            })

            expect(state1Proxy.injected2).toEqual([state2])
            expect(state2Proxy.injected1).toEqual([state1])

            expect((state1Proxy.injected2 as any)[0].mode2).toBe(state2.mode2)
            expect((state2Proxy.injected1 as any)[0].mode1).toBe(state1.mode1)

            const state1ProxyManager = StateProxyManager.instance(state1Proxy)
            const state2ProxyManager = StateProxyManager.instance(state2Proxy)

            const mockRerender1 = jest.fn()
            const mockRerender2 = jest.fn()

            state1ProxyManager.mount(mockRerender1)
            state2ProxyManager.mount(mockRerender2)
            ;(state1Proxy.injected2 as any)[0].mode2 = 22

            expect(mockRerender1).toHaveBeenCalledTimes(1)
            expect(mockRerender2).toHaveBeenCalledTimes(1)
            ;(state2Proxy.injected1 as any)[0].mode1 = 11

            expect(mockRerender1).toHaveBeenCalledTimes(2)
            expect(mockRerender2).toHaveBeenCalledTimes(1)

            const state1ProxySnapshot = state1ProxyManager.createSnapshot()
            const state2ProxySnapshot = state2ProxyManager.createSnapshot()

            expect((state1ProxySnapshot.injected2 as any)[0].mode2).toBe(state2ProxySnapshot.mode2)
            expect((state2ProxySnapshot.injected1 as any)[0].mode1).toBe(state1ProxySnapshot.mode1)

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
                keyA = 'key1'
                keyB = 'key1'

                state = InjectModel(
                    [
                        (state: Hub) => {
                            switch (state.modelName) {
                                case 'A':
                                    return A
                                case 'B':
                                    return B
                                default:
                                    return A
                            }
                        }
                    ],
                    (state) => ({
                        keyFrom: `key${state.modelName}`
                    })
                )
            }

            const [hub] = StateManager.getOrCreateState(Hub)

            let stateAsA = hub.state[0] as A

            expect('b' in stateAsA).toBe(false)
            expect(stateAsA.a).toBe(1)
            stateAsA.a = 11
            expect(stateAsA.a).toBe(11)

            hub.keyA = 'key2'

            expect(stateAsA.a).toBe(11)

            stateAsA = hub.state[0] as A
            expect(stateAsA.a).toBe(1)

            hub.modelName = 'C'

            stateAsA = hub.state[0] as A
            expect(stateAsA).toBe(undefined)

            hub.modelName = 'B'

            const stateAsB = hub.state[0] as typeof B

            expect(stateAsB.b).toBe(2)
            stateAsB.b = 1
            expect(stateAsB.b).toBe(1)
            expect('a' in stateAsB).toBe(false)
        })

        it('prevents mutation of injected arrays and keeps them frozen', () => {
            class M {
                k: string[] = []
                arr = InjectModel([() => ({})])
            }

            const [s] = StateManager.getOrCreateState(M)
            const [p] = StateProxyManager.getOrCreateStateProxy(s)

            expect(Object.isFrozen(p.arr)).toBe(true)
            expect(() => (p.arr as any).push(1)).toThrow()
            expect(() => (p.arr as any).splice(0, 1)).toThrow()
        })

        it('reorders array when keys order changes and preserves instances', () => {
            class Item {
                v = NUMBER({ default: 0 })
            }

            class ListHolder {
                itemsKey: string[] = []
                items = InjectModel([Item])
            }

            const [holder] = StateManager.getOrCreateState(ListHolder)
            const [proxy] = StateProxyManager.getOrCreateStateProxy(holder)

            proxy.itemsKey = ['a', 'b', 'c']

            const a1 = proxy.items[0]
            const b1 = proxy.items[1]
            const c1 = proxy.items[2]

            proxy.itemsKey = ['c', 'a', 'b']
            expect(proxy.items[0]).toBe(c1)
            expect(proxy.items[1]).toBe(a1)
            expect(proxy.items[2]).toBe(b1)
        })

        it('replaces instances when keys change', () => {
            class Item {
                v = NUMBER({ default: 0 })
            }

            class ListHolder {
                itemsKey: string[] = []
                items = InjectModel([Item])
            }

            const [holder] = StateManager.getOrCreateState(ListHolder)
            const [proxy] = StateProxyManager.getOrCreateStateProxy(holder)

            proxy.itemsKey = ['x', 'y']

            const x = proxy.items[0]
            const y = proxy.items[1]

            proxy.itemsKey = ['y', 'z']
            expect(proxy.items.length).toBe(2)
            expect(proxy.items[0]).toBe(y)
            expect(proxy.items[1]).not.toBe(x)
        })

        it('injects states without declared key as metatype', () => {
            class Item {
                id = ''
                v = NUMBER({ default: 0 })
            }

            class ItemsHolder {
                items = InjectModel([Item], { keyResolver: 'id' })
                item = InjectModel(Item, { keyResolver: 'id', optional: true })
            }

            const [state] = StateManager.getOrCreateState(ItemsHolder)

            expect((state as any)['itemsKey']).toBeUndefined()
            expect(state.items).toEqual([])

            state['items'] = []

            expect((state as any)['itemsKey']).toEqual([])
            expect(state.items).toEqual([])

            expect((state as any)['itemKey']).toBeUndefined()
            expect(state.item?.v).toBe(0)

            state.item = { id: 'k1', v: 3 } as Item

            expect((state as any)['itemKey']).toBe('k1')
            expect(state.item.v).toBe(3)
        })

        it('preserves undefined and null elements when factories return them', () => {
            class HostArray {
                arrUKey: string[] = ['k1']
                arrU = InjectModel([(() => undefined) as any], {
                    optional: true
                })

                arrNKey: string[] = ['k1']
                arrN = InjectModel([(() => null) as any], {
                    nullable: true
                })
            }

            const [host] = StateManager.getOrCreateState(HostArray)

            expect(host.arrU.length).toBe(1)
            expect(host.arrU[0]).toBeUndefined()

            expect(host.arrN.length).toBe(1)
            expect(host.arrN[0]).toBeNull()
        })

        it('throws when keys contain null by default', () => {
            class Item {
                v = NUMBER({ default: 0 })
            }

            class ListHolder {
                itemsKey: (string | null)[] = [null]
                items = InjectModel([Item])
            }

            expect(() => {
                StateManager.getOrCreateState(ListHolder)
            }).toThrow()
        })

        it('throws when keys contain undefined by default', () => {
            class Item {
                v = NUMBER({ default: 0 })
            }

            class ListHolder {
                itemsKey: (string | undefined)[] = [undefined]
                items = InjectModel([Item])
            }

            expect(() => {
                StateManager.getOrCreateState(ListHolder)
            }).toThrow()
        })

        it('returns undefined elements when keys contain undefined and optional is true', () => {
            class Item {
                v = NUMBER({ default: 0 })
            }

            class ListHolder {
                itemsKey: (string | undefined)[] = [undefined]
                items = InjectModel([Item], { optional: true })
            }

            const [holder] = StateManager.getOrCreateState(ListHolder)

            expect(holder.items.length).toBe(1)
            expect(holder.items[0]).toBeUndefined()
        })

        it('returns null elements when keys contain null and nullable is true', () => {
            class Item {
                v = NUMBER({ default: 0 })
            }

            class ListHolder {
                itemsKey: (string | null)[] = [null]
                items = InjectModel([Item], { nullable: true })
            }

            const [holder] = StateManager.getOrCreateState(ListHolder)

            expect(holder.items.length).toBe(1)
            expect(holder.items[0]).toBeNull()
        })
    })

    describe('assignments and keyResolver', () => {
        it('allows assigning to injected state when keyResolver is provided', () => {
            const onInitHandler = jest.fn()
            const onMountHandler = jest.fn()
            const onUnmountHandler = jest.fn()
            const mockRerender1 = jest.fn()

            class Item {
                id = ''
                value = NUMBER({ default: 0 })

                @OnInit()
                handleInit(args: OnInitArgs) {
                    onInitHandler(this, args)
                }

                @OnMount()
                handleMount(args: OnMountArgs) {
                    onMountHandler(this, args)
                }

                @OnUnmount()
                handleUnmount(args: OnUnmountArgs) {
                    onUnmountHandler(this, args)
                }
            }

            class Holder {
                itemKey = STRING({ optional: true, nullable: true })
                item = InjectModel(Item, { keyResolver: 'id', optional: true, nullable: true })
            }

            const [holder] = StateManager.getOrCreateState(Holder)
            const [holderProxy] = StateProxyManager.getOrCreateStateProxy(holder)
            const holderProxyManager = StateProxyManager.instance(holderProxy)

            expect(holder.itemKey).toBeUndefined()
            expect(onInitHandler).toHaveBeenCalledTimes(0)
            expect(holderProxyManager.childrenStateProxyMap.size).toBe(0)

            holder.item = { id: 'assign-1', value: 5 } as Item

            expect(holder.itemKey).toBe('assign-1')
            expect(onInitHandler).toHaveBeenCalledTimes(1)
            expect(onInitHandler).toHaveBeenCalledWith(holder.item, { state: holder.item })
            expect(holderProxyManager.childrenStateProxyMap.size).toBe(0)

            expect(onInitHandler).toHaveBeenCalledTimes(1)
            expect(holderProxyManager.childrenStateProxyMap.size).toBe(0)

            const [itemState] = StateManager.getOrCreateState(Item, { key: 'assign-1' })

            expect(holderProxy.item).toBe(holderProxyManager.childrenStateProxyMap.get(itemState))

            expect(onInitHandler).toHaveBeenCalledTimes(1)
            expect(holderProxyManager.childrenStateProxyMap.size).toBe(1)

            holder.item = undefined

            expect(holder.itemKey).toBeUndefined()
            expect(onInitHandler).toHaveBeenCalledTimes(1)
            expect(holderProxyManager.childrenStateProxyMap.size).toBe(1)

            expect(holderProxy.item).toBeUndefined()

            expect(onInitHandler).toHaveBeenCalledTimes(1)
            expect(holderProxyManager.childrenStateProxyMap.size).toBe(1)
            // injected state proxy access do not refresh childrenStateProxyMap,
            // just add new state proxies

            holder.item = { id: 'assign-1', value: 5 } as Item

            expect(holder.itemKey).toBe('assign-1')
            expect(onInitHandler).toHaveBeenCalledTimes(2) // will recreate the state (and re-init the state)
            expect(holderProxyManager.childrenStateProxyMap.size).toBe(1)

            expect(holderProxyManager.childrenStateProxyMap.get(itemState)).not.toBeUndefined()

            expect(holderProxy.item).not.toBe(
                holderProxyManager.childrenStateProxyMap.get(itemState)
            )

            holderProxyManager.refresh()

            expect(onInitHandler).toHaveBeenCalledTimes(2)
            expect(holderProxyManager.childrenStateProxyMap.size).toBe(1)

            const [newItemState] = StateManager.getOrCreateState(Item, { key: 'assign-1' })

            expect(holderProxyManager.childrenStateProxyMap.get(itemState)).toBeUndefined()
            expect(holderProxy.item).toBe(
                holderProxyManager.childrenStateProxyMap.get(newItemState)
            )

            expect(holder.itemKey).toBe('assign-1')
            expect(onInitHandler).toHaveBeenNthCalledWith(2, newItemState, { state: newItemState })

            expect(onMountHandler).toHaveBeenCalledTimes(0)
            expect(onUnmountHandler).toHaveBeenCalledTimes(0)
            expect(mockRerender1).toHaveBeenCalledTimes(0)

            const context = { test: 'test' }

            holderProxyManager.mount(mockRerender1, context)

            expect(onInitHandler).toHaveBeenCalledTimes(2)
            expect(onMountHandler).toHaveBeenCalledTimes(1)
            expect(onUnmountHandler).toHaveBeenCalledTimes(0)
            expect(mockRerender1).toHaveBeenCalledTimes(0)

            expect(newItemState.value).toBe(5)

            holder.item = { id: 'assign-1', value: 42 } as Item

            expect(onInitHandler).toHaveBeenCalledTimes(3)

            const [newItemState2] = StateManager.getOrCreateState(Item, { key: 'assign-1' })

            expect(onInitHandler).toHaveBeenNthCalledWith(3, newItemState2, {
                state: newItemState2
            })

            expect(holder.itemKey).toBe('assign-1')
            expect(holder.item).not.toBe(newItemState)
            expect(holder.item).toBe(newItemState2)
            expect(holder.item.value).toBe(42)

            expect(onInitHandler).toHaveBeenCalledTimes(3)
            expect(onMountHandler).toHaveBeenCalledTimes(1)
            expect(onUnmountHandler).toHaveBeenCalledTimes(0)
            expect(mockRerender1).toHaveBeenCalledTimes(2)
            // 2 calls because state assignment triggers re-render of all mounted proxies of the old state

            holderProxyManager.refresh()

            expect(onMountHandler).toHaveBeenCalledTimes(2)
            expect(onUnmountHandler).toHaveBeenCalledTimes(1)
            expect(mockRerender1).toHaveBeenCalledTimes(2)

            holder.item = { id: 'assign-2', value: 100 } as Item

            const newItemState3 = holder.item

            expect(onInitHandler).toHaveBeenCalledTimes(4)
            expect(onInitHandler).toHaveBeenNthCalledWith(4, newItemState3, {
                state: newItemState3
            })

            expect(holder.itemKey).toBe('assign-2')
            expect(holder.item.value).toBe(100)

            const [stateFromStore] = StateManager.getOrCreateState(Item, { key: 'assign-2' })

            expect(stateFromStore).toBe(holder.item)

            holder.item = {
                id: undefined as any,
                value: 100
            } as Item

            expect(onInitHandler).toHaveBeenCalledTimes(4)
            expect(holder.itemKey).toBeUndefined()
            expect(holder.item).toBeUndefined()

            holder.item = {
                id: null as any,
                value: 100
            } as Item

            expect(onInitHandler).toHaveBeenCalledTimes(4)
            expect(holder.itemKey).toBeNull()
            expect(holder.item).toBeNull()

            holder.item = undefined

            expect(onInitHandler).toHaveBeenCalledTimes(4)
            expect(holder.itemKey).toBeUndefined()
            expect(holder.item).toBeUndefined()

            holder.item = null

            expect(onInitHandler).toHaveBeenCalledTimes(4)
            expect(holder.itemKey).toBeNull()
            expect(holder.item).toBeNull()
        })

        it('allows assigning arrays of injected states when keyResolver is provided', () => {
            const onInitHandler = jest.fn()
            const onMountHandler = jest.fn()
            const onUnmountHandler = jest.fn()
            const mockRerender1 = jest.fn()

            class Item {
                id = ''
                value = NUMBER({ default: 0 })

                @OnInit()
                handleInit(args: OnInitArgs) {
                    onInitHandler(this, args)
                }

                @OnMount()
                handleMount(args: OnMountArgs) {
                    onMountHandler(this, args)
                }

                @OnUnmount()
                handleUnmount(args: OnUnmountArgs) {
                    onUnmountHandler(this, args)
                }
            }

            class Holder {
                itemsKey = ARRAY(STRING({ optional: true, nullable: true }))
                items = InjectModel([Item], { keyResolver: 'id', optional: true, nullable: true })
            }

            const [holder] = StateManager.getOrCreateState(Holder)
            const [holderProxy] = StateProxyManager.getOrCreateStateProxy(holder)
            const holderProxyManager = StateProxyManager.instance(holderProxy)

            expect(holder.itemsKey).toEqual([])
            expect(onInitHandler).toHaveBeenCalledTimes(0)
            expect(holderProxyManager.childrenStateProxyMap.size).toBe(0)

            holder.items = [{ id: 'assign-1', value: 5 }] as Item[]

            expect(onInitHandler).toHaveBeenCalledTimes(1)
            expect(onInitHandler).toHaveBeenCalledWith(holder.items[0], { state: holder.items[0] })

            expect(holder.itemsKey).toEqual(['assign-1'])
            expect(holder.items).toEqual([{ id: 'assign-1', value: 5 }])

            expect(holderProxyManager.childrenStateProxyMap.size).toBe(0)

            const [initialAssign1State] = StateManager.getOrCreateState(Item, { key: 'assign-1' })
            const firstProxiedItems = holderProxy.items

            expect(firstProxiedItems[0]).toBe(
                holderProxyManager.childrenStateProxyMap.get(initialAssign1State)
            )
            expect(holderProxyManager.childrenStateProxyMap.size).toBe(1)

            holder.items = [
                { id: 'assign-2', value: 6 },
                { id: 'assign-1', value: 5 },
                undefined,
                null,
                { id: 'assign-1', value: 4 },
                { id: 'assign-2', value: 7 },
                { id: undefined as any, value: 111 },
                { id: null as any, value: 112 }
            ] as Item[]

            expect(onInitHandler).toHaveBeenCalledTimes(3)
            expect(onInitHandler).toHaveBeenNthCalledWith(2, holder.items[0], {
                state: holder.items[0]
            })
            expect(onInitHandler).toHaveBeenNthCalledWith(3, holder.items[1], {
                state: holder.items[1]
            })

            expect(holder.itemsKey).toEqual([
                'assign-2',
                'assign-1',
                undefined,
                null,
                'assign-1',
                'assign-2',
                undefined,
                null
            ])
            expect(holder.items).toEqual([
                { id: 'assign-2', value: 7 },
                { id: 'assign-1', value: 4 }, // replaced with the last one for the same key
                undefined,
                null,
                { id: 'assign-1', value: 4 },
                { id: 'assign-2', value: 7 },
                undefined,
                null
            ])

            expect(holderProxyManager.childrenStateProxyMap.size).toBe(1)
            expect(
                holderProxyManager.childrenStateProxyMap.get(initialAssign1State)
            ).not.toBeUndefined()

            const proxiedItemsBeforeRefresh = holderProxy.items

            expect(proxiedItemsBeforeRefresh[1]).not.toBe(
                holderProxyManager.childrenStateProxyMap.get(initialAssign1State)
            )

            const [assign2StateAfterShuffle] = StateManager.getOrCreateState(Item, {
                key: 'assign-2'
            })
            const [assign1StateAfterShuffle] = StateManager.getOrCreateState(Item, {
                key: 'assign-1'
            })

            holderProxyManager.refresh()

            const proxiedItemsAfterRefresh = holderProxy.items

            expect(holderProxyManager.childrenStateProxyMap.size).toBe(2)
            expect(
                holderProxyManager.childrenStateProxyMap.get(initialAssign1State)
            ).toBeUndefined()
            expect(proxiedItemsAfterRefresh[0]).toBe(
                holderProxyManager.childrenStateProxyMap.get(assign2StateAfterShuffle)
            )
            expect(proxiedItemsAfterRefresh[1]).toBe(
                holderProxyManager.childrenStateProxyMap.get(assign1StateAfterShuffle)
            )

            const context = { test: 'array-assign' }

            holderProxyManager.mount(mockRerender1, context)

            expect(onMountHandler).toHaveBeenCalledTimes(2)
            expect(onUnmountHandler).toHaveBeenCalledTimes(0)
            expect(mockRerender1).toHaveBeenCalledTimes(0)

            holder.items = [
                { id: 'assign-1', value: 50 },
                { id: 'assign-2', value: 60 }
            ] as Item[]

            expect(onInitHandler).toHaveBeenCalledTimes(5)

            const [assign1StateAfterUpdate] = StateManager.getOrCreateState(Item, {
                key: 'assign-1'
            })
            const [assign2StateAfterUpdate] = StateManager.getOrCreateState(Item, {
                key: 'assign-2'
            })

            expect(holder.itemsKey).toEqual(['assign-1', 'assign-2'])
            expect(holder.items).toEqual([
                { id: 'assign-1', value: 50 },
                { id: 'assign-2', value: 60 }
            ])

            expect(mockRerender1).toHaveBeenCalledTimes(4)
            // 4 calls because state assignment triggers re-render of all mounted proxies of each state

            holderProxyManager.refresh()

            expect(onMountHandler).toHaveBeenCalledTimes(4)
            expect(onUnmountHandler).toHaveBeenCalledTimes(2)

            const proxiedItemsAfterSecondRefresh = holderProxy.items

            expect(proxiedItemsAfterSecondRefresh[0]).toBe(
                holderProxyManager.childrenStateProxyMap.get(assign1StateAfterUpdate)
            )
            expect(proxiedItemsAfterSecondRefresh[1]).toBe(
                holderProxyManager.childrenStateProxyMap.get(assign2StateAfterUpdate)
            )

            holder.items = []

            expect(onInitHandler).toHaveBeenCalledTimes(5)

            expect(holder.itemsKey).toEqual([])
            expect(holder.items).toEqual([])

            expect(mockRerender1).toHaveBeenCalledTimes(6)
            // +2 calls because removing both mounted states triggers their rerenders before unmount

            holderProxyManager.refresh()

            expect(onInitHandler).toHaveBeenCalledTimes(5)
            expect(onMountHandler).toHaveBeenCalledTimes(4)
            expect(onUnmountHandler).toHaveBeenCalledTimes(4)
            expect(holderProxyManager.childrenStateProxyMap.size).toBe(0)
            expect(StateProxyManager.getMountedStateProxies(assign1StateAfterUpdate).size).toBe(0)
            expect(StateProxyManager.getMountedStateProxies(assign2StateAfterUpdate).size).toBe(0)

            holder.items = [
                { id: undefined as any, value: 200 },
                { id: null as any, value: 300 }
            ] as Item[]

            holderProxyManager.refresh()

            expect(onInitHandler).toHaveBeenCalledTimes(5)
            expect(onMountHandler).toHaveBeenCalledTimes(4)
            expect(onUnmountHandler).toHaveBeenCalledTimes(4)
            expect(holder.itemsKey).toEqual([undefined, null])
            expect(holder.items).toEqual([undefined, null])

            expect(holderProxyManager.childrenStateProxyMap.size).toBe(0)

            expect(() => {
                holder.items = undefined as any
            }).toThrow()

            expect(() => {
                holder.items = null as any
            }).toThrow()

            expect(onInitHandler).toHaveBeenCalledTimes(5)

            holder.items = [{ id: 'assign-1', value: 5 }] as Item[]

            holderProxyManager.refresh()

            expect(onInitHandler).toHaveBeenCalledTimes(6)
            expect(onMountHandler).toHaveBeenCalledTimes(5)
            expect(onUnmountHandler).toHaveBeenCalledTimes(4)

            const oldItemsArr = holderProxy.items

            holder.items = [...holder.items, { id: 'assign-2', value: 6 }] as Item[]

            expect(onInitHandler).toHaveBeenCalledTimes(7)
            expect(onMountHandler).toHaveBeenCalledTimes(5)
            expect(onUnmountHandler).toHaveBeenCalledTimes(4)

            holderProxyManager.refresh()

            expect(onInitHandler).toHaveBeenCalledTimes(7)
            expect(onMountHandler).toHaveBeenCalledTimes(6)
            expect(onUnmountHandler).toHaveBeenCalledTimes(4)

            expect(holderProxy.items[0]).toBe(oldItemsArr[0])
        })

        it('supports function keyResolver', () => {
            class Item {
                uid = ''
                value = NUMBER({ default: 0 })
            }

            class Holder {
                item = InjectModel(Item, {
                    keyResolver: (item) => item.uid
                })
            }

            const [holder] = StateManager.getOrCreateState(Holder)

            holder.item = { uid: 'fn-1', value: 77 }

            const resolved = holder.item as any as Item

            expect(resolved.value).toBe(77)
        })

        it('supports function keyResolver for arrays', () => {
            const onInitHandler = jest.fn()

            class Item {
                uid = ''
                value = NUMBER({ default: 0 })

                @OnInit()
                handleInit(args: OnInitArgs) {
                    onInitHandler(this, args)
                }
            }

            class Holder {
                itemsKey = ARRAY(STRING({ optional: true }))
                items = InjectModel([Item], {
                    keyResolver: (item: Item) => item.uid,
                    optional: true
                })
            }

            const [holder] = StateManager.getOrCreateState(Holder)

            holder.items = [
                { uid: 'fn-array-1', value: 10 },
                { uid: 'fn-array-2', value: 20 }
            ] as Item[]

            expect(onInitHandler).toHaveBeenCalledTimes(2)
            expect(holder.itemsKey).toEqual(['fn-array-1', 'fn-array-2'])

            const firstBatchItems = holder.items as Item[]

            expect(firstBatchItems[0].value).toBe(10)
            expect(firstBatchItems[1].value).toBe(20)

            holder.items = [
                { uid: 'fn-array-2', value: 30 },
                { uid: 'fn-array-1', value: 40 },
                { uid: 'fn-array-3', value: 50 }
            ] as Item[]

            expect(onInitHandler).toHaveBeenCalledTimes(5)
            expect(holder.itemsKey).toEqual(['fn-array-2', 'fn-array-1', 'fn-array-3'])

            const secondBatchItems = holder.items as Item[]

            expect(secondBatchItems[0].value).toBe(30)
            expect(secondBatchItems[1].value).toBe(40)
            expect(secondBatchItems[2].value).toBe(50)
        })

        it('throws when assigning without keyResolver', () => {
            class Item {
                id = ''
            }

            class Holder {
                item = InjectModel(Item)
            }

            const [holder] = StateManager.getOrCreateState(Holder)

            expect(() => {
                ;(holder as any).item = { id: 'k1' }
            }).toThrow()
        })

        it('throws when assigning arrays with undefined or null keys if flags are disabled', () => {
            class Item {
                id = ''
                value = NUMBER({ default: 0 })
            }

            class Holder {
                items = InjectModel([Item], { keyResolver: 'id' })
            }

            const [holder] = StateManager.getOrCreateState(Holder)

            expect(() => {
                holder.items = [{ id: undefined as any, value: 1 }] as Item[]
            }).toThrow()

            expect(() => {
                holder.items = [{ id: null as any, value: 1 }] as Item[]
            }).toThrow()
        })
    })
})
