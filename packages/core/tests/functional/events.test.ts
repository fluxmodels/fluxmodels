import { Meta } from 'metatyper'

import {
    EventsManager,
    InjectModel,
    OnChange,
    OnError,
    OnInit,
    OnMount,
    OnUnmount,
    StateManager,
    StateProxyManager,
    type HandlerType,
    type OnChangeHandlerType
} from '../../src'

describe('Events', () => {
    describe('EventsManager', () => {
        let state: any
        let eventsManager: EventsManager<any>

        beforeEach(() => {
            state = {}
            eventsManager = new EventsManager(state)
        })

        it('adds a handler for the specified event', () => {
            const handler: HandlerType = jest.fn()

            eventsManager.subscribe(OnChange, handler)
            expect(eventsManager.getHandlers(OnChange)).toContain(handler)
        })

        it('removes a handler for the specified event', () => {
            const handler: HandlerType = jest.fn()

            eventsManager.subscribe(OnChange, handler)
            eventsManager.unsubscribe(OnChange, handler)
            expect(eventsManager.getHandlers(OnChange)).not.toContain(handler)
        })

        it('calls the event handler with specified arguments', () => {
            const handler: OnChangeHandlerType = jest.fn()

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

    it('triggers change event when a value is set', () => {
        const handler = jest.fn()
        const handlerForObservables = jest.fn()

        const state = StateManager.createState({
            field: 0,
            field2: 2,
            field3: InjectModel({
                field4: 4,
                field5: 5
            }),
            changeHandler: OnChange(handler)
        })
        const stateProxy = StateProxyManager.createStateProxy(state, {
            observeProps: {
                field: true,
                field2: false,
                field3: {
                    field4: true,
                    field5: false
                }
            }
        })
        const stateProxyManager = StateProxyManager.instance(stateProxy)

        stateProxyManager.mount(handlerForObservables)

        expect(handler).not.toHaveBeenCalled()

        stateProxy.field = 1

        expect(handler).toHaveBeenCalledTimes(1)

        stateProxy.field = 1

        expect(handler).toHaveBeenCalledTimes(1)

        Meta.deserialize(stateProxy, {
            field: 2
        })

        expect(handler).toHaveBeenCalledTimes(2)

        Meta.deserialize(stateProxy, {
            field: 2
        })

        expect(handler).toHaveBeenCalledTimes(2)

        Object.defineProperty(stateProxy, 'field', {
            value: 3
        })

        expect(handler).toHaveBeenCalledTimes(2)
        expect(handlerForObservables).toHaveBeenCalledTimes(2)

        stateProxy.field2 = 1

        expect(handler).toHaveBeenCalledTimes(3)
        expect(handlerForObservables).toHaveBeenCalledTimes(2)

        stateProxy.field3.field4 = 1

        expect(handler).toHaveBeenCalledTimes(3)
        expect(handlerForObservables).toHaveBeenCalledTimes(3)

        stateProxy.field3.field5 = 1

        expect(handler).toHaveBeenCalledTimes(3)
        expect(handlerForObservables).toHaveBeenCalledTimes(3)
    })

    it('triggers error event when an error is set', () => {
        const handler = jest.fn()

        const state = StateManager.createState({
            field: 0,
            errHandler: OnError(handler)
        })
        const stateProxy = StateProxyManager.createStateProxy(state, {
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

        StateManager.createState(TestModel)

        expect(handler).toHaveBeenCalledTimes(1)
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

        const state = StateManager.createState(TestModel)
        const stateProxy = StateProxyManager.createStateProxy(state)

        const stateProxyManager = StateProxyManager.instance(stateProxy)

        expect(mountHandler).not.toHaveBeenCalled()
        expect(unmountHandler).not.toHaveBeenCalled()

        stateProxyManager.mount()

        expect(mountHandler).toHaveBeenCalledTimes(1)
        expect(unmountHandler).not.toHaveBeenCalled()

        stateProxyManager.unmount()

        expect(mountHandler).toHaveBeenCalledTimes(1)
        expect(unmountHandler).toHaveBeenCalledTimes(1)
    })
})
