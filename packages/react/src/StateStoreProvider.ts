import {
    createContext,
    createElement,
    useContext,
    type FunctionComponentElement,
    type ReactNode
} from 'react'

import { StateStore } from '@fluxmodels/core'

const StoreContext = createContext<StateStore | undefined>(undefined)

/**
 * React provider that makes a `StateStore` available to descendants via context.
 *
 * `useModel` will use this store as the default store when called within the tree.
 *
 * @param args - Provider props.
 * @param args.store - The `StateStore` instance to provide.
 * @param args.children - Child nodes to render within the provider.
 * @returns A provider element for the models store.
 */
export const StateStoreProvider = (args: {
    children?: ReactNode
    store: StateStore
}): FunctionComponentElement<{ value: StateStore | undefined }> => {
    const { children, store } = args

    return createElement(
        StoreContext.Provider,
        {
            value: store
        },
        children
    )
}

/**
 * Returns the `StateStore` from context, falling back to the default store.
 *
 * @returns The effective `StateStore` for the current React tree.
 */
export const useStateStore = () => {
    const store = useContext(StoreContext)

    return store ?? StateStore.defaultStore
}
