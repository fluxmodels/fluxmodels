import { InjectedType } from './InjectModel'
import { StateDefaultKeySymbol } from './StateStore'
import {
    OnChange,
    OnMount,
    OnUnmount,
    type OnChangeHandlerArgsType,
    type OnChangeHandlerType
} from './events'
import { StateManager, type StateType } from './StateManager'
import { InjectedArrayType } from './InjectModelArray'

const StateReferenceSymbol = Symbol.for('[[StateReference]]')
const StateProxyManagerSymbol = Symbol.for('[[StateProxyManager]]')
const StateProxySnapshotSymbol = Symbol.for('[[StateProxySnapshot]]')

export type StateProxyType<T extends Record<keyof any, any> = Record<keyof any, any>> =
    StateType<T> & {
        [StateReferenceSymbol]: StateType<T>
        [StateProxyManagerSymbol]: StateProxyManager<T>
    }

type BoundMethodType<T extends (...args: any[]) => any, C extends object> = (
    this: C,
    ...args: Parameters<T>
) => ReturnType<T>

export type StateSnapshotType<T extends Record<keyof any, any>> = {
    readonly [key in keyof T]: Required<T[key]> extends Required<InjectedArrayType<infer U>>
        ? { readonly [k in keyof U]: StateSnapshotType<U[k]> }
        : Required<T[key]> extends Required<InjectedType<infer U>>
          ? StateSnapshotType<U>
          : T[key] extends (...args: any[]) => any
            ? BoundMethodType<T[key], T>
            : T[key]
}

export type ObservablePropsArgsType<T extends Record<keyof any, any>> =
    | Iterable<keyof T>
    | {
          [K in keyof T]?: Required<T[K]> extends Required<InjectedType<T[K]>>
              ? ObservablePropsArgsType<T[K]>
              : boolean
      }

export type ObservablePropsType = {
    [key: string]: ObservablePropsType | boolean
}

export type StateProxyArgsType<T extends Record<keyof any, any>> = {
    autoResolveObservableProps?: boolean
    observeProps?: ObservablePropsArgsType<T>

    initInjectedStates?: (stateProxy: StateProxyType) => void
    injectedStateProxyMap?: Map<StateType, StateProxyType>
}

/**
 * StateProxyManager is responsible for managing the lifecycle of state proxies.
 *
 * A State Proxy is a wrapper around a state object that enables observation and reactivity.
 * It serves three main purposes:
 * 1. Marking properties as observable
 * 2. Managing re-renders through mount/unmount operations
 * 3. Creating snapshots (immutable copies of the state without side effects)
 *
 * Lifecycle:
 * 1. Creation: A state proxy is created (e.g., by the useModel hook in React)
 * 2. Mounting: The state proxy is mounted when a view (component in React) mounts, attaching a re-render function for observable property changes
 * 3. Unmounting: The state proxy is unmounted when a view (component in React) unmounts
 * 4. Snapshot Creation: A snapshot of the state proxy can be created (e.g. in React, useModel hook returns it)
 *
 * Observable Properties:
 * - These are specific properties of the state that the proxy monitors
 * - When an observable property changes, the state proxy emits a change event
 * - The StateProxyManager handles these change events
 */
export class StateProxyManager<T extends Record<keyof any, any> = Record<keyof any, any>> {
    static instance<T extends Record<keyof any, any>>(
        stateProxy: StateProxyType<T>
    ): StateProxyManager<T>
    static instance<T extends Record<keyof any, any>>(
        stateProxy: T
    ): StateProxyManager<T> | undefined
    static instance(stateProxy: any) {
        return stateProxy[StateProxyManagerSymbol]
    }

    get Cls() {
        return this.constructor as typeof StateProxyManager
    }

    get isMounted() {
        return this.mounted
    }

    get eventsManager() {
        return this.stateManager.eventsManager
    }

    readonly state: StateType<T>
    readonly stateManager: StateManager<T>

    protected mounted: boolean = false
    protected changeHandler?: OnChangeHandlerType

    readonly context: Record<string, any> = {}

    autoResolveObservableProps = true
    readonly observableProps: ObservablePropsType = {}

    readonly injectedStateProxyMap: Map<StateType, StateProxyType>

    readonly initInjectedStates: (stateProxy: StateProxyType<T>) => void

