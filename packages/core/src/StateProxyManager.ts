import { OnChange, OnMount, OnUnmount, type OnChangeArgs, type OnChangeHandler } from './events'
import { StateManager } from './StateManager'

import {
    StateProxyManagerSymbol,
    StateReferenceSymbol,
    StateProxySnapshotSymbol,
    DEFAULT_STATE_KEY,
    IsStateProxySymbol
} from './constants'
import {
    type AnyRecord,
    type State,
    type StateProxy,
    type StateProxyManagerArgs,
    type ObservableProps,
    type ObservablePropsArgs,
    type StateSnapshot,
    type MountHandlerType
} from './types'

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
/**
 * Manages the lifecycle, observation, and snapshotting of a state proxy.
 *
 */
export class StateProxyManager<T extends AnyRecord = AnyRecord> {
    /**
     * Returns the `StateProxyManager` instance attached to a given state proxy.
     */
    static instance<T extends AnyRecord>(stateProxy: StateProxy<T>): StateProxyManager<T>
    static instance<T extends AnyRecord>(
        stateProxy: StateProxy<T> | undefined | null | void
    ): StateProxyManager<T> | undefined

    static instance(stateProxy: any) {
        if (!stateProxy) return

        return stateProxy[StateProxyManagerSymbol]
    }

    get stateProxyId() {
        return this._stateProxyId
    }

    get isMounted() {
        return this._mounted
    }

    get eventsManager() {
        return this._stateManager.eventsManager
    }

    autoResolveObservableProps = true
    observableProps: ObservableProps = {}

    mountHandler?: MountHandlerType
    mountContext: Record<string, any> = {}

    readonly isRoot: boolean = false
    readonly parentStateProxy?: StateProxy
    readonly globalStateProxyCacheMap: Map<State, StateProxy>
    readonly childrenStateProxyMap: Map<State, StateProxy>
    readonly oldChildrenStateProxyMap: Map<State, StateProxy>

    protected _stateProxyId: string
    protected _mounted: boolean = false
    protected _changeHandler?: OnChangeHandler
    protected _version: number = 0

    protected _autoResolveObservablePropsDisabled = false // for temporary disabling of auto resolve observable props
    protected _childrenMountAvailable = true

    private readonly _stateManager: StateManager<T>

    constructor(
        public readonly state: State<T>,
        public readonly stateProxy: StateProxy<T>,
        args?: StateProxyManagerArgs<T>
    ) {
        this._stateProxyId = Math.random().toString(36).substring(2, 15)
        this._stateManager = StateManager.instance(this.state)

        if (!this._stateManager) {
            throw new Error(
                'StateManager not found. It seems that the state is not FluxModels State object...'
            )
        }

        const parentStateProxy = args?.parentStateProxy || undefined
        const parentStateProxyManager = parentStateProxy
            ? StateProxyManager.instance(parentStateProxy)
            : undefined

        const globalStateProxyCacheMap =
            args?.globalStateProxyCacheMap ||
            parentStateProxyManager?.globalStateProxyCacheMap ||
            new Map()

        this.isRoot = globalStateProxyCacheMap.size === 0
        this.parentStateProxy = parentStateProxy
        this.globalStateProxyCacheMap = globalStateProxyCacheMap
        this.childrenStateProxyMap = args?.childrenStateProxyMap || new Map<State, StateProxy>()
        this.oldChildrenStateProxyMap = args?.childrenStateProxyMap
            ? new Map(args?.childrenStateProxyMap)
            : new Map<State, StateProxy>()

        this.autoResolveObservableProps = args?.autoResolveObservableProps ?? true
        this.observableProps = StateProxyManager._prepareObservableProps(args?.observeProps || {})

        Object.defineProperties(this, {
            state: {
                writable: false
            },
            stateProxy: {
                writable: false
            },
            stateManager: {
                writable: false
            },
            isRoot: {
                writable: false
            },
            parentStateProxy: {
                writable: false
            },
            globalStateProxyCacheMap: {
                writable: false
            },
            childrenStateProxyMap: {
                writable: false
            },
            oldChildrenStateProxyMap: {
                writable: false
            }
        })

        this.globalStateProxyCacheMap.set(state, stateProxy)

        if (this.parentStateProxy) {
            const parentStateProxyManager = StateProxyManager.instance(this.parentStateProxy)

            parentStateProxyManager._addChildrenStateProxy(this.stateProxy)
        }
    }

