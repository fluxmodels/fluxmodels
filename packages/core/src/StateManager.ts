import {
    Meta,
    type MetaArgsType,
    type MetaChangeHandlerInfoType,
    type MetaErrorHandlerInfoType,
    type MetaErrorHandlerPlaceType
} from 'metatyper'

import { StateStore } from './StateStore'
import { EventsManager } from './EventsManager'
import { StateProxyManager } from './StateProxyManager'
import { OnChange, OnError, OnInit } from './events'

import { IsStateSymbol, DEFAULT_STATE_KEY, StateManagerSymbol, STATE_ARGS } from './constants'
import {
    type AnyRecord,
    type StateKey,
    type State,
    type StateArgs,
    type StateModel,
    StateProxy
} from './types'

/**
 * StateManager is a class responsible for managing the lifecycle of states.
 * It provides functionality for:
 * - Creating new states
 * - Searching for existing states
 * - Storing and retrieving metadata associated with states
 * - Managing state operations and updates
 */
export class StateManager<T extends AnyRecord = AnyRecord> {
    /**
     * Returns the `StateManager` instance attached to a given state or state proxy.
     *
     * This allows accessing state-level context, events, and utilities
     * from anywhere you have the state (or its proxy).
     *
     * @param state - A FluxModels state or state proxy.
     * @returns The associated `StateManager` (or `undefined` for non-states).
     */
    static instance<T extends AnyRecord, ST extends State<T>>(
        state: ST
    ): StateManager<ST extends State<infer U> ? U : T>
    static instance(state: State): StateManager
    static instance<T extends AnyRecord>(state: T): StateManager<T> | undefined
    static instance(state: any): any {
        if (!state) return

        return state[StateManagerSymbol]
    }

    get stateId() {
        return this._stateId
    }

    get eventsManager() {
        return StateManager.getEventsManager(this.state as object)
    }

    /** Whether the state is dirty (has changes). */
    get version() {
        return this._version
    }

    /** A list of property names that have states (e.g. InjectModel). */
    get propNamesWithStates(): readonly string[] {
        return Object.freeze([...this._propNamesWithStatesSet])
    }

    /** A bag for user/framework-specific values associated with the state lifecycle. */
    readonly context: Record<string, any> = {}

    /** The id of the state. */
    protected _stateId: string

    /** A promise that resolves when the state is initialized (in case of async initialization). */
    protected _initPromise: Promise<any> | undefined = undefined

    /** A set of property names that have states (e.g. InjectModel). */
    protected _propNamesWithStatesSet: Set<string> = new Set()

    /** A map of related properties, e.g. InjectModel property and keyFrom property. */
    protected _relatedProps: Map<string, Set<string>> = new Map()

    /** The property name that is currently being tracked. */
    protected _trackingProps: string[] = []

    /** Version of the state. Changed when state is updated. */
    protected _version = 0

    /**
     * Creates a `StateManager` bound to a specific state instance.
     * Prefer using {@link StateManager.getOrCreateState} to construct states.
     *
     * @param state - The state instance.
     * @param model - The model class/object used to create the state.
     * @param key - The state's key.
     * @param store - Store where the state is kept.
     */
    constructor(
        public readonly state: State,
        public readonly model: StateModel<T>,
        public readonly key: StateKey,
        public readonly store: StateStore
    ) {
        this._stateId = Math.random().toString(36).substring(2, 15)

        Object.defineProperties(this, {
            state: {
                writable: false
            },
            model: {
                writable: false
            },
            key: {
                writable: false
            },
            store: {
                writable: false
            },
            context: {
                writable: false
            }
        })
    }

    /**
     * Returns a human-friendly string representation of the state.
     */
    representState() {
        const { key, model } = this

        const modelName =
            typeof model === 'function'
                ? model.name
                : ((model as any)?.__name ?? (model as any)?.constructor?.name ?? 'ObjectModel')

        return `State(${key === DEFAULT_STATE_KEY ? '' : `key: ${String(key)}, `}model: ${modelName}, stateId: ${this._stateId})`
    }

