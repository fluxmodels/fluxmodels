import {
    Meta,
    isEqual,
    type MetaArgsType,
    type MetaChangeHandlerInfoType,
    type MetaErrorHandlerInfoType,
    type MetaErrorHandlerPlaceType
} from 'metatyper'

import { EventsManager } from './EventsManager'
import { StateDefaultKeySymbol, StateStore } from './StateStore'
import { OnChange, OnError, OnInit } from './events'

const StateManagerSymbol = Symbol.for('[[StateManager]]')

export type StateType<T extends Record<keyof any, any> = Record<keyof any, any>> = T & {
    [StateManagerSymbol]: StateManager<T>
}

export type StateArgsType = {
    key?: any
    store?: StateStore

    metaArgs?: MetaArgsType
}

/**
 * StateManager is a class responsible for managing the lifecycle of states.
 * It provides functionality for:
 * - Creating new states
 * - Searching for existing states
 * - Storing and retrieving metadata associated with states
 * - Managing state operations and updates
 */
export class StateManager<T extends Record<keyof any, any> = Record<keyof any, any>> {
    static instance(state: StateType) {
        return state[StateManagerSymbol]
    }

    get Cls() {
        return this.constructor as typeof StateManager
    }

    readonly context: Record<string, any> = {}

    readonly eventsManager: EventsManager<StateType<T>> = this.Cls.getEventsManager(this.state)

    constructor(
        public readonly state: StateType<T>,
        public readonly model: (new (...args: any[]) => T) | T,
        public readonly key: any,
        public readonly store: StateStore
    ) {
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
            mountedProxies: {
                writable: false
            },
            eventsManager: {
                writable: false
            }
        })
    }

    representState() {
        const { key, model } = this

        return `State(${key === StateDefaultKeySymbol ? '' : `key: ${key.toString()}, `}model: ${model.name})`
    }

    static getEventsManager<T extends StateType>(state: T): EventsManager<T> {
        return new EventsManager(state)
    }

    static isIgnoredProp(propName: string | symbol) {
        if (typeof propName === 'symbol') return true

        return propName?.startsWith?.('_') ?? true
    }

    static createState<T extends Record<keyof any, any>>(
        model: (new (...args: any[]) => T) | ((...args: any[]) => T) | T,
        args?: StateArgsType
    ): StateType<T> {
        let state: any
        let stateManager: StateManager | undefined = undefined

        const changeHandlers = this.createChangeHandlers((args) => {
            if (stateManager) stateManager.eventsManager.emit(OnChange, [args])
        })

        const errorHandlers = this.createErrorsHandlers((args) => {
            if (stateManager) stateManager.eventsManager.emit(OnError, [args])
        })

        const modelMetaArgs = Meta.getMetaArgs(model) ?? {}
        const metaArgsOverride = args?.metaArgs ?? {}
        const MetaBuilderFunc = Meta.isMetaObject(model) ? Meta.rebuild : Meta

        const ignoreProps = this.isIgnoredProp

        if (model instanceof Function) {
            const metaStateArgs = {
                ...(modelMetaArgs.metaInstanceArgs === 'same'
                    ? modelMetaArgs
                    : (modelMetaArgs.metaInstanceArgs ?? modelMetaArgs ?? {})),

                ...(metaArgsOverride.metaInstanceArgs === 'same'
                    ? metaArgsOverride
                    : (metaArgsOverride.metaInstanceArgs ?? metaArgsOverride ?? {}))
            }

            const metaModelArgs: MetaArgsType = {
                ...modelMetaArgs,
                ...metaArgsOverride,
                metaInstanceArgs: {
                    ignoreProps,
                    dynamicDeclarations: false,
                    ...metaStateArgs,
                    errorHandlers: [...(metaStateArgs.errorHandlers ?? []), ...errorHandlers],
                    changeHandlers: [...(metaStateArgs.changeHandlers ?? []), ...changeHandlers]
                }
            }

            const MetaModel: any = MetaBuilderFunc(model, metaModelArgs)

            state = new MetaModel()
        } else {
            state = MetaBuilderFunc(model, {
                ignoreProps,
                dynamicDeclarations: false,
                ...modelMetaArgs,
                ...metaArgsOverride,
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

        const key = args?.key ?? StateDefaultKeySymbol
        const store = args?.store ?? StateStore.defaultStore

        stateManager = new StateManager(state, model, key, store)

        Object.defineProperties(state, {
            [StateManagerSymbol]: {
                value: stateManager,
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

        store.addState(model, state, key)

        stateManager.eventsManager.emit(OnInit, [state])

        return state
    }

    static getOrCreateState<T extends Record<keyof any, any>>(
        model: (new (...args: any[]) => T) | ((...args: any[]) => T) | T,
        args?: StateArgsType & {
            keyEqual?: (key: any, keyToFind: any) => boolean
        }
    ): readonly [StateType<T>, boolean] {
        const store = args?.store ?? StateStore.defaultStore
        const key = args?.key ?? StateDefaultKeySymbol
        const keyEqual = args?.keyEqual ?? isEqual

        const foundState = store.findState(model, (existsKey: any) => keyEqual(existsKey, key))

        if (foundState) return [foundState, false] as const

        return [
            this.createState(model, {
                key,
                store,
                metaArgs: args?.metaArgs
            }),
            true
        ] as const
    }

    protected static createChangeHandlers<StateT extends StateType>(
        emit: (args: {
            state: StateT
            propName: string | symbol
            prevValue: any
            newValue: any
        }) => void
    ) {
        const changeHandlers: MetaChangeHandlerInfoType[] = [
            {
                handler: (args) => {
                    if (args?.prevDescriptor?.value === args?.descriptor?.value) return

                    emit({
                        state: args.targetObject as StateT,
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

    protected static createErrorsHandlers<StateT extends StateType>(
        emit: (args: { state: StateT; error: any; errorPlace: MetaErrorHandlerPlaceType }) => void
    ) {
        const errorHandlers: MetaErrorHandlerInfoType[] = [
            {
                handler: (args) => {
                    emit({
                        state: args.targetObject as StateT,
                        error: args.error,
                        errorPlace: args.errorPlace
                    })
                },
                places: ['init', 'get', 'define', 'delete', 'validate', 'deserialize', 'serialize']
            }
        ]

        return errorHandlers
    }

    static isState(state: any) {
        return typeof state === 'object' && !!state[StateManagerSymbol]
    }
}