    /**
     * Mounts the state proxy: subscribes to observable changes and emits `OnMount`.
     * Pass a handler to be called when observable props change.
     *
     * @param changeObservablesHandler - Called when observed properties change.
     * @param context - Optional context forwarded to `OnMount` handlers.
     */
    mount(changeObservablesHandler: MountHandlerType, context?: Record<string, any>) {
        if (!this._mounted) {
            this._mounted = true

            if (!context) {
                context = {}
            }

            this.mountContext = context

            const stateProxy = this.stateProxy

            StateProxyManager.addMountedStateProxy(stateProxy)

            this._setChangeObservableHandler(changeObservablesHandler)

            if (this._childrenMountAvailable) {
                for (const injectedStateProxy of this.childrenStateProxyMap.values()) {
                    if (injectedStateProxy === stateProxy) continue

                    const stateProxyManager = StateProxyManager.instance(injectedStateProxy)

                    stateProxyManager.mount(changeObservablesHandler, context)
                }
            }

            this.eventsManager.emit(
                OnMount,
                [{ stateProxy: this.stateProxy, context }],
                this.stateProxy
            )
        }
    }

    /**
     * Unmounts the state proxy: unsubscribes and emits `OnUnmount`.
     */
    unmount() {
        if (this._mounted) {
            this._mounted = false

            const stateProxy = this.stateProxy

            StateProxyManager.removeMountedStateProxy(stateProxy)

            this._setChangeObservableHandler(undefined)

            if (this._childrenMountAvailable) {
                for (const injectedStateProxy of this.childrenStateProxyMap.values()) {
                    const stateProxyManager = StateProxyManager.instance(injectedStateProxy)

                    stateProxyManager.unmount()
                }
            }

            this.eventsManager.emit(
                OnUnmount,
                [{ stateProxy: this.stateProxy, context: this.mountContext }],
                this.stateProxy
            )
        }
    }

    /**
     * Creates an immutable, side-effect-free snapshot of the state proxy.
     *
     * @returns A snapshot object with the same shape as the state proxy.
     */
    createSnapshot(): StateSnapshot<T> {
        const circularCacheMap = new WeakMap()

        const _createSnapshot = (stateProxy: StateProxy) => {
            if (circularCacheMap.has(stateProxy)) {
                return circularCacheMap.get(stateProxy)
            }

            const snapshotData: Partial<AnyRecord> = {}

            const snapshot = {
                [StateProxySnapshotSymbol]: snapshotData
            }

            circularCacheMap.set(stateProxy, snapshot)

            const stateProxyManager = StateProxyManager.instance(stateProxy)

            stateProxyManager._autoResolveObservablePropsDisabled = true

            for (const [key, value] of Object.entries(stateProxy)) {
                let snapshotValue: any = value

                if (StateManager.isState(value)) {
                    snapshotValue = _createSnapshot(value)
                } else if (Array.isArray(value)) {
                    snapshotValue = Object.freeze(
                        value.map((item) => {
                            if (StateManager.isState(item)) {
                                return _createSnapshot(item)
                            }

                            return item
                        })
                    )
                }

                snapshotData[key] = snapshotValue
            }

            stateProxyManager._autoResolveObservablePropsDisabled = false

            Object.defineProperties(snapshot, {
                toString: {
                    value: () => stateProxyManager.representState(true),
                    writable: false,
                    enumerable: false,
                    configurable: true
                }
            })

            Object.setPrototypeOf(snapshotData, stateProxy)
            Object.setPrototypeOf(snapshot, stateProxy)

            return Object.freeze(snapshot) as any
        }

        return _createSnapshot(this.stateProxy as any)
    }

    /**
     * Returns a human-friendly string representation of the state proxy.
     *
     * @returns A string representation of the state proxy.
     */
    representState(isSnapshot: boolean = false) {
        const { key, model } = this._stateManager

        const modelName =
            typeof model === 'function'
                ? model.name
                : ((model as any)?.__name ?? (model as any)?.constructor?.name ?? 'ObjectModel')

        return `StateProxy${isSnapshot ? 'Snapshot' : ''}(${key === DEFAULT_STATE_KEY ? '' : `key: ${String(key)}, `}model: ${modelName}, stateId: ${this._stateManager.stateId}, proxyId: ${this._stateProxyId})`
    }