    /**
     * Marks a property as a state property. Used to track properties that have states (e.g. InjectModel).
     *
     * @param propName - The property name to mark.
     */
    markStateProperty(propName: string) {
        this._propNamesWithStatesSet.add(propName)
    }

    /**
     * Marks a property as a related property. Used to track properties that are related to a state property.
     * Useful for mark observable properties for state proxy.
     * Related property will be observable if state property is observable.
     *
     * @param propName - The property name to mark.
     * @param relatedPropName - The related property name.
     */
    markRelatedProps(propName: string, relatedPropName: string) {
        if (this._relatedProps.has(propName)) {
            this._relatedProps.get(propName)?.add(relatedPropName)
        } else {
            this._relatedProps.set(propName, new Set([relatedPropName]))
        }
    }

    trackRelatedProps<R>(propName: string, callback: () => R): R {
        if (this._trackingProps.length > 0) {
            this._trackingProps.forEach((parentProp) => {
                this.markRelatedProps(parentProp, propName)
            })
        }

        try {
            this._trackingProps.push(propName)

            return callback()
        } finally {
            this._trackingProps.pop()
        }
    }

    getRelatedProps(propName: string): readonly string[] {
        const relatedProps = this._relatedProps.get(propName)

        if (!relatedProps) return []

        return [...relatedProps]
    }

    // ==============================================================================
    // =============================== Static methods ===============================
    // ==============================================================================

    /**
     * Creates a new {@link EventsManager} instance for the provided object.
     *
     * @param targetObject - The object that will own event handlers.
     * @returns A new `EventsManager` instance.
     */
    static getEventsManager(targetObject: object): EventsManager {
        return new EventsManager(targetObject)
    }

    /**
     * Returns true if a property should be ignored by the state machinery (private, symbol, etc.).
     *
     * @param propName - The property name to check.
     * @returns Whether the property is ignored.
     */
    static isIgnoredProp(propName: string | symbol) {
        if (typeof propName === 'symbol') return true

        return propName?.startsWith?.('_') ?? true
    }

    /**
     * Normalizes a provided key to either the given value or a default key symbol.
     *
     * @param key - Optional key value.
     * @returns The provided key or a default key symbol.
     */
    static prepareKey(key?: StateKey): StateKey {
        return key ?? DEFAULT_STATE_KEY
    }

    /**
     * Returns an existing state for the model and key, or creates a new one.
     *
     * @param model - The model class/object used to build the state.
     * @param args - Optional state creation arguments (key, store, initialValues, meta args, etc.).
     * @returns A tuple `[state, isNew]` where `isNew` is `true` when a new state was created.
     */
    static getOrCreateState<T extends AnyRecord>(
        model: StateModel<T>,
        args?: StateArgs<T>
    ): readonly [State<T>, boolean] {
        const key = this.prepareKey(args?.key)
        const store = args?.store ?? StateStore.defaultStore

        const foundState = store.findState(model, key)

        if (foundState) return [foundState, false] as const

        const [state] = this.createState(model, {
            key,
            store,
            initialValues: args?.initialValues,
            disableValidation: args?.disableValidation,
            metaArgs: args?.metaArgs
        })

        return [state, true] as const
    }

