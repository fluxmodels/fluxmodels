import { Meta } from 'metatyper'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
    StateManager,
    StateProxyManager,
    StateStore,
    type AnyRecord,
    type StateModel,
    type IsInjectedStateType,
    type StateArgs,
    type StateProxyArgs
} from '@fluxmodels/core'

import { useStateStore } from './StateStoreProvider'
import { waitUseSuspensePromises } from './StateSuspense'

/**
 * Configuration options for the `useModel` hook.
 * Combines state creation arguments ({@link StateArgs}) with state proxy configuration
 * ({@link StateProxyArgs}) and adds React-specific options for managing async initialization
 * and suspense behavior.
 * @typeParam T - The shape of the state model.
 *
 */
export type UseModelArgs<T extends AnyRecord> = StateArgs<T> &
    StateProxyArgs<T> & {
        /**
         * Store instance that should hold the state.
         * Defaults to the store provided by `useStateStore()` (from `StateStoreProvider`),
         * or falls back to `StateStore.defaultStore` if no provider is present.
         */
        store?: StateStore
        /**
         * Depth of injected state proxies (managed by `StateProxyManager`) inspected by
         * `waitUseSuspensePromises` for pending async initializers such as those marked with
         * `\@UseSuspense`. Use `-1` to traverse without limits.
         */
        useSuspenseDepth?: number
    }

export type ModelPropsKeys<T> = {
    [key in keyof T]: T[key] extends (...args: any[]) => any
        ? never
        : IsInjectedStateType<T[key]> extends true
          ? never
          : key
}[keyof T]

/**
 * Creates or reuses a state for the given model and returns a read-only snapshot
 * plus a function to update the state in a type-safe way.
 *
 * @param model - The model class/object or factory used to build the state.
 * @param args - Optional configuration (key, store, observable props, meta args, etc.).
 * @returns A tuple `[stateSnapshot, update]` where `stateSnapshot` is an immutable snapshot
 *          of the state suitable for rendering, and `update` applies partial updates
 *          using model field types.
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
export function useModel<T extends AnyRecord>(model: StateModel<T>, args?: UseModelArgs<T>) {
    const defaultStore = useStateStore()

    const key = args?.key
    const store = args?.store ?? defaultStore

    const observeProps = args?.observeProps
    const autoResolveObservableProps = args?.autoResolveObservableProps

    const [state] = useMemo(
        () =>
            StateManager.getOrCreateState(model, {
                store,
                key,
                metaArgs: args?.metaArgs
            }),
        [model, key, store]
    )

    const stateProxy = useMemo(() => {
        const [stateProxy] = StateProxyManager.getOrCreateStateProxy(state, {
            observeProps,
            autoResolveObservableProps
        })

        return stateProxy
    }, [state])

    const stateProxyManager = StateProxyManager.instance(stateProxy)

    const [, _rerender] = useState({})
    const rerender = () => _rerender({})

    useEffect(() => {
        stateProxyManager.mount(rerender, {
            rerender
        })

        return () => {
            stateProxyManager.unmount()
        }
    }, [stateProxy])

    stateProxyManager.refresh()

    waitUseSuspensePromises(stateProxy, args?.useSuspenseDepth ?? -1)

    const stateSnapshot = stateProxyManager.createSnapshot()

    const updateStateFunc = useCallback(
        (raw: {
            [key in ModelPropsKeys<T>]?: T[key]
        }) => {
            Meta.deserialize(state, raw)
        },
        [state]
    )

    return [stateSnapshot, updateStateFunc] as const
}