    /**
     * Checks if a property is considered observable by this manager.
     *
     * @param propName - Property name to check.
     * @returns Whether the property is observable.
     */
    isObservableProp(propName: string | symbol) {
        if (typeof propName === 'symbol') return false

        const observableProps = this.observableProps

        if (!propName || !observableProps) return false

        return !!observableProps[propName]
    }

    /*
     * Triggers the mount handler.
     * Used to trigger the re-render of the component in which the state proxy is mounted.
     *
     * @returns The result of the mount handler.
     */
    triggerMountHandler() {
        if (this.mountHandler) {
            this.mountHandler({
                state: this.state,
                stateProxy: this.stateProxy
            })
        }
    }

    /**
     * Refreshes the state proxy: rebuilds the children state proxies if the state version has changed.
     * Used to mount/unmount injected state proxies if the states have changed.
     */
    refresh() {
        const proxiesStack: StateProxy[] = [this.stateProxy]
        const visitedProxies = new Set<StateProxy>()

        let isDirty = false

        while (proxiesStack.length > 0) {
            const stateProxy = proxiesStack.pop()

            if (!stateProxy) continue

            if (visitedProxies.has(stateProxy)) continue

            visitedProxies.add(stateProxy)

            const stateProxyManager = StateProxyManager.instance(stateProxy)

            if (stateProxyManager._stateManager.version !== stateProxyManager._version) {
                isDirty = true
                stateProxyManager._version = stateProxyManager._stateManager.version
            }

            proxiesStack.push(...stateProxyManager.childrenStateProxyMap.values())
        }

        if (isDirty) {
            this._rebuildChildrenStateProxies()
        }
    }

    protected _addChildrenStateProxy(stateProxy: StateProxy) {
        const stateManager = StateManager.instance(stateProxy)

        this.childrenStateProxyMap.set(stateManager.state, stateProxy)

        if (this._stateManager.version === this._version) {
            this.oldChildrenStateProxyMap.set(stateManager.state, stateProxy)
        }
    }

    protected _rebuildChildrenStateProxies() {
        const proxiesStack: StateProxy[] = [this.stateProxy]
        const visitedProxies = new Set<StateProxy>()

        const globalStateProxiesSet = new Set<StateProxy>()

        const proxiesToMount = new Set<StateProxy>()
        const proxiesToUnmount = new Set<StateProxy>()

        while (proxiesStack.length > 0) {
            const stateProxy = proxiesStack.pop()

            if (!stateProxy) continue

            if (visitedProxies.has(stateProxy)) continue

            visitedProxies.add(stateProxy)

            const stateProxyManager = StateProxyManager.instance(stateProxy)

            stateProxyManager._autoResolveObservablePropsDisabled = true

            const actualChildrenStateProxies = new Set<StateProxy>()
            const oldChildrenStateProxies = new Set<StateProxy>(
                stateProxyManager.oldChildrenStateProxyMap.values()
            )

            const newStateProxiesSet = new Set<StateProxy>()
            const deprecatedStateProxiesSet = new Set<StateProxy>()

            const propNamesWithStates = stateProxyManager._stateManager.propNamesWithStates

            for (const propName of propNamesWithStates) {
                const value: any = Reflect.get(stateProxy, propName)

                const updateSets = (item: StateProxy) => {
                    globalStateProxiesSet.add(item)
                    actualChildrenStateProxies.add(item)

                    if (!oldChildrenStateProxies.has(item)) {
                        newStateProxiesSet.add(item)
                    }

                    proxiesStack.push(item)
                }

                if (StateProxyManager.isStateProxy(value)) {
                    updateSets(value)
                } else if (Array.isArray(value)) {
                    for (const item of value) {
                        if (StateProxyManager.isStateProxy(item)) {
                            updateSets(item)
                        }
                    }
                }
            }

            stateProxyManager.childrenStateProxyMap.clear()
            stateProxyManager.oldChildrenStateProxyMap.clear()

            for (const actualChildrenStateProxy of actualChildrenStateProxies) {
                stateProxyManager._addChildrenStateProxy(actualChildrenStateProxy)
            }

            for (const childStateProxy of oldChildrenStateProxies) {
                if (!actualChildrenStateProxies.has(childStateProxy)) {
                    deprecatedStateProxiesSet.add(childStateProxy)
                }
            }

            if (this._mounted) {
                for (const deprecatedStateProxy of deprecatedStateProxiesSet) {
                    proxiesToUnmount.add(deprecatedStateProxy)
                }

                for (const newStateProxy of newStateProxiesSet) {
                    proxiesToMount.add(newStateProxy)
                }
            }

            stateProxyManager._autoResolveObservablePropsDisabled = false
        }

        if (this.isRoot) {
            this.globalStateProxyCacheMap.clear()
        }

        for (const stateProxy of globalStateProxiesSet) {
            const stateManager = StateProxyManager.instance(stateProxy)

            this.globalStateProxyCacheMap.set(stateManager.state, stateProxy)
        }

        for (const stateProxy of proxiesToUnmount) {
            const stateProxyManager = StateProxyManager.instance(stateProxy)

            stateProxyManager._childrenMountAvailable = false
            stateProxyManager.unmount()
            stateProxyManager._childrenMountAvailable = true
        }

        if (this.mountHandler) {
            for (const stateProxy of proxiesToMount) {
                const stateProxyManager = StateProxyManager.instance(stateProxy)

                stateProxyManager._childrenMountAvailable = false
                stateProxyManager.mount(this.mountHandler, this.mountContext)
                stateProxyManager._childrenMountAvailable = true
            }
        }
    }