    constructor(
        public readonly stateProxy: StateProxyType<T>,
        args?: StateProxyArgsType<T>
    ) {
        this.state = stateProxy[StateReferenceSymbol]
        this.stateManager = StateManager.instance(this.state)!

        if (!this.stateManager) {
            throw new Error(
                'StateManager not found. It seems that the state is not FluxModels State object...'
            )
        }

        this.autoResolveObservableProps = args?.autoResolveObservableProps ?? true
        this.observableProps = this.Cls.prepareObservableProps(args?.observeProps ?? {})

        this.injectedStateProxyMap = args?.injectedStateProxyMap ?? new Map()

        this.initInjectedStates =
            args?.initInjectedStates ??
            ((stateProxy) => {
                Object.entries(stateProxy)
            })

        Object.defineProperties(this, {
            state: {
                writable: false
            },
            stateManager: {
                writable: false
            },
            context: {
                writable: false
            },
            observableProps: {
                writable: false
            },
            injectedStateProxyMap: {
                writable: false
            },
            injectedStateProxyGlobalMap: {
                writable: false
            },
            initInjectedStates: {
                writable: false
            }
        })
    }

    mount(changeObservablesHandler?: OnChangeHandlerType) {
        if (!this.mounted) {
            this.mounted = true

            this.Cls.addMountedStateProxy(this.stateProxy)

            this.setChangeObservableHandler(changeObservablesHandler)

            for (const injectedStateProxy of this.injectedStateProxyMap.values()) {
                const stateProxyManager = this.Cls.instance(injectedStateProxy)

                stateProxyManager.mount(changeObservablesHandler)
            }

            this.eventsManager.emit(OnMount, [this.stateProxy])
        }
    }

    unmount() {
        if (this.mounted) {
            this.mounted = false

            this.Cls.removeMountedStateProxy(this.stateProxy)

            this.setChangeObservableHandler(undefined)

            for (const injectedStateProxy of this.injectedStateProxyMap.values()) {
                const stateProxyManager = this.Cls.instance(injectedStateProxy)

                stateProxyManager.unmount()
            }

            this.eventsManager.emit(OnUnmount, [this.stateProxy])
        }
    }

    createSnapshot(): StateSnapshotType<T> {
        const circularCacheMap = new WeakMap()

        const _createSnapshot = (stateProxy: StateProxyType<T> | StateProxyType) => {
            if (circularCacheMap.has(stateProxy)) {
                return circularCacheMap.get(stateProxy)
            }

            const snapshotData: Partial<StateSnapshotType<T>> = {}

            const stateProxyManager = this.Cls.instance(stateProxy as StateProxyType<T>)
            const autoResolveObservableProps = stateProxyManager.autoResolveObservableProps

            stateProxyManager.autoResolveObservableProps = false

            circularCacheMap.set(stateProxy, snapshotData)

            for (const [key, value] of Object.entries(stateProxy)) {
                let snapshotValue: any = value

                if (this.Cls.isStateProxy(value)) {
                    snapshotValue = _createSnapshot(value)
                }

                snapshotData[key as keyof T] = snapshotValue
            }

            stateProxyManager.autoResolveObservableProps = autoResolveObservableProps

            const snapshot = {
                [StateProxySnapshotSymbol]: snapshotData
            }

            Object.setPrototypeOf(snapshotData, stateProxy)
            Object.setPrototypeOf(snapshot, stateProxy)

            return Object.freeze(snapshot) as StateSnapshotType<T>
        }

        return _createSnapshot(this.stateProxy)
    }

    representStateProxy() {
        const { key, model } = this.stateManager
        const isSnapshot = StateProxySnapshotSymbol in this.stateProxy

        return `StateProxy${isSnapshot ? 'Snapshot' : ''}(${key === StateDefaultKeySymbol ? '' : `key: ${key.toString()}, `}model: ${model.name})`
    }

    isObservableProp(propName: string | symbol) {
        if (typeof propName === 'symbol') return false

        const observableProps = this.observableProps

        if (!propName || !observableProps) return false

        return !!observableProps[propName]
    }

    protected getHandler(
        stateProxy: StateProxyType,
        target: StateType<T>,
        propName: string,
        receiver: StateProxyType
    ) {
        if (StateProxySnapshotSymbol in receiver) {
            target = receiver = receiver[StateProxySnapshotSymbol]
        }

        const result = Reflect.get(target, propName, receiver)

        if (typeof result === 'function') {
            return result.bind(stateProxy)
        }

        if (!StateProxyManager.isStateProxy(result) && !StateManager.isState(result)) {
            this.addObservableProp(propName)
        }

        return result
    }

