import React, { Suspense } from 'react'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom'

import {
    useModel,
    UseSuspense,
    StateManager,
    InjectModel,
    StateStore,
    StateSuspense,
    OnInit
} from '../../src'

describe('Suspense', () => {
    beforeEach(() => {
        StateStore.defaultStore.clearStore()
    })

    it('should suspend around async work decorated with UseSuspense', async () => {
        let resolveInjectedAction: any
        let resolveAction: any
        let resolveInjectedOnInit: any
        let resolveOnInit: any

        class InjectedTestState {
            test = 0

            @OnInit()
            @UseSuspense()
            async onInit() {
                this.test = -1
                await new Promise((resolve) => (resolveInjectedOnInit = resolve))
            }

            @UseSuspense()
            async action() {
                this.test = -2
                await new Promise((resolve) => (resolveInjectedAction = resolve))
                this.test = -3
            }
        }

        class TestState {
            test = 1

            injected = InjectModel(InjectedTestState)

            @OnInit()
            @UseSuspense()
            async onInit() {
                this.test = 2
                await new Promise((resolve) => (resolveOnInit = resolve))
            }

            @UseSuspense()
            noAsync() {
                this.test = 3
            }

            @UseSuspense()
            async noAction() {}

            @UseSuspense()
            async action() {
                this.test = 4
                await new Promise((resolve) => (resolveAction = resolve))
                this.test = 5
            }
        }

        const renders: any[] = []

        const Component = () => {
            const [state] = useModel(TestState)

            renders.push([state.test, state.injected.test])

            return <></>
        }

        render(
            <Suspense fallback="loading">
                <Component />
            </Suspense>
        )

        const [state] = StateManager.getOrCreateState(TestState)
        const [injectedState] = StateManager.getOrCreateState(InjectedTestState)

        // Initially, the component is suspended due to onInit methods
        expect(renders.length).toBe(0)
        expect(screen.getByText('loading')).toBeInTheDocument()

        // Resolve TestState's onInit
        await act(async () => {
            resolveOnInit()
        })

        // Component is still suspended due to InjectedTestState's onInit
        expect(renders.length).toBe(0)
        expect(screen.getByText('loading')).toBeInTheDocument()

        // Resolve InjectedTestState's onInit
        await act(async () => {
            resolveInjectedOnInit()
        })

        // Component renders after both onInit methods are resolved
        expect(renders.length).toBe(1)
        expect(renders[0]).toEqual([2, -1])

        // Test non-async method with UseSuspense
        await act(async () => {
            state.noAsync()
        })

        expect(renders.length).toBe(2)
        expect(renders[1]).toEqual([3, -1])

        // Test async method without side effects
        await act(async () => {
            await state.noAction()
        })

        expect(renders.length).toBe(3)
        expect(renders[2]).toEqual([3, -1])

        // Test async method with UseSuspense
        await act(async () => {
            state.action()
        })

        // Component is suspended during the async operation
        expect(renders.length).toBe(3)
        expect(screen.getByText('loading')).toBeInTheDocument()

        // Resolve the async operation
        await act(async () => {
            resolveAction()
        })

        expect(renders.length).toBe(4)
        expect(renders[3]).toEqual([5, -1])

        // Test async method on injected state
        await act(async () => {
            injectedState.action()
        })

        expect(renders.length).toBe(4)
        expect(screen.getByText('loading')).toBeInTheDocument()

        // Resolve the injected state's async operation
        await act(async () => {
            resolveInjectedAction()
        })

        expect(renders.length).toBe(5)
        expect(renders[4]).toEqual([5, -3])
    })

    it('should limit suspense traversal depth', async () => {
        let resolveGrandChildFetch: () => void = () => {}

        class GrandChildState {
            value = 0

            @UseSuspense()
            async fetch() {
                this.value = -1
                await new Promise<void>((resolve) => {
                    resolveGrandChildFetch = resolve
                })
                this.value = 1
            }
        }

        class ChildState {
            grandChild = InjectModel(GrandChildState)
        }

        class ParentState {
            child = InjectModel(ChildState)
        }

        const ComponentWithSuspense = (props: {
            checkDepth: number
            testId: string
            fallbackId: string
        }) => {
            const [state] = useModel(ParentState, { useSuspenseDepth: 0 })

            return (
                <StateSuspense
                    state={state}
                    checkDepth={props.checkDepth}
                    fallback={<div data-testid={props.fallbackId}>loading</div>}
                >
                    <div data-testid={props.testId}>{state.child.grandChild.value}</div>
                </StateSuspense>
            )
        }

        render(
            <>
                <ComponentWithSuspense
                    checkDepth={1}
                    testId="suspense-depth1-value"
                    fallbackId="suspense-depth1-fallback"
                />
                <ComponentWithSuspense
                    checkDepth={2}
                    testId="suspense-depth2-value"
                    fallbackId="suspense-depth2-fallback"
                />
                <ComponentWithSuspense
                    checkDepth={3}
                    testId="suspense-depth3-value"
                    fallbackId="suspense-depth3-fallback"
                />
            </>
        )

        const [grandChildState] = StateManager.getOrCreateState(GrandChildState)

        await act(async () => {
            grandChildState.fetch()
        })

        expect(screen.queryByTestId('suspense-depth1-fallback')).toBeNull()
        expect(screen.queryByTestId('suspense-depth2-fallback')).toBeNull()
        expect(await screen.findByTestId('suspense-depth3-fallback')).toBeInTheDocument()

        await act(async () => {
            resolveGrandChildFetch()
        })

        expect(screen.queryByTestId('suspense-depth3-fallback')).toBeNull()
        expect(screen.getByTestId('suspense-depth1-value')).toHaveTextContent('1')
        expect(screen.getByTestId('suspense-depth2-value')).toHaveTextContent('1')
        expect(screen.getByTestId('suspense-depth3-value')).toHaveTextContent('1')
    })

    it('should suspend nested injections up to useSuspenseDepth', async () => {
        let resolveGrandChildFetch: () => void = () => {}

        class GrandChildState {
            value = 0

            @UseSuspense()
            async fetch() {
                this.value = -1
                await new Promise<void>((resolve) => {
                    resolveGrandChildFetch = resolve
                })
                this.value = 1
            }
        }

        class ChildState {
            grandChild = InjectModel(GrandChildState)
        }

        class ParentState {
            child = InjectModel(ChildState)
        }

        const Depth1Component = () => {
            const [state] = useModel(ParentState, { useSuspenseDepth: 1 })

            return <div data-testid="depth1-value">{state.child.grandChild.value}</div>
        }

        const Depth2Component = () => {
            const [state] = useModel(ParentState, { useSuspenseDepth: 2 })

            return <div data-testid="depth2-value">{state.child.grandChild.value}</div>
        }

        const Depth3Component = () => {
            const [state] = useModel(ParentState, { useSuspenseDepth: 3 })

            return <div data-testid="depth3-value">{state.child.grandChild.value}</div>
        }

        render(
            <>
                <Suspense fallback={<div data-testid="depth1-fallback">depth1 loading</div>}>
                    <Depth1Component />
                </Suspense>
                <Suspense fallback={<div data-testid="depth2-fallback">depth2 loading</div>}>
                    <Depth2Component />
                </Suspense>
                <Suspense fallback={<div data-testid="depth3-fallback">depth3 loading</div>}>
                    <Depth3Component />
                </Suspense>
            </>
        )

        const [grandChildState] = StateManager.getOrCreateState(GrandChildState)

        await act(async () => {
            grandChildState.fetch()
        })

        expect(screen.queryByTestId('depth1-fallback')).toBeNull()
        expect(screen.queryByTestId('depth2-fallback')).toBeNull()
        expect(await screen.findByTestId('depth3-fallback')).toBeInTheDocument()

        await act(async () => {
            resolveGrandChildFetch()
        })

        expect(screen.queryByTestId('depth3-fallback')).toBeNull()
        expect(screen.getByTestId('depth1-value')).toHaveTextContent('1')
        expect(screen.getByTestId('depth2-value')).toHaveTextContent('1')
        expect(screen.getByTestId('depth3-value')).toHaveTextContent('1')
    })

    it('should handle recursive injected states with useSuspenseDepth', async () => {
        let resolveChildFetch: () => void = () => {}

        class ParentState {
            childKey = 'child'
            child = InjectModel(ChildState, { keyFrom: 'childKey' })
        }

        class ChildState {
            parentKey = 'parent'
            value = 0

            parent = InjectModel(ParentState, { keyFrom: 'parentKey' })

            @UseSuspense()
            async fetch() {
                this.value = -1
                await new Promise<void>((resolve) => {
                    resolveChildFetch = resolve
                })
                this.value = 1
            }
        }

        StateManager.getOrCreateState(ParentState, { key: 'parent' })
        StateManager.getOrCreateState(ChildState, { key: 'child' })

        const Component = () => {
            const [state] = useModel(ParentState, { key: 'parent', useSuspenseDepth: 4 })

            return <div data-testid="recursive-value">{state.child.value}</div>
        }

        render(
            <Suspense fallback={<div data-testid="recursive-fallback">loading</div>}>
                <Component />
            </Suspense>
        )

        const [childState] = StateManager.getOrCreateState(ChildState, { key: 'child' })

        await act(async () => {
            childState.fetch()
        })

        expect(await screen.findByTestId('recursive-fallback')).toBeInTheDocument()

        await act(async () => {
            resolveChildFetch()
        })

        expect(screen.queryByTestId('recursive-fallback')).toBeNull()
        expect(screen.getByTestId('recursive-value')).toHaveTextContent('1')
    })
})
