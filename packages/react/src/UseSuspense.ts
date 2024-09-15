import {
    StateProxyManager,
    isPromiseLike,
    type StateProxyType,
    type StateType
} from '@fluxmodels/core'

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

export function UseSuspense<T extends (...args: any[]) => any>(fn: T, args?: UseSuspenseArgs): T

export function UseSuspense(args?: UseSuspenseArgs): MethodDecorator

export function UseSuspense(fnOrArgs?: any, useSuspenseArgs?: UseSuspenseArgs) {
    // Wrap function, that collects promises and rerenders the component when the promise is resolved
    function wrap(origFunc: (...args: any[]) => any, useSuspenseArgs?: UseSuspenseArgs) {
        return function (this: StateType | StateProxyType, ...args: any[]) {
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
                        const stateProxyManager = StateProxyManager.instance(
                            this as StateProxyType
                        )
                        const rerender = stateProxyManager.context.rerender

                        rerender?.()
                    }
                } else {
                    for (const stateProxy of StateProxyManager.getMountedStateProxies(this)) {
                        const stateProxyManager = StateProxyManager.instance(stateProxy)
                        const rerender = stateProxyManager.context.rerender

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

export function handleUseSuspensePromises<T extends Record<keyof any, any>>(
    stateProxy: StateProxyType<T>
) {
    for (const promise of stateProxy[StateSuspensePromisesSymbol] ?? []) {
        triggerReactSuspense(promise, false)
    }
}