    /**
     * Creates a new state for the given model and arguments.
     *
     * @param model - The model class/object used to create the state.
     * @param args - Optional state creation arguments (key, store, initialValues, meta args, etc.).
     * @returns A tuple `[state]` where `state` is the created state.
     */
    static createState<T extends AnyRecord>(
        model: StateModel<T>,
        args?: StateArgs<T>
    ): [State<T>] {
        let state: any
        let stateManager: StateManager | undefined = undefined

        const changeHandlers = this._createChangeHandlers((args) => {
            if (stateManager) {
                stateManager._version++
                stateManager.eventsManager.emit(OnChange, [args], args.state)
            }
        })

        const errorHandlers = this._createErrorsHandlers((args) => {
            if (stateManager) {
                stateManager.eventsManager.emit(OnError, [args], args.state)
            }
        })

        const modelArgs: MetaArgsType = (model as any)[STATE_ARGS] ?? {}
        const modelMetaArgs = Meta.getMetaArgs(model) ?? {}
        const metaArgsOverride = args?.metaArgs ?? {}
        const MetaBuilderFunc = Meta.isMetaObject(model) ? Meta.rebuild : Meta

        const ignoreProps = this.isIgnoredProp

        if (model instanceof Function) {
            const metaStateArgs = {
                ...(modelArgs.metaInstanceArgs === 'same'
                    ? modelArgs
                    : (modelArgs.metaInstanceArgs ?? modelArgs ?? {})),

                ...(modelMetaArgs.metaInstanceArgs === 'same'
                    ? modelMetaArgs
                    : (modelMetaArgs.metaInstanceArgs ?? modelMetaArgs ?? {})),

                ...(metaArgsOverride.metaInstanceArgs === 'same'
                    ? metaArgsOverride
                    : (metaArgsOverride.metaInstanceArgs ?? metaArgsOverride ?? {}))
            }

            const metaModelArgs: MetaArgsType = {
                ...modelArgs,
                ...modelMetaArgs,
                ...metaArgsOverride,
                validationIsActive: !(
                    args?.disableValidation ??
                    modelArgs.disableValidation ??
                    modelMetaArgs.disableValidation ??
                    metaArgsOverride.disableValidation ??
                    false
                ),
                metaInstanceArgs: {
                    ignoreProps,
                    ...metaStateArgs,
                    validationIsActive: !(
                        args?.disableValidation ?? metaStateArgs.disableValidation
                    ),
                    initialValues: args?.initialValues || metaStateArgs.initialValues,
                    errorHandlers: [...(metaStateArgs.errorHandlers ?? []), ...errorHandlers],
                    changeHandlers: [...(metaStateArgs.changeHandlers ?? []), ...changeHandlers]
                }
            }

            const MetaModel: any = MetaBuilderFunc(model, metaModelArgs)

            state = new MetaModel()
        } else {
            state = MetaBuilderFunc(model, {
                ignoreProps,
                ...modelArgs,
                ...modelMetaArgs,
                ...metaArgsOverride,
                validationIsActive: !(
                    args?.disableValidation ??
                    modelArgs.disableValidation ??
                    modelMetaArgs.disableValidation ??
                    metaArgsOverride.disableValidation ??
                    false
                ),
                initialValues:
                    args?.initialValues ||
                    modelArgs.initialValues ||
                    modelMetaArgs.initialValues ||
                    metaArgsOverride.initialValues,
                errorHandlers: [
                    ...(metaArgsOverride.errorHandlers ?? modelMetaArgs.errorHandlers ?? []),
                    ...errorHandlers
                ],
                changeHandlers: [
                    ...(metaArgsOverride.changeHandlers ?? modelMetaArgs.changeHandlers ?? []),
                    ...changeHandlers
                ]
            })
        }

        const key = this.prepareKey(args?.key)
        const store = args?.store ?? StateStore.defaultStore

        Object.defineProperties(state, {
            [IsStateSymbol]: {
                value: true,
                writable: false,
                enumerable: false,
                configurable: true
            },
            toString: {
                value: () => stateManager?.representState(),
                writable: false,
                enumerable: false,
                configurable: true
            }
        })

        stateManager = new StateManager(state, model, key, store)

        Object.defineProperties(state, {
            [StateManagerSymbol]: {
                value: stateManager,
                writable: false,
                enumerable: false,
                configurable: true
            }
        })

        store.addState(model, state, key)

        const initPromise = stateManager.eventsManager.emit(OnInit, [{ state }], state)

        stateManager._initPromise = initPromise

        Object.entries(state)

        const error = Meta.validate(state, state, {
            stopAtFirstError: false
        })

        if (error) {
            stateManager.eventsManager.emit(OnError, [{ state, error, errorPlace: 'init' }], state)
        }

        return [state]
    }

