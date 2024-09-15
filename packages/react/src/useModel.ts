import { Meta, type MetaArgsType } from 'metatyper'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
    StateStore,
    StateManager,
    StateProxyManager,
    type InjectedType,
    type ObservablePropsArgsType
} from '@fluxmodels/core'

import { useModelsStore } from './ModelsStoreProvider'
import { handleUseSuspensePromises } from './UseSuspense'

type UseModelArgsType<T extends Record<keyof any, any>> = {
    key?: any
    keyEqual?: (existsKey: any, searchKey: any) => boolean
    store?: StateStore

    observeProps?: ObservablePropsArgsType<T>
    autoResolveObservableProps?: boolean

    /**
     * Disables component re-rendering and React Suspense for methods
     * decorated with @UseSuspense when set to true.
     */
    disableUseSuspense?: boolean

    metaArgs?: MetaArgsType
}

type ModelPropsKeysType<T> = {
    [key in keyof T]: T[key] extends (...args: any[]) => any
        ? never
        : Required<T[key]> extends Required<InjectedType<object>>
          ? never
          : key
}[keyof T]

/**
 * useModel is a hook that is used to create a state and state proxy snapshot.
 *
 * @param model - The model to create the state proxy for.
 * @param args - The arguments to create the state and state proxy.
 * @returns The state proxy snapshot and state update function.
 *
 * @example
 * ```tsx
 * class Model {
 *     name = 'John'
 * }
 *
 * const Component = () => {
 *     const [state, setState] = useModel(Model)
 *
 *     return <input
 *              value={state.name}
 *              onChange={(e) => setState({ name: e.target.value })} />
 * }
 * ```
 */
export function useModel<T extends Record<keyof any, any>>(
    model: (new (...args: any[]) => T) | T,
    args?: UseModelArgsType<T>
) {
    const defaultStore = useModelsStore()

    const key = args?.key
    const keyEqual = args?.keyEqual
    const store = args?.store ?? defaultStore

    const observeProps = args?.observeProps
    const autoResolveObservableProps = args?.autoResolveObservableProps

    const [state] = useMemo(
        () =>
            StateManager.getOrCreateState(model, {
                store,
                key,
                keyEqual,
                metaArgs: args?.metaArgs
            }),
        [model, key, keyEqual, store]
    )

    const stateProxy = useMemo(() => {
        return StateProxyManager.createStateProxy(state, {
            observeProps,
            autoResolveObservableProps
        })
    }, [state])

    const stateProxyManager = useMemo(() => {
        return StateProxyManager.instance(stateProxy)
    }, [stateProxy])

    const [, _rerender] = useState({})
    const rerender = () => _rerender({})

    useEffect(() => {
        // Allows triggering re-renders from any context where the state is accessible,
        // such as within UseSuspense
        stateProxyManager.context.rerender = rerender

        stateProxyManager.mount(rerender)

        return () => {
            stateProxyManager.unmount()
        }
    }, [stateProxy])

    if (!args?.disableUseSuspense) {
        handleUseSuspensePromises(stateProxy)

        for (const stateProxy of stateProxyManager.injectedStateProxyMap.values()) {
            handleUseSuspensePromises(stateProxy)
        }
    }

    const stateSnapshot = stateProxyManager.createSnapshot()

    const updateStateFunc = useCallback(
        (raw: {
            [key in ModelPropsKeysType<T>]?: T[key]
        }) => {
            Meta.deserialize(state, raw)
        },
        [state]
    )

    return [stateSnapshot, updateStateFunc] as const
}
