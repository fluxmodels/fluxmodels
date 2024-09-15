import {
    isClass,
    MetaType,
    LazyMetaTypeImpl,
    type MetaTypeArgsType,
    type SerializerArgsType
} from 'metatyper'

import { StateStore } from './StateStore'
import { StateManager, type StateType } from './StateManager'
import {
    StateProxyManager,
    type StateProxyType,
    type StateProxyArgsType
} from './StateProxyManager'

export const INJECT_KEY = Symbol.for('[[InjectKey]]')
export const INJECT_STORE = Symbol.for('[[InjectStore]]')

/**
 * This is a type that is used to indicate that a state is injected.
 *
 * @template T - The type of the state.
 */
export type InjectedType<T extends Record<keyof any, any>> = T & { _injected?: true }

type _InjectedStateProxyArgsType<T extends Record<keyof any, any> = Record<keyof any, any>> = Omit<
    StateProxyArgsType<T>,
    'initInjectedStates' | 'injectedStateProxyGlobalMap'
> & {
    key?: any
    store?: StateStore | typeof INJECT_STORE
    keyEqual?: (existsKey: any, searchKey: any) => boolean
}

/**
 * This is the type of the arguments for the InjectModel function.
 *
 * Can be a static value or a function that takes the state and the property name and returns the value.
 *
 * @template T - The type of the state.
 */
export type InjectedStateProxyArgsType<T extends Record<keyof any, any> = Record<keyof any, any>> =

        | _InjectedStateProxyArgsType<T>
        | ((state: any, propName: string) => _InjectedStateProxyArgsType<T>)

/**
 * This is the type of reference to an injected model. Used to create a get or create a new state.
 *
 * @template T - The type of the state.
 */
export type InjectedModelRefType<T extends Record<keyof any, any> = Record<keyof any, any>> = {
    readonly model: (new (...args: any[]) => T) | ((...args: any[]) => T) | T
    readonly args:
        | InjectedStateProxyArgsType<T>
        | ((
              stateProxy: StateType<T> | StateProxyType<T>,
              propName: string
          ) => InjectedStateProxyArgsType<T>)
}

/**
 * This is the implementation of the InjectModel metatype (metatyper).
 * This class contains the logic for creating a new state and a state proxy.
 *
 * Generally this class add GET handler to states.
 * When you access property of a state (or state proxy) with this metatype, the metatype will call serialize method of the metatype.
 *
 * @template T - The type of the state.
 */
export class InjectModelImpl extends LazyMetaTypeImpl {
    protected override prepareMetaTypeArgs(metaTypeArgs: MetaTypeArgsType) {
        return { ...metaTypeArgs, name: 'InjectedModel' }
    }

    protected override configure(): void {
        this.builtinSerializers.push({
            name: 'InjectModel',
            serialize: (serializerArgs: SerializerArgsType) => {
                try {
                    const propName = serializerArgs.propName
                    const stateOrStateProxy = serializerArgs.targetObject as
                        | StateType
                        | StateProxyType

                    if (!stateOrStateProxy || !propName || typeof propName === 'symbol') return

                    const injectedModelRef = this.getSubType() as InjectedModelRefType

                    let injectedArgs = (injectedModelRef.args as _InjectedStateProxyArgsType) ?? {}

                    if (injectedArgs instanceof Function) {
                        injectedArgs = injectedArgs(stateOrStateProxy, propName) ?? {}
                    }

                    if (injectedArgs.key === INJECT_KEY) {
                        injectedArgs.key = StateManager.instance(
                            stateOrStateProxy as StateType
                        )?.key
                    }

                    if (injectedArgs.store === INJECT_STORE) {
                        injectedArgs.store = StateManager.instance(
                            stateOrStateProxy as StateType
                        )?.store
                    }

                    let model = injectedModelRef.model

                    if (typeof model === 'function' && !isClass(model)) {
                        model = (model as (...args: any[]) => any)(stateOrStateProxy, propName)
                    }

                    if (typeof model !== 'object' && typeof model !== 'function') {
                        if (model === null) return null

                        return undefined
                    }

                    const [injectedState, isNew] = StateManager.getOrCreateState<
                        Record<keyof any, any>
                    >(model, {
                        key: injectedArgs.key,
                        keyEqual: injectedArgs.keyEqual,
                        store: injectedArgs.store
                    })

                    if (!StateProxyManager.isStateProxy(stateOrStateProxy)) {
                        return injectedState
                    }

                    const stateProxy = stateOrStateProxy as StateProxyType
                    const stateProxyManager = StateProxyManager.instance(stateProxy)

                    if (!isNew) {
                        const cachedProxy =
                            stateProxyManager.injectedStateProxyMap.get(injectedModelRef) ||
                            stateProxyManager.injectedStateProxyGlobalMap.get(injectedModelRef)

                        if (cachedProxy) {
                            return cachedProxy
                        }
                    }

                    const observableProps = stateProxyManager.observableProps ?? {}

                    const observeInjectedStateProps =
                        typeof observableProps[propName] === 'object'
                            ? (observableProps[propName] as object)
                            : undefined

                    const injectedStateProxy = stateProxyManager.Cls.createStateProxy(
                        injectedState,
                        {
                            observeProps: observeInjectedStateProps,
                            autoResolveObservableProps: injectedArgs.autoResolveObservableProps,

                            injectedStateProxyGlobalMap:
                                stateProxyManager.injectedStateProxyGlobalMap,
                            initInjectedStates: (stateProxy: any) => {
                                stateProxyManager.injectedStateProxyGlobalMap.set(
                                    injectedModelRef,
                                    stateProxy
                                )
                                stateProxyManager.injectedStateProxyMap.set(
                                    injectedModelRef,
                                    stateProxy
                                )

                                Object.entries(stateProxy)
                            }
                        }
                    )

                    return injectedStateProxy
                } catch (e) {
                    console.error(e)

                    throw e
                }
            }
        })
    }

