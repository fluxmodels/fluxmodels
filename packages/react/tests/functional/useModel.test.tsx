import React from 'react'
import { render, fireEvent, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'

import {
    useStateStore,
    StateStoreProvider,
    useModel,
    StateManager,
    InjectModel,
    StateStore,
    getKey,
    getStore
} from '../../src'

describe('useModel', () => {
    beforeEach(() => {
        StateStore.defaultStore.clearStore()
    })

    it('should expose the initial state snapshot on first render', () => {
        class TestData {
            test = true
        }

        class TestState {
            testObj = {
                test1: new TestData(),
                test2: { test: true }
            }
        }

        const renders: any[] = []

        const Component = () => {
            const [state] = useModel(TestState)

            renders.push(state)

            return <>{state.testObj.test1.test}</>
        }

        render(<Component />)

        const [state] = StateManager.getOrCreateState(TestState)

        expect(renders.length).toBe(1)
        expect(renders[0].testObj.test1).toBe(state.testObj.test1)
        expect(renders[0].testObj.test2).toEqual(state.testObj.test2)
        // Check that the object is equal but not the same instance
        expect(renders[0].testObj.test2).not.toBe(state.testObj.test2)
    })

    it('should rerender when a top-level field is replaced', async () => {
        class TestState {
            testObj = {
                test: true
            }
        }

        const renders: any[] = []

        const Component = () => {
            const [state] = useModel(TestState)

            renders.push(state)

            return <>{state.testObj.test}</>
        }

        render(<Component />)

        const [state] = StateManager.getOrCreateState(TestState)

        expect(renders.length).toBe(1)
        expect(renders[0].testObj.test).toBe(true)

        act(() => {
            state.testObj.test = false
        })

        // No rerender when modifying a nested property
        expect(renders.length).toBe(1)
        expect(renders[0].testObj.test).toBe(true)

        act(() => {
            state.testObj = { test: false }
        })

        // Rerender when replacing the entire object
        expect(renders.length).toBe(2)
        expect(renders[1].testObj.test).toBe(false)

        // Check that the state proxy is consistent
        expect(Object.getPrototypeOf(renders[0])[Symbol.for('[[StateReference]]')]).toBe(state)
        expect(Object.getPrototypeOf(renders[0])).toBe(Object.getPrototypeOf(renders[1])) // the same state proxy object
    })

    it('should rerender when an injected state changes', async () => {
        class InjectedTestState {
            testObj = {
                test: 1
            }
        }

        class TestState {
            testObj = {
                test: true
            }

            injected = InjectModel(InjectedTestState)
        }

        const renders: any[] = []

        const Component = () => {
            const [state] = useModel(TestState)

            renders.push([state, state.injected])

            return (
                <>
                    {state.testObj.test}
                    {state.injected.testObj.test}
                </>
            )
        }

        render(<Component />)

        const [state] = StateManager.getOrCreateState(TestState)
        const [injectedState] = StateManager.getOrCreateState(InjectedTestState)

        expect(renders.length).toBe(1)
        expect(renders[0][0].testObj).toEqual({ test: true })
        expect(renders[0][1].testObj).toEqual({ test: 1 })

        act(() => {
            state.testObj = { test: false }
        })

        // Rerender when main state changes
        expect(renders.length).toBe(2)
        expect(renders[1][0].testObj).toEqual({ test: false })
        expect(renders[1][1].testObj).toEqual({ test: 1 })

        act(() => {
            injectedState.testObj = { test: 2 }
        })

        // Rerender when injected state changes
        expect(renders.length).toBe(3)
        expect(renders[2][0].testObj).toEqual({ test: false })
        expect(renders[2][1].testObj).toEqual({ test: 2 })

        act(() => {
            injectedState.testObj.test = 3
        })

        // No rerender when modifying a nested property of injected state
        expect(renders.length).toBe(3)
        expect(renders[2][0].testObj).toEqual({ test: false })
        expect(renders[2][1].testObj).toEqual({ test: 2 })
    })

    it('should rerender only for observable properties', async () => {
        class InjectedTestState {
            test3 = 3
            test4 = 4 // not observable
        }

        class TestState {
            test1 = 1
            test2 = 2

            injected = InjectModel(InjectedTestState, {
                observeProps: { test3: true }
            })
        }

        let rendersCount = 0

        const Component = () => {
            const [stateProxySnapshot] = useModel(TestState, {
                observeProps: { test1: true, injected: ['test3'] }
            })

            rendersCount++

            return <>{stateProxySnapshot.test2}</>
        }

        render(<Component />)

        const [state] = StateManager.getOrCreateState(TestState)
        const [injectedState] = StateManager.getOrCreateState(InjectedTestState)

        expect(rendersCount).toBe(1)

        act(() => {
            state.test1 = 5
        })

        // Rerender when observable property changes
        expect(rendersCount).toBe(2)

        act(() => {
            state.test2 = 6
        })

        // Rerender when observable property changes
        // This occurs because state.test2 is considered observable
        // due to being retrieved from the state object
        expect(rendersCount).toBe(3)

        act(() => {
            injectedState.test3 = 7
        })

        // Rerender when observable injected property changes
        expect(rendersCount).toBe(4)

        act(() => {
            injectedState.test4 = 8 // not observable
        })

        // No rerender when non-observable injected property changes
        expect(rendersCount).toBe(4)
    })

    it('should apply state updates via the updateState callback', async () => {
        class TestState {
            test = 1
        }

        const renders: any[] = []

        const Component = () => {
            const [state, updateState] = useModel(TestState)

            renders.push(state.test)

            return (
                <>
                    <button onClick={() => updateState({ test: 2 })}>click</button>
                </>
            )
        }

        render(<Component />)

        expect(renders.length).toBe(1)

        act(() => {
            fireEvent.click(screen.getByText('click'))
        })

        expect(renders.length).toBe(2)
        expect(renders[1]).toEqual(2)
    })

    it('should support multiple keyed state instances', async () => {
        class TestState {
            test = 1

            getStateKey() {
                return getKey(this)
            }
        }

        const renders: any[] = []

        const key1 = 'k1'
        const key2 = 'k2'

        const Component = () => {
            const [state1] = useModel(TestState, { key: key1 })
            const [state2] = useModel(TestState, { key: key2 })

            renders.push([
                state1.getStateKey(),
                state2.getStateKey(),
                state1.test,
                state2.test,
                state1,
                state2
            ])

            return <></>
        }

        render(<Component />)

        const [state1] = StateManager.getOrCreateState(TestState, {
            key: key1
        })
        const [state2] = StateManager.getOrCreateState(TestState, {
            key: key2
        })

        expect(renders.length).toBe(1)
        expect(renders[0][0]).toBe(key1)
        expect(renders[0][1]).toBe(key2)
        expect(renders[0][2]).toBe(1)
        expect(renders[0][3]).toBe(1)

        act(() => {
            state1.test = 2
            state2.test = 3
        })

        expect(renders.length).toBe(2)
        expect(renders[1][0]).toBe(key1)
        expect(renders[1][1]).toBe(key2)
        expect(renders[1][2]).toBe(2)
        expect(renders[1][3]).toBe(3)
        expect(renders[1][4]).not.toEqual(renders[0][4])
        expect(renders[1][5]).not.toEqual(renders[0][5])
    })

    it('should respect StateStoreProvider defaults', async () => {
        class TestState {
            test = 1

            getStateStore() {
                return getStore(this)
            }
        }

        const renders: any[] = []

        const store1 = new StateStore()
        const store2 = new StateStore()

        const Component = () => {
            // Use store1 from context and store2 directly
            const store1 = useStateStore()
            const [state1] = useModel(TestState, { store: store1 })
            const [state2] = useModel(TestState, { store: store2 })
            const [state1Again] = useModel(TestState) // StateStoreProvider change default store

            renders.push([
                state1.getStateStore(),
                state2.getStateStore(),
                state1Again.getStateStore(),
                state1.test,
                state2.test,
                state1Again.test
            ])

            return <></>
        }

        render(
            <StateStoreProvider store={store1}>
                <Component />
            </StateStoreProvider>
        )

        const [state1] = StateManager.getOrCreateState(TestState, { store: store1 })
        const [state2] = StateManager.getOrCreateState(TestState, { store: store2 })

        expect(renders.length).toBe(1)
        expect(renders[0][0]).toBe(store1)
        expect(renders[0][1]).toBe(store2)
        expect(renders[0][2]).toBe(store1)
        expect(renders[0][3]).toBe(1)
        expect(renders[0][4]).toBe(1)
        expect(renders[0][5]).toBe(1)

        act(() => {
            state1.test = 2
            state2.test = 3
        })

        expect(renders.length).toBe(2)
        expect(renders[1][0]).toBe(store1)
        expect(renders[1][1]).toBe(store2)
        expect(renders[1][2]).toBe(store1)
        expect(renders[1][3]).toBe(2)
        expect(renders[1][4]).toBe(3)
        expect(renders[1][5]).toBe(2)
    })

    it('should rerender when state methods mutate values', async () => {
        class TestState {
            test = 1

            setNewValue(value: number) {
                this.test = value
            }
        }

        const renders: any[] = []

        const Component = () => {
            const [state] = useModel(TestState)

            renders.push(state.test)

            return (
                <>
                    <button onClick={() => state.setNewValue(2)}>click</button>
                </>
            )
        }

        render(<Component />)

        const [state] = StateManager.getOrCreateState(TestState)

        expect(renders.length).toBe(1)

        act(() => {
            fireEvent.click(screen.getByText('click'))
        })

        expect(renders.length).toBe(2)
        expect(renders[1]).toBe(2)

        act(() => {
            state.setNewValue(3)
        })

        expect(renders.length).toBe(3)
        expect(renders[2]).toBe(3)
    })

    it('should keep snapshots isolated from live mutations', async () => {
        class TestState {
            test = 1
        }

        let firstStateSnapshot: any

        const Component = () => {
            const [state] = useModel(TestState)

            if (!firstStateSnapshot) {
                firstStateSnapshot = state
            }

            return <></>
        }

        render(<Component />)

        const [state] = StateManager.getOrCreateState(TestState)

        act(() => {
            state.test = 2
        })

        expect(firstStateSnapshot.test).toBe(1)
    })
})
