import { UseLoader, StateStore, StateManager, StateProxyManager, isPromiseLike } from '../../src'

describe('Utils', () => {
    let store: StateStore

    beforeEach(() => {
        store = new StateStore()
    })

    test('isPromiseLike', () => {
        expect(isPromiseLike(function () {})).toBe(false)
        expect(isPromiseLike(() => {})).toBe(false)
        expect(isPromiseLike(async () => {})).toBe(false)
        expect(isPromiseLike(new Promise((r) => r))).toBe(true)
    })

    describe('Decorators', () => {
        test('useLoader with async func', async () => {
            let arg1: any
            let arg2: any
            let arg3: any

            let promiseResolve: any

            class Model {
                @UseLoader(function (this, isLoading, targetObject) {
                    arg1 = this
                    arg2 = isLoading
                    arg3 = targetObject
                })
                async fn() {
                    await new Promise((resolve) => {
                        promiseResolve = resolve
                    })
                }
            }

            const state = StateManager.createState(Model, { store })
            const stateProxy = StateProxyManager.createStateProxy(state)

            const loaderResult = stateProxy.fn()

            expect(arg1).toBe(stateProxy)
            expect(arg2).toBe(true)
            expect(arg3).toBe(stateProxy)

            promiseResolve()

            await loaderResult

            expect(arg1).toBe(stateProxy)
            expect(arg2).toBe(false)
            expect(arg3).toBe(stateProxy)
        })

        test('useLoader with sync func', async () => {
            let startLoadingTarget: any
            let startLoadingCalledCount = 0
            let stopLoadingTarget: any
            let stopLoadingCalledCount = 0
            let calledCount = 0

            class Model {
                @UseLoader(function (this, isLoading, targetObject) {
                    if (isLoading) {
                        startLoadingTarget = targetObject
                        startLoadingCalledCount++
                    } else {
                        stopLoadingTarget = targetObject
                        stopLoadingCalledCount++
                    }
                })
                fn() {
                    calledCount++
                }
            }

            const state = StateManager.createState(Model, { store })
            const stateProxy = StateProxyManager.createStateProxy(state)

            stateProxy.fn()

            expect(calledCount).toBe(1)
            expect(startLoadingCalledCount).toBe(1)
            expect(startLoadingTarget).toBe(stateProxy)

            expect(stopLoadingCalledCount).toBe(0)
            expect(stopLoadingTarget).toBe(undefined)

            await new Promise((r) => setTimeout(r)) // event loop tick

            expect(stopLoadingCalledCount).toBe(1)
            expect(stopLoadingTarget).toBe(stateProxy)
        })

        test('useLoader with class async method', async () => {
            let arg1: any
            let arg2: any
            let arg3: any

            let promiseResolve: any

            class Model {
                async loader(this: this, isLoading: boolean, targetObject: this) {
                    arg1 = this
                    arg2 = isLoading
                    arg3 = targetObject
                }

                @UseLoader('loader')
                async fn() {
                    await new Promise((resolve) => {
                        promiseResolve = resolve
                    })
                }
            }

            const state = StateManager.createState(Model, { store })
            const stateProxy = StateProxyManager.createStateProxy(state)

            const loaderResult = stateProxy.fn()

            expect(arg1).toBe(stateProxy)
            expect(arg2).toBe(true)
            expect(arg3).toBe(stateProxy)

            promiseResolve()

            await loaderResult

            expect(arg1).toBe(stateProxy)
            expect(arg2).toBe(false)
            expect(arg3).toBe(stateProxy)
        })
    })
})