    protected static _createChangeHandlers<StateT extends State>(
        emit: (args: {
            state: StateT | StateProxy
            propName: string | symbol
            prevValue: any
            newValue: any
        }) => void
    ) {
        const changeHandlers: MetaChangeHandlerInfoType[] = [
            {
                handler: (args) => {
                    if (args?.prevDescriptor?.value === args?.descriptor?.value) return

                    const stateManager = this.instance(args.targetObject)

                    if (!stateManager) return

                    const stateProxyManager = StateProxyManager.instance(args.targetObject)
                    const stateProxyOrState: StateProxy | StateT = stateProxyManager
                        ? stateProxyManager.stateProxy
                        : stateManager.state

                    emit({
                        state: stateProxyOrState,
                        propName: args.propName,
                        prevValue: args.prevDescriptor?.value,
                        newValue: args.descriptor?.value
                    })
                },
                actions: ['set', 'deserialize']
            }
        ]

        return changeHandlers
    }

    protected static _createErrorsHandlers<StateT extends State>(
        emit: (args: {
            state: StateT | StateProxy
            error: any
            errorPlace: MetaErrorHandlerPlaceType
        }) => void
    ) {
        const errorHandlers: MetaErrorHandlerInfoType[] = [
            {
                handler: (args) => {
                    const stateManager = this.instance(args.targetObject)

                    if (!stateManager) return

                    const stateProxyManager = StateProxyManager.instance(args.targetObject)
                    const stateProxyOrState: StateProxy | StateT = stateProxyManager
                        ? stateProxyManager.stateProxy
                        : stateManager.state

                    emit({
                        state: stateProxyOrState,
                        error: args.error,
                        errorPlace: args.errorPlace
                    })
                },
                places: ['get', 'define', 'delete', 'deserialize', 'serialize']
            }
        ]

        return errorHandlers
    }

    /**
     * Checks whether the given value is a FluxModels State instance.
     *
     * @param state - Value to check.
     * @returns Whether the value is a FluxModels State.
     */
    static isState(state: any) {
        return (
            state !== null &&
            state !== undefined &&
            typeof state === 'object' &&
            !!state[IsStateSymbol]
        )
    }

    /**
     * Waits for the state to be initialized (wait async handlers).
     *
     * @param state - The state to wait for.
     * @returns A promise that resolves when all async handlers are resolved.
     */
    static async waitForInit(state: State) {
        const checkedStates = new Set<State>()
        const statesToCheck = [state]

        const initPromises: Promise<any>[] = []

        while (statesToCheck.length > 0) {
            const state = statesToCheck.pop()

            if (!state) continue

            if (checkedStates.has(state)) continue

            checkedStates.add(state)

            const stateManager = this.instance(state)

            if (!stateManager?._initPromise) continue

            initPromises.push(stateManager._initPromise)

            for (const propName of stateManager.propNamesWithStates) {
                const value = Reflect.get(state, propName)

                if (this.isState(value)) {
                    statesToCheck.push(value)
                } else if (Array.isArray(value)) {
                    for (const item of value) {
                        if (this.isState(item)) {
                            statesToCheck.push(item)
                        }
                    }
                }
            }
        }

        if (initPromises.length === 0) return

        await Promise.all(initPromises)
    }

    /**
     * Upserts states for the given model and data.
     *
     * @param model - The model to upsert states for.
     * @param statesData - The data to upsert states for.
     * @param args - Optional arguments to pass to the state creation.
     * @returns An array of states.
     */
    static upsertStates<T extends AnyRecord>(
        model: StateModel<T>,
        statesData: Record<StateKey, T>,
        args?: Omit<StateArgs<T>, 'key' | 'initialValues'>
    ) {
        const states = Object.entries(statesData).map(([key, data]) => {
            const [state] = this.getOrCreateState(model, {
                key,
                initialValues: data,
                ...args
            })

            // initialize all properties of the state
            Object.assign(state, data)

            return state
        })

        return states
    }

    /**
     * Removes a state from the store.
     *
     * @param state - The state to remove.
     */
    static removeState(state: State) {
        const stateManager = this.instance(state)

        if (!stateManager) return

        stateManager.store.removeState(stateManager.model, stateManager.key)
    }
}
