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
 * ModelsStoreProvider is a React component that provides a StateStore to its children.
 * It uses React's Context API to make the store available to all components within the tree.
 *
 * `useModel` will use this store as default store
 *
 * @returns A React component that wraps its children with the provided StateStore.
 */
export const ModelsStoreProvider = (args: {
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
 * useModelsStore is a hook that returns the StateStore provided by the ModelsStoreProvider.
 * If no store is provided, it returns the default StateStore.
 *
 * @returns The StateStore instance provided by the ModelsStoreProvider.
 */
export const useModelsStore = () => {
    const store = useContext(StoreContext)

    return store ?? StateStore.defaultStore
}