    override metaTypeValidatorFunc() {
        return false
    }

    override toString() {
        return `${this.name}<${this.getSubType().model}>`
    }
}

// ======================================================================================================================
// ===================================================== public api =====================================================
// ======================================================================================================================

/**
 * Creates a dynamic property that returns a state (either new or from the store).
 * When the property is accessed, it calls StateManager.getOrCreateState() with the provided model and arguments.
 *
 * @param model - The model of the state. Can be a class, an object, or a function that returns a class or object.
 * @param args - Optional arguments for state creation or retrieval. Can be function that returns the args.
 * @template T - The type of the state.
 *
 * @example
 * Basic usage:
 *
 * ```ts
 * class UserProfile {
 *   name = ''
 * }
 *
 * class UserWithProfile {
 *   profile = InjectModel(UserProfile)
 * }
 * ```
 *
 * @example
 * Usage with dynamic model selection:
 *
 * ```ts
 * class UserProfile {
 *   name = ''
 * }
 *
 * class AdminProfile {
 *   name = ''
 *   adminRole = 'default'
 * }
 *
 * class UserWithProfile {
 *   userType = 'default'
 *
 *   profile = InjectModel(
 *     (state: UserWithProfile) => state.userType === 'admin' ? AdminProfile : UserProfile,
 *     (state: UserWithProfile) => ({ key: `${state.userType}:${getKey(state)}` })
 *   )
 * }
 * ```
 *
 * @example
 * State management and reactivity:
 *
 * ```ts
 * const [userState] = StateManager.getOrCreateState(UserWithProfile)
 * const userStateProxy = StateProxyManager.createStateProxy(userState)
 *
 * userStateProxy.mount(function rerender() {
 *   // This function will be called when userState or its injected states change
 *   console.log('User state updated')
 * })
 *
 * // This is similar to a `useModel` hook in `@fluxmodels/react`
 * // In a React component, userStateProxy.mount would be called during component mounting
 * // The rerender function passed to mount will be triggered on state changes,
 * // causing the component to re-render and reflect the updated state
 *
 * const profileState = userState.profile
 * profileState.name = 'John' // This will trigger the mounted function above
 * ```
 */
export function InjectModel<T extends object>(
    model: new (...args: any[]) => T,
    args?: InjectedStateProxyArgsType<T>
): InjectedType<T>

export function InjectModel<T extends object>(
    model: (state: any, propName: string) => new (...args: any[]) => T,
    args?: InjectedStateProxyArgsType<T>
): InjectedType<T>

export function InjectModel<
    C extends
        | Record<keyof any, any>
        | Record<keyof any, any>[]
        | (new (...args: any[]) => any)
        | (new (...args: any[]) => any)[]
        | undefined
        | null
>(
    model: (state: any, propName: string) => C,
    args?: InjectedStateProxyArgsType<C extends new (...args: any[]) => any ? InstanceType<C> : C>
): InjectedType<C extends new (...args: any[]) => any ? InstanceType<C> : C>

export function InjectModel<T>(
    model: (state: any, propName: string) => T,
    args?: T extends object ? InjectedStateProxyArgsType<T> : any
): T extends object ? InjectedType<T> : unknown

export function InjectModel<T extends object>(
    model: T,
    args?: InjectedStateProxyArgsType<T>
): T extends object ? InjectedType<T> : unknown

export function InjectModel(model: any, args?: any) {
    return MetaType(InjectModelImpl, {
        subType: {
            model,
            args: args ?? {}
        }
    })
}