    protected _handleProxyPropRead(
        stateProxy: StateProxy,
        target: State<T>,
        propName: string,
        receiver: StateProxy
    ) {
        if (StateProxySnapshotSymbol in receiver) {
            target = receiver = receiver[StateProxySnapshotSymbol]
        }

        const result = Reflect.get(target, propName, receiver)

        if (typeof result === 'function') {
            return result.bind(stateProxy)
        }

        this._addObservableProp(propName)

        return result
    }

    protected _addObservableProp(propName: string) {
        const observableProps = this.observableProps

        if (
            !this.autoResolveObservableProps ||
            this._autoResolveObservablePropsDisabled ||
            typeof observableProps !== 'object'
        ) {
            return
        }

        if (observableProps[propName] === undefined) {
            observableProps[propName] = true
        }

        const relatedProps = this._stateManager.getRelatedProps(propName)

        for (const relatedProp of relatedProps) {
            if (observableProps[relatedProp] === undefined) {
                this._addObservableProp(relatedProp)
            }
        }
    }

    protected _setChangeObservableHandler(handler?: MountHandlerType) {
        if (this._changeHandler) {
            this.eventsManager.unsubscribe(OnChange, this._changeHandler)
            this.mountHandler = undefined
            this._changeHandler = undefined
        }

        if (!handler) return

        this._changeHandler = (args: OnChangeArgs) => {
            if (this.isObservableProp(args.propName)) {
                handler({
                    state: this.state,
                    stateProxy: this.stateProxy
                })
            }
        }

        this.mountHandler = handler
        this.eventsManager.subscribe(OnChange, this._changeHandler)
    }

    // ==============================================================================
    // =============================== Static methods ===============================
    // ==============================================================================

    /**
     * Returns true if the value is a FluxModels State Proxy.
     *
     * @param stateProxy - Value to check.
     * @returns Whether the value is a state proxy.
     */
    static isStateProxy(stateProxy: any) {
        return !!stateProxy && typeof stateProxy === 'object' && !!stateProxy[IsStateProxySymbol]
    }

    /**
     * Returns a set of mounted state proxies related to a given state or state proxy.
     *
     * @param stateOrStateProxy - A state or state proxy.
     * @returns A set of mounted state proxies related to the state.
     */
    static getMountedStateProxies(stateOrStateProxy: State | StateProxy): Set<StateProxy> {
        const stateManager =
            this.instance(stateOrStateProxy as StateProxy)?._stateManager ||
            StateManager.instance(stateOrStateProxy as State)

        if (!stateManager || !stateManager.context.mountedProxies) {
            return new Set()
        }

        return stateManager.context.mountedProxies
    }

