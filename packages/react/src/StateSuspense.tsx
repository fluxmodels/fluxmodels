import React from 'react'
import { StateProxyManager, isPromiseLike, type State, type StateProxy } from '@fluxmodels/core'

import { triggerReactSuspense } from './utils'

const StateSuspensePromisesSymbol = Symbol.for('[[StateSuspensePromises]]')

export type UseSuspenseArgs = {
    // If true, only the component that called this method will be re-rendered.
    // If false, all components using this state will be re-rendered.
    localRerender?: boolean
}

/**
 * UseSuspense is a decorator or wrapper for methods that integrates with React Suspense.
 * It triggers a re-render before method execution and after obtaining the result.
 *
 * When the wrapped method returns a promise:
 * 1. React Suspense is activated, showing fallback content.
 * 2. Once the promise resolves, the component re-renders with the result.
 *
 * @param fn - The function to wrap. If provided, returns a new wrapped function.
 *             If not provided, acts as a method decorator.
 * @param args - Configuration options for the decorator.
 * @returns A decorator function or a wrapped function.
 *
 * @example
 * // As a method decorator
 * class UserModel {
 *     @UseSuspense()
 *     async fetchUserData() {
 *         await new Promise(resolve => setTimeout(resolve, 1000));
 *         return { name: 'John Doe', age: 30 };
 *     }
 * }
 *
 *
 * // As a function wrapper
 * const UserModel = {
 *     fetchUserData: UseSuspense(async () => {
 *         await new Promise(resolve => setTimeout(resolve, 1000));
 *         return { name: 'Jane Doe', age: 28 };
 *     })
 * }
 *
 *
 * // In a React component
 * const UserComponent = () => {
 *     const [user] = useModel(UserModel);
 *
 *     // button click will trigger React Suspense
 *     return <div>
 *         <p>{user.name}</p>
 *         <button onClick={user.fetchUserData}>Fetch User Data</button>
 *     </div>
 * }
 *
 * const App = () => {
 *     return <Suspense fallback={<div>Loading...</div>}>
 *         <UserComponent />
 *     </Suspense>
 * }
 *
 */

/**
 * Wraps a function to integrate with React Suspense, or decorates a class method.
 *
 * When the wrapped function returns a promise, a suspense boundary is engaged until
 * it settles, and then a re-render is triggered.
 *
 * @param fn - Function to wrap (wrapper form).
 * @param args - Optional configuration (e.g., local rerendering).
 * @returns The wrapped function that drives Suspense when returning a promise.
 */
export function UseSuspense<T extends (...args: any[]) => any>(fn: T, args?: UseSuspenseArgs): T

/**
 * Method decorator form of {@link UseSuspense}.
 *
 * @param args - Optional configuration (e.g., local rerendering).
 * @returns A method decorator that wraps the target method for Suspense.
 */
export function UseSuspense(args?: UseSuspenseArgs): MethodDecorator

export function UseSuspense(fnOrArgs?: any, useSuspenseArgs?: UseSuspenseArgs) {
    // Wrap function, that collects promises and rerenders the component when the promise is resolved
    function wrap(origFunc: (...args: any[]) => any, useSuspenseArgs?: UseSuspenseArgs) {
        return function (this: State | StateProxy, ...args: any[]) {
            const result = origFunc.apply(this, args)

            if (isPromiseLike(result)) {
                let suspensePromises = this[StateSuspensePromisesSymbol]

                if (!suspensePromises) {
                    suspensePromises = this[StateSuspensePromisesSymbol] = new Set<any>()
                }

                const removePromise = () => {
                    suspensePromises.delete(result)
                }

                suspensePromises.add(result)

                // trigger rerender of the component

                if (useSuspenseArgs?.localRerender) {
                    if (StateProxyManager.isStateProxy(this)) {
                        const stateProxyManager = StateProxyManager.instance(this as StateProxy)
                        const rerender = stateProxyManager.mountContext.rerender

                        rerender?.()
                    }
                } else {
                    for (const stateProxy of StateProxyManager.getMountedStateProxies(this)) {
                        const stateProxyManager = StateProxyManager.instance(stateProxy)
                        const rerender = stateProxyManager.mountContext.rerender

                        rerender?.()
                    }
                }

                result.finally(removePromise)
            }

            return result
        }
    }

    if (fnOrArgs instanceof Function) {
        // like a function wrapper
        return wrap(fnOrArgs, useSuspenseArgs)
    }

    // like a MethodDecorator
    return (_target: object, _propName: string, descriptor: TypedPropertyDescriptor<any>) => {
        const origFunc = descriptor.value

        descriptor.value = wrap(origFunc, fnOrArgs)
    }
}

/**
 * Triggers React Suspense for any pending promises collected on a state proxy.
 *
 * @param stateProxy - A state proxy returned by FluxModels.
 */
export function waitUseSuspensePromises(stateProxy: StateProxy, useSuspenseDepth: number = -1) {
    const _waitUseSuspensePromises = (
        stateProxy: StateProxy,
        visitedStateProxies: Set<StateProxy>,
        useSuspenseDepth: number
    ) => {
        if (useSuspenseDepth === 0) {
            return
        }

        if (visitedStateProxies.has(stateProxy)) {
            return
        }

        visitedStateProxies.add(stateProxy)

        const stateProxyManager = StateProxyManager.instance(stateProxy)

        for (const promise of stateProxy[StateSuspensePromisesSymbol] ?? []) {
            triggerReactSuspense(promise, false)
        }

        for (const injectedStateProxy of stateProxyManager.childrenStateProxyMap.values()) {
            _waitUseSuspensePromises(injectedStateProxy, visitedStateProxies, useSuspenseDepth - 1)
        }
    }

    _waitUseSuspensePromises(stateProxy, new Set(), useSuspenseDepth)
}

/**
 * A wrapper for React Suspense that triggers React Suspense for any pending promises collected on a state proxy (marked with @UseSuspense).
 *
 * @param props - The arguments for the wrapper.
 * @param props.state - The state proxy to trigger React Suspense for.
 * @param props.checkDepth - The depth of injected state proxies to check for pending promises.
 * @param props.fallback - The fallback content to show when the state proxy is pending.
 * @param props.children - The children to show when the state proxy is resolved.
 * @param props.name - The name of the state proxy.
 *
 * @returns A React Suspense component that triggers React Suspense for any pending promises collected on a state proxy.
 */
export function StateSuspense(props: {
    state: StateProxy
    checkDepth?: number
    fallback?: React.ReactNode
    children?: React.ReactNode
    name?: string
}) {
    return (
        <React.Suspense fallback={props.fallback}>
            <StateSuspenseChildComponent state={props.state} checkDepth={props.checkDepth}>
                {props.children}
            </StateSuspenseChildComponent>
        </React.Suspense>
    )
}

function StateSuspenseChildComponent(props: {
    state: StateProxy
    checkDepth?: number
    children?: React.ReactNode
}) {
    waitUseSuspensePromises(props.state, props.checkDepth ?? -1)

    return props.children
}
