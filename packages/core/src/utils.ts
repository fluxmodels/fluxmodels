import { StateManager } from './StateManager'
import { type StateProxyType } from './StateProxyManager'

export const isPromiseLike = <T>(x: T): boolean =>
    typeof (x as any)?.then === 'function' &&
    typeof (x as any)?.catch === 'function' &&
    typeof (x as any)?.finally === 'function'

export type LoadHandlerType<T> = (
    this: T,
    isLoading: boolean,
    targetObject: T,
    ...args: any[]
) => any

type DecoratorType<T> = (
    target: T,
    propName: string,
    descriptor: TypedPropertyDescriptor<any>
) => void

/**
 * Decorator/Wrapper for methods that accepts a callback and invokes it before the method execution and after obtaining the result (return). If the method is asynchronous, the callback will be called when the promise is fulfilled.
 *
 * @param handlerOrHandlerName - The callback function
 * @returns The decorator function.
 *
 * @example
 * ```ts
 * class UserModel {
 *     loadingHandler(isLoading: boolean, targetObject: UserModel) {
 *         console.log('loadingHandler', isLoading, targetObject)
 *     }
 *
 *     @UseLoader('loadingHandler')
 *     getUser() {
 *         // do something
 *     }
 * }
 *
 * // or
 *
 *
 * const UseModel = {
 *     loadingHandler: (isLoading: boolean, targetObject: UserModel) {
 *         console.log('loadingHandler', isLoading, targetObject)
 *     },
 *
 *     getUser: UseLoader('loadingHandler')(async () => {
 *         // do something
 *     })
 * }
 * ```
 */
export function UseLoader<
    T,
    K extends keyof T = keyof T,
    H extends LoadHandlerType<T> = LoadHandlerType<T>
>(
    handlerOrHandlerName: H | K
): H extends LoadHandlerType<T>
    ? DecoratorType<T>
    : T[K] extends LoadHandlerType<T>
      ? DecoratorType<T>
      : 'handler is of a different type than (isLoading: boolean, targetObject: T) => any' {
    return ((target: T, _propName: string, descriptor: TypedPropertyDescriptor<any>) => {
        const origFunc = descriptor.value

        const handler =
            typeof handlerOrHandlerName === 'string'
                ? (target[handlerOrHandlerName] as LoadHandlerType<T>)
                : (handlerOrHandlerName as LoadHandlerType<T>)

        if (!handler) {
            return origFunc
        }

        descriptor.value = function (this: any, ...args: any[]) {
            // TODO: OR setTimeout(() => handler.call(this, true, this)) ?
            handler.call(this, true, this)

            const turnOffLoading = () => handler.call(this, false, this)

            try {
                const result = origFunc.apply(this, ...args)

                if (isPromiseLike(result)) {
                    result.then(turnOffLoading, turnOffLoading)
                } else {
                    setTimeout(turnOffLoading)
                }

                return result
            } catch (e) {
                setTimeout(turnOffLoading)
                throw e
            }
        }
    }) as any
}

/**
 * Returns the key of the state.
 *
 * @example
 * ```ts
 * class UserModel {
 *     username = '',
 *
 *     get key() {
 *         return getKey(this)
 *     }
 * }
 *
 * const userState = StateManager.createState(UserModel, { key: 1 })
 * console.log(userState.key) // 1
 * ```
 *
 * @param state - The state object.
 * @returns The key of the state.
 */
export function getKey(state: Record<keyof any, any>) {
    return StateManager.instance(state as StateProxyType).key
}

/**
 * Returns the store of the state.
 *
 * Example:
 * ```ts
 * class UserModel {
 *     username = '',
 *
 *     get store() {
 *         return getStore(this)
 *     }
 * }
 *
 * const userState = StateManager.createState(UserModel)
 * console.log(userState.store) // StateStore.defaultStore
 * ```
 *
 * @param state - The state object.
 * @returns The store of the state.
 */
export function getStore(state: Record<keyof any, any>) {
    return StateManager.instance(state as StateProxyType).store
}