    /**
     * Adds a state proxy to the mounted set for its state.
     *
     * @param stateProxy - The proxy to add.
     */
    static addMountedStateProxy(stateProxy: StateProxy<AnyRecord>) {
        const stateManager = StateManager.instance(stateProxy)

        if (!stateManager) return

        let mountedProxies = stateManager.context.mountedProxies

        if (!mountedProxies) {
            mountedProxies = new Set()
            stateManager.context.mountedProxies = mountedProxies
        }

        mountedProxies.add(stateProxy)
    }

    /**
     * Removes a state proxy from the mounted set for its state.
     *
     * @param stateProxy - The proxy to remove.
     */
    static removeMountedStateProxy(stateProxy: StateProxy<AnyRecord>) {
        const stateManager = StateManager.instance(stateProxy)

        if (!stateManager) return

        const mountedProxies = stateManager.context.mountedProxies

        if (mountedProxies) {
            mountedProxies.delete(stateProxy)
        }
    }

    /**
     * Gets or creates a new state proxy for a given state, configuring observation rules.
     *
     * @param state - The state instance to wrap.
     * @param args - Optional configuration for observation and injection.
     * @returns A tuple `[stateProxy, isNew]` where `stateProxy` is the new state proxy that wraps the given state, and `isNew` is a boolean indicating if the state proxy is new.
     */
    static getOrCreateStateProxy<T extends AnyRecord = AnyRecord>(
        state: State<T>,
        args?: StateProxyManagerArgs<T>
    ): readonly [StateProxy<T>, boolean] {
        const parentStateProxy = args?.parentStateProxy

        if (parentStateProxy) {
            const parentStateProxyManager = this.instance(parentStateProxy)
            const cachedProxy = parentStateProxyManager.globalStateProxyCacheMap.get(state)

            if (cachedProxy) {
                parentStateProxyManager._addChildrenStateProxy(cachedProxy)

                return [cachedProxy as StateProxy<T>, false] as const
            }
        }

        const stateManager = StateManager.instance(state)

        if (!stateManager) {
            throw new Error(
                'StateManager not found. It seems that the state is not FluxModels State object...'
            )
        }

        const stateProxy: any = new Proxy(state, {
            get(target, propName, receiver) {
                switch (propName) {
                    case 'toString':
                    case Symbol.for('nodejs.util.inspect.custom'):
                        return () => stateProxyManager.representState()
                    case IsStateProxySymbol:
                        return true
                    case StateReferenceSymbol:
                        return state
                    case StateProxyManagerSymbol:
                        return stateProxyManager
                }

                if (typeof propName === 'symbol' || StateManager.isIgnoredProp(propName)) {
                    return Reflect.get(target, propName, receiver)
                }

                return stateManager.trackRelatedProps(propName, () => {
                    return stateProxyManager._handleProxyPropRead(
                        stateProxy,
                        target,
                        propName,
                        receiver
                    )
                })
            }
        })

        // attach the context to the stateProxy
        const stateProxyManager = new this(state, stateProxy, {
            ...args
        })

        stateProxyManager._autoResolveObservablePropsDisabled = true

        // trigger the reading of the properties with states to create them if needed
        stateProxyManager._stateManager.propNamesWithStates.forEach((propName) => {
            Reflect.get(stateProxy, propName)
        })

        stateProxyManager._autoResolveObservablePropsDisabled = false

        return [stateProxy, true] as const
    }

    /**
     * Normalizes the `observeProps` option into a record of booleans/records.
     *
     * @param observableProps - User-provided observation config.
     * @returns A normalized record describing observable props.
     */
    protected static _prepareObservableProps<T extends AnyRecord = AnyRecord>(
        observableProps: ObservablePropsArgs<T>
    ) {
        const observablePropsRecord: ObservableProps = {}

        if (typeof observableProps === 'boolean') {
            return observableProps
        }

        for (const [key, prop] of Object.entries(observableProps)) {
            if (typeof prop === 'object') {
                observablePropsRecord[key] = this._prepareObservableProps(prop)
            } else if (typeof prop === 'boolean') {
                observablePropsRecord[key] = prop
            } else if (typeof prop === 'string') {
                observablePropsRecord[prop] = true
            }
        }

        return observablePropsRecord
    }
}