    protected addObservableProp(propName: string) {
        const observableProps = this.observableProps

        if (
            this.autoResolveObservableProps &&
            typeof observableProps === 'object' &&
            observableProps[propName] === undefined
        ) {
            observableProps[propName] = true
        }
    }

    protected generateChangeObservablesHandler(handler?: OnChangeHandlerType) {
        if (!handler) return

        return (args: OnChangeHandlerArgsType) => {
            if (this.isObservableProp(args.propName)) {
                handler(args)
            }
        }
    }

    protected setChangeObservableHandler(handler?: OnChangeHandlerType) {
        if (this.changeHandler) {
            this.eventsManager.unsubscribe(OnChange, this.changeHandler)
            this.changeHandler = undefined
        }

        const generatedHandler = this.generateChangeObservablesHandler(handler)

        if (generatedHandler) {
            this.changeHandler = generatedHandler
            this.eventsManager.subscribe(OnChange, generatedHandler)
        }
    }

    // ==============================================================================
    // =============================== Static methods ===============================
    // ==============================================================================

    static isStateProxy(stateProxy: any) {
        return typeof stateProxy === 'object' && !!stateProxy[StateReferenceSymbol]
    }

    static getMountedStateProxies(
        stateOrStateProxy: StateType | StateProxyType
    ): Set<StateProxyType> {
        const stateManager =
            this.instance(stateOrStateProxy as StateProxyType)?.stateManager ||
            StateManager.instance(stateOrStateProxy as StateType)

        if (!stateManager || !stateManager.context.mountedProxies) {
            return new Set()
        }

        return stateManager.context.mountedProxies
    }

    static addMountedStateProxy(stateProxy: StateProxyType) {
        const stateManager = StateManager.instance(stateProxy)

        if (!stateManager) return

        let mountedProxies = stateManager.context.mountedProxies

        if (!mountedProxies) {
            mountedProxies = new Set()
            stateManager.context.mountedProxies = mountedProxies
        }

        mountedProxies.add(stateProxy)
    }

    static removeMountedStateProxy(stateProxy: StateProxyType) {
        const stateManager = StateManager.instance(stateProxy)

        if (!stateManager) return

        const mountedProxies = stateManager.context.mountedProxies

        if (mountedProxies) {
            mountedProxies.delete(stateProxy)
        }
    }

    static createStateProxy<T extends Record<keyof any, any> = Record<keyof any, any>>(
        state: StateType<T>,
        args?: StateProxyArgsType<T>
    ): StateProxyType<T> {
        let ignoreProxyLogic = true

        const stateProxy: any = new Proxy(state, {
            get(target, propName, receiver) {
                switch (propName) {
                    case 'toString':
                    case Symbol.for('nodejs.util.inspect.custom'):
                        return () => stateProxyManager.representStateProxy()
                    case StateReferenceSymbol:
                        return state
                    case StateProxyManagerSymbol:
                        return stateProxyManager
                }

                if (
                    ignoreProxyLogic ||
                    typeof propName === 'symbol' ||
                    StateManager.isIgnoredProp(propName)
                ) {
                    return Reflect.get(target, propName, receiver)
                }

                return stateProxyManager.getHandler(stateProxy, target, propName, receiver)
            }
        })

        // attach the context to the stateProxy
        const stateProxyManager = new this(stateProxy as StateProxyType<T>, {
            observeProps: args?.observeProps ?? {},
            autoResolveObservableProps: args?.autoResolveObservableProps ?? true,

            initInjectedStates: args?.initInjectedStates,
            injectedStateProxyMap: args?.injectedStateProxyMap
        })

        stateProxyManager.initInjectedStates(stateProxy)

        ignoreProxyLogic = false

        return stateProxy
    }

    protected static prepareObservableProps<
        T extends Record<keyof any, any> = Record<keyof any, any>
    >(observableProps: ObservablePropsArgsType<T>) {
        const observablePropsRecord: ObservablePropsType = {}

        if (typeof observableProps === 'boolean') {
            return observableProps
        }

        for (const [key, prop] of Object.entries(observableProps)) {
            if (typeof prop === 'object') {
                observablePropsRecord[key] = this.prepareObservableProps(prop)
            } else if (typeof prop === 'boolean') {
                observablePropsRecord[key] = prop
            } else if (typeof prop === 'string') {
                observablePropsRecord[prop] = true
            }
        }

        return observablePropsRecord
    }
}
