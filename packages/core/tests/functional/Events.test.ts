import { Meta } from 'metatyper'

import {
    EventsManager,
    InjectModel,
    OnChange,
    OnChangeArgs,
    OnError,
    OnErrorArgs,
    OnInit,
    OnInitArgs,
    OnMount,
    OnMountArgs,
    OnUnmount,
    OnUnmountArgs,
    StateManager,
    StateProxyManager,
    StateStore,
    type EventHandler,
    type OnChangeHandler
} from '../../src'

describe('Events', () => {
    beforeEach(() => {
        const store = StateStore.defaultStore

        store.clearStore()
    })

    describe('EventsManager', () => {
        let state: any
        let eventsManager: EventsManager

        beforeEach(() => {
            state = {}
            eventsManager = new EventsManager(state)
        })

        it('adds a handler for the specified event', () => {
            const handler: EventHandler = jest.fn()

            eventsManager.subscribe(OnChange, handler)
            expect(eventsManager.getHandlers(OnChange)).toContain(handler)
        })

        it('removes a handler for the specified event', () => {
            const handler: EventHandler = jest.fn()

            eventsManager.subscribe(OnChange, handler)
            eventsManager.unsubscribe(OnChange, handler)
            expect(eventsManager.getHandlers(OnChange)).not.toContain(handler)
        })

        it('calls the event handler with specified arguments', () => {
            const handler: OnChangeHandler = jest.fn()

            eventsManager.subscribe(OnChange, handler)

            const args = {
                state,
                propName: 'prop',
                prevValue: null,
                newValue: 42
            }

            eventsManager.emit(OnChange, [args])
            expect(handler).toHaveBeenCalledWith(args)
        })
    })

    describe('Events Lifecycle', () => {
        it('triggers change event when a value is set', () => {
            const mountHandler = jest.fn()
            const changeHandler = jest.fn()
            const rerenderHandler = jest.fn()

            const field3Model = {
                field31: 31,
                field32: 32,
                mount: OnMount(mountHandler.bind(null, 'field3')),
                change: OnChange(changeHandler.bind(null, 'field3'))
            }
            const field4Model = {
                field41: 41,
                field42: 42,
                mount: OnMount(mountHandler.bind(null, 'field4')),
                change: OnChange(changeHandler.bind(null, 'field4'))
            }

            const model = {
                field: 0,
                field2: 2,
                field3: InjectModel(() => field3Model),
                field4Key: 'key',
                field4: InjectModel([() => field4Model]),
                mountHandler: OnMount(mountHandler.bind(null, 'model')),
                changeHandler: OnChange(changeHandler.bind(null, 'model'))
            }

            const [state] = StateManager.getOrCreateState(model)

            const [stateProxy] = StateProxyManager.getOrCreateStateProxy(state, {
                observeProps: {
                    field: true,
                    field2: false,
                    field3: {
                        field31: true,
                        field32: false
                    },
                    field4: {
                        field41: true,
                        field42: false
                    }
                }
            })
            const stateProxyManager = StateProxyManager.instance(stateProxy)

            stateProxyManager.mount(rerenderHandler)

            expect(mountHandler).toHaveBeenCalledTimes(3)

            expect(changeHandler).not.toHaveBeenCalled()
            expect(rerenderHandler).not.toHaveBeenCalled()

            stateProxy.field = 1

            expect(changeHandler).toHaveBeenCalledTimes(1)
            expect(rerenderHandler).toHaveBeenCalledTimes(1)

            stateProxy.field = 1

            expect(changeHandler).toHaveBeenCalledTimes(1)
            expect(rerenderHandler).toHaveBeenCalledTimes(1)

            Meta.deserialize(stateProxy, {
                field: 2
            })

            expect(changeHandler).toHaveBeenCalledTimes(2)
            expect(rerenderHandler).toHaveBeenCalledTimes(2)

            Meta.deserialize(stateProxy, {
                field: 2
            })

            expect(changeHandler).toHaveBeenCalledTimes(2)
            expect(rerenderHandler).toHaveBeenCalledTimes(2)

            Object.defineProperty(stateProxy, 'field', {
                value: 3
            })

            expect(changeHandler).toHaveBeenCalledTimes(2)
            expect(rerenderHandler).toHaveBeenCalledTimes(2)

            stateProxy.field2 = 1

            expect(changeHandler).toHaveBeenCalledTimes(3)
            expect(rerenderHandler).toHaveBeenCalledTimes(2)

            stateProxy.field3.field31 = 1

            expect(changeHandler).toHaveBeenCalledTimes(4)
            expect(rerenderHandler).toHaveBeenCalledTimes(3)

            stateProxy.field3.field32 = 1

            expect(changeHandler).toHaveBeenCalledTimes(5)
            expect(rerenderHandler).toHaveBeenCalledTimes(3)

            stateProxy.field4[0].field41 = 1

            expect(changeHandler).toHaveBeenCalledTimes(6)
            expect(rerenderHandler).toHaveBeenCalledTimes(4)

            stateProxy.field4[0].field42 = 1

            expect(changeHandler).toHaveBeenCalledTimes(7)
            expect(rerenderHandler).toHaveBeenCalledTimes(4)
        })

        it('triggers error event when an error is set', () => {
            const handler = jest.fn()

            const [state] = StateManager.getOrCreateState({
                field: 0,
                errHandler: OnError(handler)
            })
            const [stateProxy] = StateProxyManager.getOrCreateStateProxy(state, {
                observeProps: ['field']
            })

            expect(handler).not.toHaveBeenCalled()

            expect(() => {
                stateProxy.field = '1' as any // this triggers a validation error
            }).toThrow()

            expect(handler).toHaveBeenCalledTimes(1)

            expect(() => {
                Meta.deserialize(stateProxy, { field: '1' as any }) // this triggers a validation error
            }).toThrow()

            expect(handler).toHaveBeenCalledTimes(2)

            expect(() => {
                Object.defineProperty(stateProxy, 'field', {
                    value: '2'
                })
            }).toThrow() // it should trigger a validation error

            expect(handler).toHaveBeenCalledTimes(3)
        })

        it('triggers init event when a state is created', () => {
            const handler = jest.fn()

            class TestModel {
                field = 0

                @OnInit()
                onInitHandler() {
                    handler()
                }
            }

            StateManager.getOrCreateState(TestModel)

            expect(handler).toHaveBeenCalledTimes(1)
        })

        it('triggers parent event handlers when inheriting from a base model with classes', () => {
            const baseInitHandler = jest.fn()
            const baseMountHandler = jest.fn()
            const baseUnmountHandler = jest.fn()
            const baseChangeHandler = jest.fn()
            const baseErrorHandler = jest.fn()

            const childInitHandler = jest.fn()
            const childMountHandler = jest.fn()
            const childUnmountHandler = jest.fn()
            const childChangeHandler = jest.fn()
            const childErrorHandler = jest.fn()

            class BaseModelChild {
                baseModelChild = 1
            }

            class BaseModel {
                field = 0

                baseModelChild = InjectModel(BaseModelChild)

                @OnInit()
                onInit(args: OnInitArgs) {
                    baseInitHandler(this, args, {
                        baseModelChild: this.baseModelChild,
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.state),
                        stateIsState: StateManager.isState(args.state)
                    })
                }

                onMountBase = OnMount(function (args: OnMountArgs) {
                    baseMountHandler(this, args, {
                        baseModelChild: this.baseModelChild,
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.stateProxy),
                        stateIsState: StateManager.isState(args.stateProxy)
                    })
                })

                @OnUnmount()
                onUnmount(args: OnUnmountArgs) {
                    baseUnmountHandler(this, args, {
                        baseModelChild: this.baseModelChild,
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.stateProxy),
                        stateIsState: StateManager.isState(args.stateProxy)
                    })
                }

                onChange = OnChange(function (args: OnChangeArgs) {
                    baseChangeHandler(this, args, {
                        baseModelChild: this.baseModelChild,
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.state),
                        stateIsState: StateManager.isState(args.state)
                    })
                })

                @OnError()
                onError(args: OnErrorArgs) {
                    baseErrorHandler(this, args, {
                        baseModelChild: this.baseModelChild,
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.state),
                        stateIsState: StateManager.isState(args.state)
                    })
                }
            }

            class ChildModelChild {
                childModelChild = 2
            }

            class ChildModel extends BaseModel {
                childModelChild = InjectModel(ChildModelChild)

                @OnInit()
                onInit(args: OnInitArgs) {
                    childInitHandler(this, args, {
                        baseModelChild: this.baseModelChild,
                        childModelChild: this.childModelChild,
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.state),
                        stateIsState: StateManager.isState(args.state)
                    })
                }

                onMount = OnMount(function (args: OnMountArgs) {
                    childMountHandler(this, args, {
                        baseModelChild: this.baseModelChild,
                        childModelChild: this.childModelChild,
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.stateProxy),
                        stateIsState: StateManager.isState(args.stateProxy)
                    })
                })

                onUnmount = OnUnmount(function (args: OnUnmountArgs) {
                    childUnmountHandler(this, args, {
                        baseModelChild: this.baseModelChild,
                        childModelChild: this.childModelChild,
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.stateProxy),
                        stateIsState: StateManager.isState(args.stateProxy)
                    })
                })

                onChange = OnChange(function (args: OnChangeArgs) {
                    childChangeHandler(this, args, {
                        baseModelChild: this.baseModelChild,
                        childModelChild: this.childModelChild,
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.state),
                        stateIsState: StateManager.isState(args.state)
                    })
                })

                @OnError()
                onError(args: OnErrorArgs) {
                    childErrorHandler(this, args, {
                        baseModelChild: this.baseModelChild,
                        childModelChild: this.childModelChild,
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.state),
                        stateIsState: StateManager.isState(args.state)
                    })
                }
            }

            const [state] = StateManager.getOrCreateState(ChildModel)

            expect(baseInitHandler).toHaveBeenCalledWith(
                state,
                { state },
                {
                    baseModelChild: state.baseModelChild,
                    thisIsStateProxy: false,
                    thisIsState: true,
                    stateIsStateProxy: false,
                    stateIsState: true
                }
            )
            expect(childInitHandler).toHaveBeenCalledWith(
                state,
                { state },
                {
                    baseModelChild: state.baseModelChild,
                    childModelChild: state.childModelChild,
                    thisIsStateProxy: false,
                    thisIsState: true,
                    stateIsStateProxy: false,
                    stateIsState: true
                }
            )

            const [stateProxy] = StateProxyManager.getOrCreateStateProxy(state)
            const stateProxyManager = StateProxyManager.instance(stateProxy)

            const rerender = jest.fn()
            const context = { test: 'test' }

            stateProxyManager.mount(rerender, context)

            expect(baseInitHandler).toHaveBeenCalledTimes(1)
            expect(childInitHandler).toHaveBeenCalledTimes(1)
            expect(baseMountHandler).toHaveBeenCalledTimes(1)
            expect(childMountHandler).toHaveBeenCalledTimes(1)

            expect(baseUnmountHandler).toHaveBeenCalledTimes(0)
            expect(childUnmountHandler).toHaveBeenCalledTimes(0)
            expect(baseChangeHandler).toHaveBeenCalledTimes(0)
            expect(childChangeHandler).toHaveBeenCalledTimes(0)
            expect(baseErrorHandler).toHaveBeenCalledTimes(0)
            expect(childErrorHandler).toHaveBeenCalledTimes(0)

            expect(baseMountHandler).toHaveBeenCalledWith(
                stateProxy,
                { stateProxy, context },
                {
                    baseModelChild: stateProxy.baseModelChild,
                    thisIsStateProxy: true,
                    thisIsState: true,
                    stateIsStateProxy: true,
                    stateIsState: true
                }
            )
            expect(childMountHandler).toHaveBeenCalledWith(
                stateProxy,
                { stateProxy, context },
                {
                    baseModelChild: stateProxy.baseModelChild,
                    childModelChild: stateProxy.childModelChild,
                    thisIsStateProxy: true,
                    thisIsState: true,
                    stateIsStateProxy: true,
                    stateIsState: true
                }
            )

            stateProxyManager.unmount()

            expect(baseInitHandler).toHaveBeenCalledTimes(1)
            expect(childInitHandler).toHaveBeenCalledTimes(1)
            expect(baseMountHandler).toHaveBeenCalledTimes(1)
            expect(childMountHandler).toHaveBeenCalledTimes(1)
            expect(baseUnmountHandler).toHaveBeenCalledTimes(1)
            expect(childUnmountHandler).toHaveBeenCalledTimes(1)

            expect(baseChangeHandler).toHaveBeenCalledTimes(0)
            expect(childChangeHandler).toHaveBeenCalledTimes(0)
            expect(baseErrorHandler).toHaveBeenCalledTimes(0)
            expect(childErrorHandler).toHaveBeenCalledTimes(0)

            expect(baseUnmountHandler).toHaveBeenCalledWith(
                stateProxy,
                { stateProxy, context },
                {
                    baseModelChild: stateProxy.baseModelChild,
                    thisIsStateProxy: true,
                    thisIsState: true,
                    stateIsStateProxy: true,
                    stateIsState: true
                }
            )
            expect(childUnmountHandler).toHaveBeenCalledWith(
                stateProxy,
                { stateProxy, context },
                {
                    baseModelChild: stateProxy.baseModelChild,
                    childModelChild: stateProxy.childModelChild,
                    thisIsStateProxy: true,
                    thisIsState: true,
                    stateIsStateProxy: true,
                    stateIsState: true
                }
            )

            state.field = 42

            expect(baseInitHandler).toHaveBeenCalledTimes(1)
            expect(childInitHandler).toHaveBeenCalledTimes(1)
            expect(baseMountHandler).toHaveBeenCalledTimes(1)
            expect(childMountHandler).toHaveBeenCalledTimes(1)
            expect(baseUnmountHandler).toHaveBeenCalledTimes(1)
            expect(childUnmountHandler).toHaveBeenCalledTimes(1)

            // Event handlers defined via MetaType are not inherited by child classes
            // Only event handlers defined via decorators are inherited
            expect(baseChangeHandler).toHaveBeenCalledTimes(0)
            expect(childChangeHandler).toHaveBeenCalledTimes(1)

            expect(baseErrorHandler).toHaveBeenCalledTimes(0)
            expect(childErrorHandler).toHaveBeenCalledTimes(0)

            expect(childChangeHandler).toHaveBeenCalledWith(
                state,
                { state, propName: 'field', prevValue: 0, newValue: 42 },
                {
                    baseModelChild: state.baseModelChild,
                    childModelChild: state.childModelChild,
                    thisIsStateProxy: false,
                    thisIsState: true,
                    stateIsStateProxy: false,
                    stateIsState: true
                }
            )

            stateProxy.field = 43

            expect(baseInitHandler).toHaveBeenCalledTimes(1)
            expect(childInitHandler).toHaveBeenCalledTimes(1)
            expect(baseMountHandler).toHaveBeenCalledTimes(1)
            expect(childMountHandler).toHaveBeenCalledTimes(1)
            expect(baseUnmountHandler).toHaveBeenCalledTimes(1)
            expect(childUnmountHandler).toHaveBeenCalledTimes(1)
            expect(baseChangeHandler).toHaveBeenCalledTimes(0)
            expect(childChangeHandler).toHaveBeenCalledTimes(2)

            expect(baseErrorHandler).toHaveBeenCalledTimes(0)
            expect(childErrorHandler).toHaveBeenCalledTimes(0)

            expect(childChangeHandler).toHaveBeenNthCalledWith(
                2,
                stateProxy,
                { state: stateProxy, propName: 'field', prevValue: 42, newValue: 43 },
                {
                    baseModelChild: stateProxy.baseModelChild,
                    childModelChild: stateProxy.childModelChild,
                    thisIsStateProxy: true,
                    thisIsState: true,
                    stateIsStateProxy: true,
                    stateIsState: true
                }
            )

            // Test error event
            const error = new Error('test error')
            const errorArgs = { error, state, errorPlace: 'set' as const }

            stateProxyManager.eventsManager.emit(OnError, [errorArgs], state)

            expect(baseInitHandler).toHaveBeenCalledTimes(1)
            expect(childInitHandler).toHaveBeenCalledTimes(1)
            expect(baseMountHandler).toHaveBeenCalledTimes(1)
            expect(childMountHandler).toHaveBeenCalledTimes(1)
            expect(baseUnmountHandler).toHaveBeenCalledTimes(1)
            expect(childUnmountHandler).toHaveBeenCalledTimes(1)
            expect(baseChangeHandler).toHaveBeenCalledTimes(0)
            expect(childChangeHandler).toHaveBeenCalledTimes(2)
            expect(baseErrorHandler).toHaveBeenCalledTimes(1)
            expect(childErrorHandler).toHaveBeenCalledTimes(1)

            expect(baseErrorHandler).toHaveBeenCalledWith(
                state,
                { state, error, errorPlace: 'set' },
                {
                    baseModelChild: state.baseModelChild,
                    thisIsStateProxy: false,
                    thisIsState: true,
                    stateIsStateProxy: false,
                    stateIsState: true
                }
            )
            expect(childErrorHandler).toHaveBeenCalledWith(
                state,
                { state, error, errorPlace: 'set' },
                {
                    baseModelChild: state.baseModelChild,
                    childModelChild: state.childModelChild,
                    thisIsStateProxy: false,
                    thisIsState: true,
                    stateIsStateProxy: false,
                    stateIsState: true
                }
            )
        })

        it('triggers parent event handlers when inheriting from a base model with objects', () => {
            const baseInitHandler = jest.fn()
            const baseMountHandler = jest.fn()
            const baseUnmountHandler = jest.fn()
            const baseChangeHandler = jest.fn()
            const baseErrorHandler = jest.fn()

            const childInitHandler = jest.fn()
            const childMountHandler = jest.fn()
            const childUnmountHandler = jest.fn()
            const childChangeHandler = jest.fn()
            const childErrorHandler = jest.fn()

            const BaseModel = {
                field: 0,

                onInitBase: OnInit(function BaseModelOnInit(args: OnInitArgs) {
                    baseInitHandler(this, args, {
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.state),
                        stateIsState: StateManager.isState(args.state)
                    })
                }),

                onMountBase: OnMount(function BaseModelOnMount(args: OnMountArgs) {
                    baseMountHandler(this, args, {
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.stateProxy),
                        stateIsState: StateManager.isState(args.stateProxy)
                    })
                }),

                onUnmountBase: OnUnmount(function BaseModelOnUnmount(args: OnUnmountArgs) {
                    baseUnmountHandler(this, args, {
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.stateProxy),
                        stateIsState: StateManager.isState(args.stateProxy)
                    })
                }),

                onChangeBase: OnChange(function BaseModelOnChange(args: OnChangeArgs) {
                    baseChangeHandler(this, args, {
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.state),
                        stateIsState: StateManager.isState(args.state)
                    })
                }),

                onErrorBase: OnError(function BaseModelOnError(args: OnErrorArgs) {
                    baseErrorHandler(this, args, {
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.state),
                        stateIsState: StateManager.isState(args.state)
                    })
                })
            }

            const ChildModel = {
                onInitChild: OnInit(function ChildModelOnInit(args: OnInitArgs) {
                    childInitHandler(this, args, {
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.state),
                        stateIsState: StateManager.isState(args.state)
                    })
                }),

                onMountChild: OnMount(function ChildModelOnMount(args: OnMountArgs) {
                    childMountHandler(this, args, {
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.stateProxy),
                        stateIsState: StateManager.isState(args.stateProxy)
                    })
                }),

                onUnmountChild: OnUnmount(function ChildModelOnUnmount(args: OnUnmountArgs) {
                    childUnmountHandler(this, args, {
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.stateProxy),
                        stateIsState: StateManager.isState(args.stateProxy)
                    })
                }),

                onChangeChild: OnChange(function ChildModelOnChange(args: OnChangeArgs) {
                    childChangeHandler(this, args, {
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.state),
                        stateIsState: StateManager.isState(args.state)
                    })
                }),

                onErrorChild: OnError(function ChildModelOnError(args: OnErrorArgs) {
                    childErrorHandler(this, args, {
                        thisIsStateProxy: StateProxyManager.isStateProxy(this),
                        thisIsState: StateManager.isState(this),
                        stateIsStateProxy: StateProxyManager.isStateProxy(args.state),
                        stateIsState: StateManager.isState(args.state)
                    })
                })
            }

            Reflect.setPrototypeOf(ChildModel, BaseModel)

            const [state] = StateManager.getOrCreateState(
                ChildModel as typeof BaseModel & typeof ChildModel
            )

            // With objects, parent handlers are not automatically inherited
            expect(baseInitHandler).toHaveBeenCalledTimes(0)
            expect(childInitHandler).toHaveBeenCalledWith(
                state,
                { state },
                {
                    thisIsStateProxy: false,
                    thisIsState: true,
                    stateIsStateProxy: false,
                    stateIsState: true
                }
            )

            const [stateProxy] = StateProxyManager.getOrCreateStateProxy(state)
            const stateProxyManager = StateProxyManager.instance(stateProxy)

            const rerender = jest.fn()
            const context = { test: 'test' }

            stateProxyManager.mount(rerender, context)

            expect(baseInitHandler).toHaveBeenCalledTimes(0)
            expect(childInitHandler).toHaveBeenCalledTimes(1)
            expect(baseMountHandler).toHaveBeenCalledTimes(0)
            expect(childMountHandler).toHaveBeenCalledTimes(1)

            expect(baseUnmountHandler).toHaveBeenCalledTimes(0)
            expect(childUnmountHandler).toHaveBeenCalledTimes(0)
            expect(baseChangeHandler).toHaveBeenCalledTimes(0)
            expect(childChangeHandler).toHaveBeenCalledTimes(0)
            expect(baseErrorHandler).toHaveBeenCalledTimes(0)
            expect(childErrorHandler).toHaveBeenCalledTimes(0)

            expect(childMountHandler).toHaveBeenCalledWith(
                stateProxy,
                { stateProxy, context },
                {
                    thisIsStateProxy: true,
                    thisIsState: true,
                    stateIsStateProxy: true,
                    stateIsState: true
                }
            )

            stateProxyManager.unmount()

            expect(baseInitHandler).toHaveBeenCalledTimes(0)
            expect(childInitHandler).toHaveBeenCalledTimes(1)
            expect(baseMountHandler).toHaveBeenCalledTimes(0)
            expect(childMountHandler).toHaveBeenCalledTimes(1)
            expect(baseUnmountHandler).toHaveBeenCalledTimes(0)
            expect(childUnmountHandler).toHaveBeenCalledTimes(1)

            expect(baseChangeHandler).toHaveBeenCalledTimes(0)
            expect(childChangeHandler).toHaveBeenCalledTimes(0)
            expect(baseErrorHandler).toHaveBeenCalledTimes(0)
            expect(childErrorHandler).toHaveBeenCalledTimes(0)

            expect(childUnmountHandler).toHaveBeenCalledWith(
                stateProxy,
                { stateProxy, context },
                {
                    thisIsStateProxy: true,
                    thisIsState: true,
                    stateIsStateProxy: true,
                    stateIsState: true
                }
            )

            // Test state change event
            state.field = 42

            expect(baseInitHandler).toHaveBeenCalledTimes(0)
            expect(childInitHandler).toHaveBeenCalledTimes(1)
            expect(baseMountHandler).toHaveBeenCalledTimes(0)
            expect(childMountHandler).toHaveBeenCalledTimes(1)
            expect(baseUnmountHandler).toHaveBeenCalledTimes(0)
            expect(childUnmountHandler).toHaveBeenCalledTimes(1)
            expect(baseChangeHandler).toHaveBeenCalledTimes(0)
            expect(childChangeHandler).toHaveBeenCalledTimes(1)

            expect(baseErrorHandler).toHaveBeenCalledTimes(0)
            expect(childErrorHandler).toHaveBeenCalledTimes(0)

            expect(childChangeHandler).toHaveBeenCalledWith(
                state,
                { state, propName: 'field', prevValue: 0, newValue: 42 },
                {
                    thisIsStateProxy: false,
                    thisIsState: true,
                    stateIsStateProxy: false,
                    stateIsState: true
                }
            )

            // Test state proxy change event
            stateProxy.field = 43

            expect(baseInitHandler).toHaveBeenCalledTimes(0)
            expect(childInitHandler).toHaveBeenCalledTimes(1)
            expect(baseMountHandler).toHaveBeenCalledTimes(0)
            expect(childMountHandler).toHaveBeenCalledTimes(1)
            expect(baseUnmountHandler).toHaveBeenCalledTimes(0)
            expect(childUnmountHandler).toHaveBeenCalledTimes(1)
            expect(baseChangeHandler).toHaveBeenCalledTimes(0)
            expect(childChangeHandler).toHaveBeenCalledTimes(2)

            expect(baseErrorHandler).toHaveBeenCalledTimes(0)
            expect(childErrorHandler).toHaveBeenCalledTimes(0)
            expect(childChangeHandler).toHaveBeenNthCalledWith(
                2,
                stateProxy,
                { state: stateProxy, propName: 'field', prevValue: 42, newValue: 43 },
                {
                    thisIsStateProxy: true,
                    thisIsState: true,
                    stateIsStateProxy: true,
                    stateIsState: true
                }
            )

            // Test error event
            const error = new Error('test error')
            const errorArgs = { error, state, errorPlace: 'set' as const }

            stateProxyManager.eventsManager.emit(OnError, [errorArgs], state)

            expect(baseInitHandler).toHaveBeenCalledTimes(0)
            expect(childInitHandler).toHaveBeenCalledTimes(1)
            expect(baseMountHandler).toHaveBeenCalledTimes(0)
            expect(childMountHandler).toHaveBeenCalledTimes(1)
            expect(baseUnmountHandler).toHaveBeenCalledTimes(0)
            expect(childUnmountHandler).toHaveBeenCalledTimes(1)
            expect(baseChangeHandler).toHaveBeenCalledTimes(0)
            expect(childChangeHandler).toHaveBeenCalledTimes(2)
            expect(baseErrorHandler).toHaveBeenCalledTimes(0)
            expect(childErrorHandler).toHaveBeenCalledTimes(1)

            expect(childErrorHandler).toHaveBeenCalledWith(
                state,
                { state, error, errorPlace: 'set' },
                {
                    thisIsStateProxy: false,
                    thisIsState: true,
                    stateIsStateProxy: false,
                    stateIsState: true
                }
            )
        })

        it('triggers mount and unmount events', () => {
            const mountHandler = jest.fn()
            const unmountHandler = jest.fn()

            class TestModel {
                field = 0

                @OnMount()
                onMount() {
                    mountHandler()
                }

                @OnUnmount()
                onUnmount() {
                    unmountHandler()
                }
            }

            const [state] = StateManager.getOrCreateState(TestModel)
            const [stateProxy] = StateProxyManager.getOrCreateStateProxy(state)

            const stateProxyManager = StateProxyManager.instance(stateProxy)

            expect(mountHandler).not.toHaveBeenCalled()
            expect(unmountHandler).not.toHaveBeenCalled()

            stateProxyManager.mount(() => {})

            expect(mountHandler).toHaveBeenCalledTimes(1)
            expect(unmountHandler).not.toHaveBeenCalled()

            stateProxyManager.unmount()

            expect(mountHandler).toHaveBeenCalledTimes(1)
            expect(unmountHandler).toHaveBeenCalledTimes(1)
        })
    })
})
